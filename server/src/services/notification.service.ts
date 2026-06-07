import Notification from '../models/Notification';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'order' | 'payment' | 'delivery' | 'promo' | 'system' | 'chat' = 'system',
  link?: string,
  metadata?: Record<string, unknown>
) => {
  return Notification.create({ user: userId, title, message, type, link, metadata });
};

export const notifyOrderUpdate = async (userId: string, orderNumber: string, status: string) => {
  return createNotification(
    userId,
    'Order Update',
    `Your order #${orderNumber} is now ${status.replace(/_/g, ' ')}`,
    'order',
    `/account/orders/${orderNumber}`,
    { orderNumber, status }
  );
};

export const notifyPaymentUpdate = async (userId: string, orderNumber: string, status: string) => {
  return createNotification(
    userId,
    'Payment Update',
    `Payment for order #${orderNumber}: ${status}`,
    'payment',
    `/account/orders/${orderNumber}`
  );
};

export const notifyNewChatMessage = async (userId: string, senderName: string) => {
  return createNotification(
    userId,
    'New Message',
    `${senderName} sent you a message`,
    'chat',
    '/account/chat'
  );
};
