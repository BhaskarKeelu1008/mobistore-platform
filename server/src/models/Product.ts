import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  color?: string;
  storage?: string;
  ram?: string;
  sku: string;
  barcode?: string;
  price: number;
  discountPrice?: number;
  flashSalePrice?: number;
  stock: number;
  images: string[];
}

export interface IProductSpec {
  label: string;
  value: string;
}

export interface IProductFAQ {
  question: string;
  answer: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  images: string[];
  variants: IProductVariant[];
  basePrice: number;
  discountPrice?: number;
  flashSalePrice?: number;
  flashSaleEnd?: Date;
  gstRate: number;
  hsnCode?: string;
  warranty?: string;
  returnPolicy?: string;
  deliveryCharges: number;
  emiAvailable: boolean;
  emiOptions?: number[];
  specifications: IProductSpec[];
  faqs: IProductFAQ[];
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  totalStock: number;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  soldCount: number;
}

const variantSchema = new Schema<IProductVariant>({
  color: { type: String },
  storage: { type: String },
  ram: { type: String },
  sku: { type: String, required: true },
  barcode: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  flashSalePrice: { type: Number },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    images: [{ type: String }],
    variants: [variantSchema],
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    flashSalePrice: { type: Number },
    flashSaleEnd: { type: Date },
    gstRate: { type: Number, default: 18 },
    hsnCode: { type: String },
    warranty: { type: String },
    returnPolicy: { type: String },
    deliveryCharges: { type: Number, default: 0 },
    emiAvailable: { type: Boolean, default: false },
    emiOptions: [{ type: Number }],
    specifications: [{ label: String, value: String }],
    faqs: [{ question: String, answer: String }],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, brand: 1, isActive: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
