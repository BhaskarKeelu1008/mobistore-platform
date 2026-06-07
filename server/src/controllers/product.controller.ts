import { Response } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import User from '../models/User';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse, getPagination } from '../utils/helpers';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sort, search, category, brand, minPrice, maxPrice, rating, ram, storage, color, availability } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page as string, limit as string);

  const filter: Record<string, unknown> = { isActive: true };

  if (search) filter.$text = { $search: search as string };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) (filter.basePrice as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.basePrice as Record<string, number>).$lte = Number(maxPrice);
  }
  if (rating) filter.averageRating = { $gte: Number(rating) };
  if (availability === 'in_stock') filter.totalStock = { $gt: 0 };
  if (ram) filter['variants.ram'] = ram;
  if (storage) filter['variants.storage'] = storage;
  if (color) filter['variants.color'] = color;

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case 'price_asc': sortOption = { basePrice: 1 }; break;
    case 'price_desc': sortOption = { basePrice: -1 }; break;
    case 'popular': sortOption = { soldCount: -1 }; break;
    case 'rating': sortOption = { averageRating: -1 }; break;
    case 'latest': sortOption = { createdAt: -1 }; break;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category brand').sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'Products fetched', products, {
    page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum),
  });
});

export const getProductBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category brand');

  if (!product) throw new AppError('Product not found', 404);

  product.viewCount += 1;
  await product.save();

  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { recentlyViewed: product._id },
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { recentlyViewed: { $each: [product._id], $slice: -10 } },
    });
  }

  const [reviews, similarProducts] = await Promise.all([
    Review.find({ product: product._id, isApproved: true }).populate('user', 'name avatar').limit(10),
    Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).limit(8),
  ]);

  sendResponse(res, 200, 'Product fetched', { product, reviews, similarProducts });
});

export const getFeaturedProducts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).populate('brand').limit(12);
  sendResponse(res, 200, 'Featured products fetched', products);
});

export const getTrendingProducts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const products = await Product.find({ isTrending: true, isActive: true }).populate('brand').limit(12);
  sendResponse(res, 200, 'Trending products fetched', products);
});

export const getLatestProducts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const products = await Product.find({ isActive: true }).populate('brand').sort({ createdAt: -1 }).limit(12);
  sendResponse(res, 200, 'Latest products fetched', products);
});

export const searchSuggestions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query;
  if (!q) return sendResponse(res, 200, 'No query', []);

  const products = await Product.find(
    { $text: { $search: q as string }, isActive: true },
    { score: { $meta: 'textScore' }, name: 1, slug: 1, images: 1, basePrice: 1, discountPrice: 1 }
  ).sort({ score: { $meta: 'textScore' } }).limit(8);

  sendResponse(res, 200, 'Suggestions fetched', products);
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.create(req.body);
  sendResponse(res, 201, 'Product created', product);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  sendResponse(res, 200, 'Product updated', product);
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  sendResponse(res, 200, 'Product deleted');
});

export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, title, comment, images } = req.body;
  const productId = req.params.id;

  const existing = await Review.findOne({ product: productId, user: req.user!.id });
  if (existing) throw new AppError('You already reviewed this product', 400);

  const review = await Review.create({
    product: productId,
    user: req.user!.id,
    rating,
    title,
    comment,
    images,
  });

  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  sendResponse(res, 201, 'Review added', review);
});

export const getRecentlyViewed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).populate('recentlyViewed');
  sendResponse(res, 200, 'Recently viewed fetched', user?.recentlyViewed || []);
});
