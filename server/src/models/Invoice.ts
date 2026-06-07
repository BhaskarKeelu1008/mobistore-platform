import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: {
    name: string;
    hsnCode?: string;
    quantity: number;
    price: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    total: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  discount: number;
  shippingCharges: number;
  grandTotal: number;
  shopDetails: {
    name: string;
    address: string;
    gstin?: string;
    phone: string;
    email: string;
  };
  customerDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  pdfUrl?: string;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      name: String,
      hsnCode: String,
      quantity: Number,
      price: Number,
      gstRate: Number,
      cgst: Number,
      sgst: Number,
      total: Number,
    }],
    subtotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    shopDetails: {
      name: String,
      address: String,
      gstin: String,
      phone: String,
      email: String,
    },
    customerDetails: {
      name: String,
      address: String,
      phone: String,
      email: String,
    },
    paymentMethod: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
