import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import Message from '../models/Message';
import Chat from '../models/Chat';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.frontendUrl, credentials: true },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string; role: string };
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    socket.join(`user:${userId}`);

    if (['admin', 'staff', 'superadmin'].includes(socket.userRole || '')) {
      socket.join('admin-room');
    }

    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('send_message', async (data: {
      chatId: string;
      content: string;
      messageType?: string;
      attachments?: string[];
    }) => {
      try {
        const chat = await Chat.findById(data.chatId);
        if (!chat) return;

        const isAdmin = ['admin', 'staff', 'superadmin'].includes(socket.userRole || '');
        const senderRole = isAdmin ? 'admin' : 'customer';

        const message = await Message.create({
          chat: data.chatId,
          sender: userId,
          senderRole,
          content: data.content,
          messageType: data.messageType || 'text',
          attachments: data.attachments,
        });

        chat.lastMessage = data.content;
        chat.lastMessageAt = new Date();
        if (isAdmin) chat.unreadCustomer += 1;
        else chat.unreadAdmin += 1;
        await chat.save();

        const populated = await Message.findById(message._id).populate('sender', 'name avatar role');
        io.to(`chat:${data.chatId}`).emit('new_message', populated);
        io.to('admin-room').emit('chat_update', { chatId: data.chatId, lastMessage: data.content });

        if (isAdmin) {
          io.to(`user:${chat.customer}`).emit('notification', {
            title: 'New Message',
            message: 'You have a new message from shop admin',
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('typing', {
        userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('mark_read', async (data: { chatId: string }) => {
      await Message.updateMany(
        { chat: data.chatId, sender: { $ne: userId }, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      socket.to(`chat:${data.chatId}`).emit('messages_read', { chatId: data.chatId, readBy: userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};
