import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db('Tanker_products');
    const collection = db.collection('products');

    if (req.method === 'GET') {
      const { id } = req.query;
      const product = await collection.findOne({ _id: new ObjectId(id) });
      if (!product) {
        res.status(404).json({ error: 'Товар не найден' });
      } else {
        res.status(200).json(product);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении товара' });
  } finally {
    await client.close();
  }
} 