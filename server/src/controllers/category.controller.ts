import { Response } from 'express';
import Category from '../models/Category';
import Brand from '../models/Brand';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
  sendResponse(res, 200, 'Categories fetched', categories);
});

export const getCategoryBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw new AppError('Category not found', 404);
  sendResponse(res, 200, 'Category fetched', category);
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.create(req.body);
  sendResponse(res, 201, 'Category created', category);
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  sendResponse(res, 200, 'Category updated', category);
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  sendResponse(res, 200, 'Category deleted');
});

export const getBrands = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const brands = await Brand.find({ isActive: true }).sort({ sortOrder: 1 });
  sendResponse(res, 200, 'Brands fetched', brands);
});

export const getBrandBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) throw new AppError('Brand not found', 404);
  sendResponse(res, 200, 'Brand fetched', brand);
});

export const createBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await Brand.create(req.body);
  sendResponse(res, 201, 'Brand created', brand);
});

export const updateBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) throw new AppError('Brand not found', 404);
  sendResponse(res, 200, 'Brand updated', brand);
});

export const deleteBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Brand.findByIdAndUpdate(req.params.id, { isActive: false });
  sendResponse(res, 200, 'Brand deleted');
});
