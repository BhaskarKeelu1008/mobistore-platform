import { Response } from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import Coupon from '../models/Coupon';
import Product from '../models/Product';
import Settings from '../models/Settings';
import User from '../models/User';
import { AuthRequest, AppError, asyncHandler } from '../utils/asyncHandler';
import { sendResponse, getPagination, generateOrderNumber, calculateGST } from '../utils/helpers';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/payment.service';
import { deductStock } from '../services/inventory.service';
import { generateInvoiceFromOrder } from '../services/invoice.service';
import { sendOrderConfirmationEmail } from '../services/email.service';
import { notifyOrderUpdate, notifyPaymentUpdate } from '../services/notification.service';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;
  const settings = await Settings.findOne();

  let subtotal = 0;
  let totalGst = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new AppError(`Product not found: ${item.productId}`, 404);

    let price = product.discountPrice || product.basePrice;
    let variant;
    if (item.variantSku) {
      variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) throw new AppError('Variant not found', 404);
      if (variant.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
      price = variant.discountPrice || variant.flashSalePrice || variant.price;
    } else if (product.totalStock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const itemTotal = price * item.quantity;
    const gst = calculateGST(itemTotal, product.gstRate);
    subtotal += itemTotal;
    totalGst += gst.gstAmount;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      variant: variant ? { color: variant.color, storage: variant.storage, ram: variant.ram, sku: variant.sku } : undefined,
      quantity: item.quantity,
      price,
      discountPrice: product.discountPrice,
      gstRate: product.gstRate,
      gstAmount: gst.gstAmount,
      total: itemTotal + gst.gstAmount,
    });
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.validFrom <= new Date() && coupon.validUntil >= new Date()) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const shippingCharges = subtotal >= (settings?.shipping.freeShippingAbove || 999)
    ? 0
    : settings?.shipping.defaultShippingCharge || 49;

  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const total = subtotal + totalGst + shippingCharges - discount;

  const orderNumber = generateOrderNumber();
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const order = await Order.create({
    orderNumber,
    user: req.user!.id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    couponCode,
    shippingCharges,
    cgst,
    sgst,
    totalGst,
    total,
    paymentMethod,
    deliveryOtp,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    trackingUpdates: [{ status: 'pending', message: 'Order placed successfully', timestamp: new Date() }],
    notes,
  });

  if (paymentMethod === 'cod') {
    for (const item of items) {
      await deductStock(item.productId, item.quantity, item.variantSku, req.user!.id, orderNumber);
    }
    order.paymentStatus = 'pending';
    order.orderStatus = 'confirmed';
    await order.save();
    await generateInvoiceFromOrder(order, req.user!.id);
    const user = await User.findById(req.user!.id);
    if (user) await sendOrderConfirmationEmail(user.email, orderNumber, total);
    await notifyOrderUpdate(req.user!.id, orderNumber, 'confirmed');
  }

  let razorpayOrder = null;
  if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
    razorpayOrder = await createRazorpayOrder(total, orderNumber, { orderId: order._id.toString() });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    await Payment.create({
      order: order._id,
      user: req.user!.id,
      amount: total,
      method: paymentMethod,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });
  }

  sendResponse(res, 201, 'Order created', { order, razorpayOrder });
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) throw new AppError('Invalid payment signature', 400);

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.razorpayPaymentId = razorpayPaymentId;
  order.trackingUpdates.push({ status: 'confirmed', message: 'Payment received', timestamp: new Date() });
  await order.save();

  await Payment.findOneAndUpdate(
    { order: orderId },
    { status: 'success', razorpayPaymentId, razorpaySignature, transactionId: razorpayPaymentId }
  );

  for (const item of order.items) {
    await deductStock(
      item.product.toString(),
      item.quantity,
      item.variant?.sku,
      req.user!.id,
      order.orderNumber
    );
  }

  await generateInvoiceFromOrder(order, req.user!.id);
  const user = await User.findById(req.user!.id);
  if (user) await sendOrderConfirmationEmail(user.email, order.orderNumber, order.total);
  await notifyPaymentUpdate(req.user!.id, order.orderNumber, 'paid');
  await notifyOrderUpdate(req.user!.id, order.orderNumber, 'confirmed');

  sendResponse(res, 200, 'Payment verified', { order });
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page as string, limit as string);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!.id }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments({ user: req.user!.id }),
  ]);

  sendResponse(res, 200, 'Orders fetched', orders, {
    page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum),
  });
});

export const getOrderByNumber = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('items.product');
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user!.id && !['admin', 'staff', 'superadmin'].includes(req.user!.role)) {
    throw new AppError('Access denied', 403);
  }
  sendResponse(res, 200, 'Order fetched', order);
});

export const trackOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderNumber, phone } = req.query;
  const order = await Order.findOne({ orderNumber, 'shippingAddress.phone': phone });
  if (!order) throw new AppError('Order not found', 404);
  sendResponse(res, 200, 'Order tracking fetched', order);
});

export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, status } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page as string, limit as string);
  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'Orders fetched', orders, {
    page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum),
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderStatus, message, assignedDeliveryBoy } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  order.orderStatus = orderStatus;
  if (assignedDeliveryBoy) order.assignedDeliveryBoy = assignedDeliveryBoy;
  if (orderStatus === 'delivered') order.deliveredAt = new Date();
  order.trackingUpdates.push({
    status: orderStatus,
    message: message || `Order status updated to ${orderStatus}`,
    timestamp: new Date(),
  });
  await order.save();

  await notifyOrderUpdate(order.user.toString(), order.orderNumber, orderStatus);
  sendResponse(res, 200, 'Order status updated', order);
});

export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, amount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) throw new AppError('Invalid coupon code', 400);
  if (coupon.validFrom > new Date() || coupon.validUntil < new Date()) {
    throw new AppError('Coupon expired', 400);
  }
  if (amount < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount is ₹${coupon.minOrderAmount}`, 400);
  }
  if (coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400);

  let discount = coupon.discountType === 'percentage'
    ? (amount * coupon.discountValue) / 100
    : coupon.discountValue;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  sendResponse(res, 200, 'Coupon valid', { coupon, discount });
});

export const retryPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user!.id });
  if (!order) throw new AppError('Order not found', 404);
  if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400);

  const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  sendResponse(res, 200, 'Payment retry initiated', { order, razorpayOrder });
});
