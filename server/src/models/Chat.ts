import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  customer: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  subject?: string;
  product?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  status: 'open' | 'closed' | 'pending';
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCustomer: number;
  unreadAdmin: number;
  isBot: boolean;
}

const chatSchema = new Schema<IChat>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCustomer: { type: Number, default: 0 },
    unreadAdmin: { type: Number, default: 0 },
    isBot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', chatSchema);
