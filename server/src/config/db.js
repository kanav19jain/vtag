import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[vtag] MongoDB connected');
    return true;
  } catch (error) {
    console.error(`[vtag] MongoDB connection failed: ${error.message}`);
    console.error('[vtag] Start MongoDB or set MONGODB_URI to a reachable instance.');
    return false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
