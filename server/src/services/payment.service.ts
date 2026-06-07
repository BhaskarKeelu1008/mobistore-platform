import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = (): Razorpay => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpaySecret,
    });
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async (amount: number, receipt: string, notes?: Record<string, string>) => {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
    notes,
  });
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpaySecret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

export const createRefund = async (paymentId: string, amount: number) => {
  const razorpay = getRazorpay();
  return razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) });
};
