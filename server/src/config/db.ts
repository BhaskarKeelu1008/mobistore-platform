import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('ENOTFOUND') && env.mongodbUri.includes('YOUR_CLUSTER')) {
      console.error(
        'MongoDB connection error: MONGODB_URI contains placeholder YOUR_CLUSTER.\n' +
          'Set the real Atlas URI in Render → Environment (copy from Atlas Connect or your local server/.env).'
      );
    } else {
      console.error('MongoDB connection error:', error);
    }

    process.exit(1);
  }
};
