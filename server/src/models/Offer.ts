import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description?: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products: mongoose.Types.ObjectId[];
  categories: mongoose.Types.ObjectId[];
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  isFlashSale: boolean;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isFlashSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>('Offer', offerSchema);
