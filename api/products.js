import { connectToDatabase } from './mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const limit = parseInt(req.query.limit) || 0;
  const products = await db.collection('products').find({}).limit(limit).toArray();
  res.status(200).json(products);
} 