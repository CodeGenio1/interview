import mongoose from 'mongoose';

export async function setupDb() {
  await mongoose.connect(process.env.MONGODB_URI!);
};