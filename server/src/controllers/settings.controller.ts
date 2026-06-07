import { Response } from 'express';
import Settings from '../models/Settings';
import Banner from '../models/Banner';
import Offer from '../models/Offer';
import Coupon from '../models/Coupon';
import DeliveryZone from '../models/DeliveryZone';
import Supplier from '../models/Supplier';
import User from '../models/User';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/helpers';
import { addStock } from '../services/inventory.service';

export const getSettings = asyncHandler(async (_req: AuthRequest, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  sendResponse(res, 200, 'Settings fetched', settings);
});

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  sendResponse(res, 200, 'Settings updated', settings);
});

export const getBanners = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
  sendResponse(res, 200, 'Banners fetched', banners);
});

export const getAllBanners = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const banners = await Banner.find().sort({ sortOrder: 1 });
  sendResponse(res, 200, 'All banners fetched', banners);
});

export const createBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banner = await Banner.create(req.body);
  sendResponse(res, 201, 'Banner created', banner);
});

export const updateBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) throw new AppError('Banner not found', 404);
  sendResponse(res, 200, 'Banner updated', banner);
});

export const deleteBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Banner.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, 'Banner deleted');
});

export const getOffers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const offers = await Offer.find({ isActive: true, validUntil: { $gte: new Date() } });
  sendResponse(res, 200, 'Offers fetched', offers);
});

export const getAllOffers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const offers = await Offer.find().populate('products categories');
  sendResponse(res, 200, 'All offers fetched', offers);
});

export const createOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const offer = await Offer.create(req.body);
  sendResponse(res, 201, 'Offer created', offer);
});

export const updateOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendResponse(res, 200, 'Offer updated', offer);
});

export const getCoupons = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const coupons = await Coupon.find({ isActive: true });
  sendResponse(res, 200, 'Coupons fetched', coupons);
});

export const createCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.create(req.body);
  sendResponse(res, 201, 'Coupon created', coupon);
});

export const updateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendResponse(res, 200, 'Coupon updated', coupon);
});

export const getDeliveryZones = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const zones = await DeliveryZone.find({ isActive: true });
  sendResponse(res, 200, 'Delivery zones fetched', zones);
});

export const createDeliveryZone = asyncHandler(async (req: AuthRequest, res: Response) => {
  const zone = await DeliveryZone.create(req.body);
  sendResponse(res, 201, 'Delivery zone created', zone);
});

export const getSuppliers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const suppliers = await Supplier.find({ isActive: true });
  sendResponse(res, 200, 'Suppliers fetched', suppliers);
});

export const createSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await Supplier.create(req.body);
  sendResponse(res, 201, 'Supplier created', supplier);
});

export const addInventory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity, variantSku, supplierId, notes } = req.body;
  const product = await addStock(productId, quantity, variantSku, req.user!.id, 'purchase', supplierId, notes);
  sendResponse(res, 200, 'Inventory added', product);
});

export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  sendResponse(res, 201, 'Address added', user.addresses);
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  const address = user.addresses.find((a) => a._id?.toString() === req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);

  Object.assign(address, req.body);
  await user.save();
  sendResponse(res, 200, 'Address updated', address);
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId);
  await user.save();
  sendResponse(res, 200, 'Address deleted');
});

export const toggleWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);

  const productId = req.params.productId;
  const index = user.wishlist.findIndex((id) => id.toString() === productId);

  if (index > -1) {
    user.wishlist.splice(index, 1);
    await user.save();
    sendResponse(res, 200, 'Removed from wishlist', { inWishlist: false });
  } else {
    user.wishlist.push(productId as unknown as typeof user.wishlist[0]);
    await user.save();
    sendResponse(res, 200, 'Added to wishlist', { inWishlist: true });
  }
});

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).populate('wishlist');
  sendResponse(res, 200, 'Wishlist fetched', user?.wishlist || []);
});

export const subscribeNewsletter = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendResponse(res, 200, 'Successfully subscribed to newsletter', { email: req.body.email });
});

export const getCMSContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await Settings.findOne();
  const page = req.params.page as keyof NonNullable<typeof settings>['cms'];
  const cms = settings?.cms || {};
  sendResponse(res, 200, 'CMS content fetched', { page, content: cms[page as keyof typeof cms], faq: cms.faq });
});
