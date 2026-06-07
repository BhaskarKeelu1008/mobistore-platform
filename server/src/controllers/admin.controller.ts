import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';
import Notification from '../models/Notification';
import Chat from '../models/Chat';
import InventoryLog from '../models/InventoryLog';
import { AuthRequest, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';
import { getLowStockProducts } from '../services/inventory.service';
import { streamInvoicePDF } from '../services/invoice.service';

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    monthlyOrders,
    weeklyOrders,
    revenueData,
    topProducts,
    recentOrders,
    pendingChats,
    lowStock,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'pending'] }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } },
    ]),
    Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5).select('name soldCount basePrice images'),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(10),
    Chat.countDocuments({ status: 'open', unreadAdmin: { $gt: 0 } }),
    getLowStockProducts(10),
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: { $in: ['paid', 'pending'] } } },
    { $group: { _id: { $dayOfMonth: '$createdAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  sendResponse(res, 200, 'Dashboard stats fetched', {
    totalOrders,
    totalCustomers,
    totalProducts,
    monthlyOrders,
    weeklyOrders,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    avgOrderValue: revenueData[0]?.avgOrderValue || 0,
    topProducts,
    recentOrders,
    pendingChats,
    lowStock,
    monthlyRevenue,
  });
});

export const getSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const match: Record<string, unknown> = { paymentStatus: { $in: ['paid', 'pending'] } };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) (match.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
    if (endDate) (match.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
  }

  const groupId = groupBy === 'month'
    ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
    : groupBy === 'week'
    ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
    : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

  const report = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        avgOrder: { $avg: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendResponse(res, 200, 'Sales report fetched', report);
});

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Customers fetched', customers);
});

export const getPayments = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const payments = await Payment.find().populate('order user', 'orderNumber name email').sort({ createdAt: -1 }).limit(100);
  sendResponse(res, 200, 'Payments fetched', payments);
});

export const getInvoices = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const invoices = await Invoice.find().populate('order user').sort({ createdAt: -1 }).limit(100);
  sendResponse(res, 200, 'Invoices fetched', invoices);
});

export const downloadInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber });
  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }
  streamInvoicePDF(invoice, res);
});

export const getInventoryLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = await InventoryLog.find()
    .populate('product', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(100);
  sendResponse(res, 200, 'Inventory logs fetched', logs);
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(50);
  sendResponse(res, 200, 'Notifications fetched', notifications);
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  sendResponse(res, 200, 'Notification marked as read');
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ user: req.user!.id, isRead: false }, { isRead: true });
  sendResponse(res, 200, 'All notifications marked as read');
});

export const getUnreadCounts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const isStaff = ['admin', 'staff', 'superadmin'].includes(role);

  const notificationCount = await Notification.countDocuments({ user: userId, isRead: false });

  let chatCount = 0;
  if (isStaff) {
    const staffChats = await Chat.find({ status: { $ne: 'closed' } }).select('unreadAdmin');
    chatCount = staffChats.reduce((sum, chat) => sum + (chat.unreadAdmin || 0), 0);
  } else {
    const customerChats = await Chat.find({ customer: userId, status: { $ne: 'closed' } }).select('unreadCustomer');
    chatCount = customerChats.reduce((sum, chat) => sum + (chat.unreadCustomer || 0), 0);
  }

  sendResponse(res, 200, 'Unread counts fetched', {
    notifications: notificationCount,
    chat: chatCount,
  });
});

export const getStaffUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const staff = await User.find({ role: { $in: ['admin', 'staff', 'superadmin'] } });
  sendResponse(res, 200, 'Staff fetched', staff);
});

export const createStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role: role || 'staff', isVerified: true });
  sendResponse(res, 201, 'Staff created', { id: user._id, name: user.name, email: user.email, role: user.role });
});

export const updateStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendResponse(res, 200, 'Staff updated', user);
});
