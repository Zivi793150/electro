import { connectToDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const { id } = req.query;
  try {
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
} 