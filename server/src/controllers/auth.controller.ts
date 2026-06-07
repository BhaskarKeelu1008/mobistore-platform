import { Response } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';
import { generateAccessToken, generateRefreshToken, generateOTP, verifyRefreshToken } from '../utils/jwt';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/email.service';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, phone, password, role: 'customer' });
  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  sendResponse(res, 201, 'Registration successful', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  sendResponse(res, 200, 'Login successful', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    accessToken,
    refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required', 400);

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save();

  sendResponse(res, 200, 'Token refreshed', { accessToken, refreshToken: newRefreshToken });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  }
  sendResponse(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  sendResponse(res, 200, 'Profile fetched', { user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  sendResponse(res, 200, 'Profile updated', { user });
});

export const sendOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, phone } = req.body;
  let user: IUser | null = await User.findOne(email ? { email } : { phone }).select('+otp +otpExpiry');

  if (!user && phone) {
    const created = await User.create({
      name: `User ${phone.slice(-4)}`,
      email: `${phone}@mobistore.temp`,
      phone,
      password: crypto.randomBytes(16).toString('hex'),
      role: 'customer',
    });
    user = (await User.findById(created._id).select('+otp +otpExpiry')) as IUser | null;
  }

  if (!user) throw new AppError('User not found', 404);

  const otp = generateOTP();
  user!.otp = otp;
  user!.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user!.save();

  if (email) await sendOTPEmail(email, otp);

  sendResponse(res, 200, 'OTP sent successfully', { ...(process.env.NODE_ENV === 'development' && { otp }) });
});

export const verifyOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, phone, otp } = req.body;
  const user = await User.findOne(email ? { email } : { phone }).select('+otp +otpExpiry +refreshToken');

  if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true;

  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();

  sendResponse(res, 200, 'OTP verified', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpiry');
  if (!user) throw new AppError('No account found with this email', 404);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(email, resetToken);
  sendResponse(res, 200, 'Password reset email sent');
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  sendResponse(res, 200, 'Password reset successful');
});

export const googleLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { googleId, email, name, avatar } = req.body;

  let user: IUser | null = await User.findOne({ $or: [{ googleId }, { email }] }).select('+refreshToken');

  if (!user) {
    const created = await User.create({
      name,
      email,
      googleId,
      avatar,
      password: crypto.randomBytes(16).toString('hex'),
      isVerified: true,
      role: 'customer',
    });
    user = (await User.findById(created._id).select('+refreshToken')) as IUser | null;
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.avatar = avatar || user.avatar;
    await user.save();
  }

  const payload = { id: user!._id.toString(), email: user!.email, role: user!.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user!.refreshToken = refreshToken;
  await user!.save();

  sendResponse(res, 200, 'Google login successful', {
    user: { id: user!._id, name: user!.name, email: user!.email, role: user!.role, avatar: user!.avatar },
    accessToken,
    refreshToken,
  });
});
