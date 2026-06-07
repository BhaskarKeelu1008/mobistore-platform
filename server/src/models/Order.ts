import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  variant?: {
    color?: string;
    storage?: string;
    ram?: string;
    sku: string;
  };
  quantity: number;
  price: number;
  discountPrice?: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharges: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryOtp?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  trackingUpdates: { status: string; message: string; timestamp: Date }[];
  assignedDeliveryBoy?: mongoose.Types.ObjectId;
  notes?: string;
  invoiceNumber?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  variant: {
    color: String,
    storage: String,
    ram: String,
    sku: String,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingCharges: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod', 'upi'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    deliveryOtp: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    trackingUpdates: [{
      status: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
    }],
    assignedDeliveryBoy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    invoiceNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
