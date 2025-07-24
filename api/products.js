import { connectToDatabase } from './mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    const limit = parseInt(req.query.limit) || 0;
    const products = await db.collection('products').find({}).limit(limit).toArray();
    res.status(200).json(products);
    return;
  }

  if (req.method === 'POST') {
    try {
      const product = req.body;
      const result = await db.collection('products').insertOne(product);
      res.status(201).json({ _id: result.insertedId, ...product });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка при добавлении товара' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Метод ${req.method} не разрешён`);
} 