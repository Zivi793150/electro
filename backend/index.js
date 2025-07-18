const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Tanker_tools';
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB подключена'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Backend работает!');
});

// Модель продукта
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

// API endpoint для получения всех продуктов
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 