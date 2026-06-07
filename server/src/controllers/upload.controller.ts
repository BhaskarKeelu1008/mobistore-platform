import multer from 'multer';
import { Response } from 'express';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';
import { uploadToCloudinary } from '../services/upload.service';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const folder = (req.query.folder as string) || 'mobistore';
  const result = await uploadToCloudinary(req.file.buffer, folder);
  sendResponse(res, 200, 'Image uploaded', result);
});

export const uploadMultipleImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new AppError('No files uploaded', 400);
  const folder = (req.query.folder as string) || 'mobistore';
  const results = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer, folder)));
  sendResponse(res, 200, 'Images uploaded', results);
});
