import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryZone extends Document {
  name: string;
  pincodes: string[];
  charge: number;
  estimatedDays: number;
  isActive: boolean;
}

const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true },
    pincodes: [{ type: String }],
    charge: { type: Number, default: 49 },
    estimatedDays: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
