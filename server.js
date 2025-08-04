const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pickupPointsRouter = require('./api/pickup-points');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB подключение
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Tanker_tools';
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB подключена'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Модель продукта
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}_${randomString}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// API Routes

// Получение всех продуктов
app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const products = await Product.find().limit(limit);
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения продуктов:', err);
    res.status(500).json({ error: 'Ошибка получения продуктов' });
  }
});

// Получение одного продукта по ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    console.error('Ошибка получения продукта:', err);
    res.status(500).json({ error: 'Ошибка получения продукта' });
  }
});

// Создание нового продукта
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Ошибка создания продукта:', err);
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

// Обновление продукта
app.put('/api/products/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body; // Убираем _id из данных обновления
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    console.error('Ошибка обновления продукта:', err);
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

// Удаление продукта
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ message: 'Товар успешно удален' });
  } catch (err) {
    console.error('Ошибка удаления продукта:', err);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

// Загрузка файлов
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      files: [fileUrl],
      message: 'Файл успешно загружен'
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла: ' + error.message });
  }
});

// Роуты для пунктов самовывоза
app.use('/api/pickup-points', pickupPointsRouter);

// Обслуживание статических файлов из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Тестовый endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API работает!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});