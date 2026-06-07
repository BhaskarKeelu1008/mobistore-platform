import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!env.smtpUser) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"MobiStore" <${env.smtpUser}>`,
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Order Confirmed!</h2>
      <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
      <p>Total Amount: <strong>₹${total.toLocaleString('en-IN')}</strong></p>
      <p>Thank you for shopping with MobiStore!</p>
    </div>
  `;
  await sendEmail(email, `Order Confirmed - #${orderNumber}`, html);
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    </div>
  `;
  await sendEmail(email, 'Password Reset - MobiStore', html);
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your OTP</h2>
      <p>Your verification OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>Valid for 10 minutes.</p>
    </div>
  `;
  await sendEmail(email, 'OTP Verification - MobiStore', html);
};
