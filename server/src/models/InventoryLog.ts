import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLog extends Document {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  supplier?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'adjustment', 'damage'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reference: { type: String },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);
