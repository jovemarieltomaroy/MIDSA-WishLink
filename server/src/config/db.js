import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB Atlas connection string.');
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  await mongoose.connect(uri, dbName ? { dbName } : {});
  console.log('MongoDB Atlas connected');
}
