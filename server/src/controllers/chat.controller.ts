import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Settings from '../models/Settings';
import User from '../models/User';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';
import { notifyNewChatMessage } from '../services/notification.service';

const FAQ_BOT_REPLIES: Record<string, string> = {
  hello: 'Hello! Welcome to MobiStore. How can I help you today?',
  hi: 'Hi there! How can we assist you?',
  order: 'You can track your order from My Account > Orders or use the Track Order page with your order number and phone.',
  delivery: 'Standard delivery takes 2-5 business days. Express delivery is available in select cities.',
  return: 'We offer 7-day return policy on most products. Visit our Refund Policy page for details.',
  payment: 'We accept Razorpay, UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery.',
  warranty: 'All mobiles come with manufacturer warranty. Accessories have 6-month shop warranty.',
  default: 'Thank you for your message! Our team will respond shortly. For urgent queries, use our WhatsApp button.',
};

const getBotReply = (message: string): string => {
  const lower = message.toLowerCase();
  for (const [key, reply] of Object.entries(FAQ_BOT_REPLIES)) {
    if (key !== 'default' && lower.includes(key)) return reply;
  }
  return FAQ_BOT_REPLIES.default;
};

export const getOrCreateChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, orderId, subject } = req.body;

  let chat = await Chat.findOne({
    customer: req.user!.id,
    status: { $ne: 'closed' },
    ...(productId && { product: productId }),
    ...(orderId && { order: orderId }),
  }).populate('customer assignedTo product order');

  if (!chat) {
    chat = await Chat.create({
      customer: req.user!.id,
      product: productId,
      order: orderId,
      subject: subject || 'General Inquiry',
      status: 'open',
    });
    chat = await Chat.findById(chat._id).populate('customer assignedTo product order');
  }

  sendResponse(res, 200, 'Chat fetched', chat);
});

export const getMyChats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isAdmin = ['admin', 'staff', 'superadmin'].includes(req.user!.role);
  const filter = isAdmin ? {} : { customer: req.user!.id };

  const chats = await Chat.find(filter)
    .populate('customer', 'name email avatar')
    .populate('assignedTo', 'name')
    .populate('product', 'name slug images')
    .sort({ lastMessageAt: -1 });

  sendResponse(res, 200, 'Chats fetched', chats);
});

export const getChatMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) throw new AppError('Chat not found', 404);

  const isAdmin = ['admin', 'staff', 'superadmin'].includes(req.user!.role);
  if (!isAdmin && chat.customer.toString() !== req.user!.id) {
    throw new AppError('Access denied', 403);
  }

  const messages = await Message.find({ chat: chat._id })
    .populate('sender', 'name avatar role')
    .populate('product', 'name slug images basePrice')
    .sort({ createdAt: 1 });

  if (isAdmin) {
    chat.unreadAdmin = 0;
  } else {
    chat.unreadCustomer = 0;
  }
  await chat.save();

  await Message.updateMany(
    { chat: chat._id, sender: { $ne: req.user!.id }, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendResponse(res, 200, 'Messages fetched', messages);
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content, messageType, attachments, productId, orderId } = req.body;
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) throw new AppError('Chat not found', 404);

  const isAdmin = ['admin', 'staff', 'superadmin'].includes(req.user!.role);
  if (!isAdmin && chat.customer.toString() !== req.user!.id) {
    throw new AppError('Access denied', 403);
  }

  const senderRole = isAdmin ? 'admin' : 'customer';

  const message = await Message.create({
    chat: chat._id,
    sender: req.user!.id,
    senderRole,
    content,
    messageType: messageType || 'text',
    attachments,
    product: productId,
    order: orderId,
  });

  chat.lastMessage = content;
  chat.lastMessageAt = new Date();
  if (isAdmin) {
    chat.unreadCustomer += 1;
    await notifyNewChatMessage(chat.customer.toString(), 'Shop Admin');
  } else {
    chat.unreadAdmin += 1;
    const settings = await Settings.findOne();
    if (settings?.chat.autoReplyEnabled && chat.isBot) {
      const botReply = getBotReply(content);
      await Message.create({
        chat: chat._id,
        sender: req.user!.id,
        senderRole: 'bot',
        content: botReply,
        messageType: 'auto_reply',
      });
      chat.lastMessage = botReply;
      chat.lastMessageAt = new Date();
    }
  }
  await chat.save();

  const populated = await Message.findById(message._id).populate('sender', 'name avatar role');
  sendResponse(res, 201, 'Message sent', populated);
});

export const closeChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, { status: 'closed' }, { new: true });
  if (!chat) throw new AppError('Chat not found', 404);
  sendResponse(res, 200, 'Chat closed', chat);
});

export const assignChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { assignedTo } = req.body;
  const chat = await Chat.findByIdAndUpdate(
    req.params.chatId,
    { assignedTo, isBot: false },
    { new: true }
  );
  if (!chat) throw new AppError('Chat not found', 404);
  sendResponse(res, 200, 'Chat assigned', chat);
});

export const getChatStatus = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const settings = await Settings.findOne();
  sendResponse(res, 200, 'Chat status fetched', {
    enabled: settings?.chat.enabled ?? true,
    adminOnline: settings?.chat.adminOnline ?? true,
    whatsappNumber: settings?.chat.whatsappNumber || settings?.socialLinks?.whatsapp,
    autoReplyEnabled: settings?.chat.autoReplyEnabled ?? true,
  });
});

export const updateAdminOnlineStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { adminOnline } = req.body;
  await Settings.findOneAndUpdate({}, { 'chat.adminOnline': adminOnline }, { upsert: true });
  sendResponse(res, 200, 'Admin status updated', { adminOnline });
});

export const getStaffList = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const staff = await User.find({ role: { $in: ['admin', 'staff'] }, isActive: true }).select('name email avatar role');
  sendResponse(res, 200, 'Staff fetched', staff);
});
