import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: 'customer' | 'admin' | 'bot';
  content: string;
  messageType: 'text' | 'image' | 'product' | 'order' | 'auto_reply';
  attachments?: string[];
  product?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'admin', 'bot'], required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['text', 'image', 'product', 'order', 'auto_reply'],
      default: 'text',
    },
    attachments: [{ type: String }],
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
