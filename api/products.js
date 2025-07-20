import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db('Tanker_products'); // Имя базы
    const collection = db.collection('products');

    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit) || 0;
      const products = await collection.find({}).limit(limit).toArray();
      res.status(200).json(products);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  } finally {
    await client.close();
  }
} 