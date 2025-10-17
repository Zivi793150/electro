// Загружаем переменные окружения
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pickupPointsRouter = require('./api/pickup-points');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Middleware
app.use(compression()); // Сжатие ответов
app.use(cors());
app.use(express.json());

// Настройка MIME типов
app.use((req, res, next) => {
  if (req.path.endsWith('.webp')) {
    res.setHeader('Content-Type', 'image/webp');
  } else if (req.path.endsWith('.avif')) {
    res.setHeader('Content-Type', 'image/avif');
  }
  next();
});

// MongoDB подключение
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products?retryWrites=true&w=majority';
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

// Telegram Bot API endpoint
app.post('/api/send-telegram', async (req, res) => {
  try {
    const { name, phone, message, product } = req.body;
    
    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken) {
      console.error('Telegram bot token не настроен');
      return res.status(500).json({ error: 'Telegram bot не настроен' });
    }
    
    // Формируем сообщение
    const telegramMessage = `
🔔 Новая заявка с сайта!

👤 Имя: ${name}
📞 Телефон: ${phone}
💬 Сообщение: ${message || 'Не указано'}
${product ? `🛍️ Товар: ${product}` : ''}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
🌐 Источник: ${req.headers.referer || 'Прямой переход'}
    `;
    
    let success = false;
    
    // Если указан Chat ID - отправляем туда
    if (chatId) {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      });
      
      const result = await response.json();
      success = result.ok;
      
      if (!success) {
        console.error('Ошибка Telegram API:', result);
      }
    } else {
      // Если Chat ID не указан - сохраняем в лог
      console.log('Telegram сообщение (Chat ID не настроен):', telegramMessage);
      success = true; // Считаем успешным, так как логируем
    }
    
    if (success) {
      res.json({ success: true, message: 'Сообщение отправлено в Telegram' });
    } else {
      res.status(500).json({ error: 'Ошибка отправки в Telegram' });
    }
    
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    res.status(500).json({ error: 'Ошибка отправки в Telegram' });
  }
});

// Роуты для пунктов самовывоза
app.use('/api/pickup-points', pickupPointsRouter);

// Настройки кэширования для статических файлов
const cacheControl = (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  
  if (ext === '.css' || ext === '.js') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
  } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp' || ext === '.svg') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
  } else if (ext === '.woff' || ext === '.woff2' || ext === '.ttf' || ext === '.otf') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
  } else if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 час
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 день
  }
  
  next();
};

// Обслуживание статических файлов из папки uploads с кэшированием
app.use('/uploads', cacheControl, express.static(path.join(__dirname, 'uploads')));

// Обслуживание статических файлов из папки public с кэшированием
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    const ext = require('path').extname(path).toLowerCase();
    
    if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp' || ext === '.svg' || ext === '.avif') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.woff' || ext === '.woff2' || ext === '.ttf' || ext === '.otf') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 час
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 день
    }
  }
}));

// Обслуживание статических файлов из папки build с кэшированием
app.use(express.static(path.join(__dirname, '../build'), {
  setHeaders: (res, path) => {
    const ext = require('path').extname(path).toLowerCase();
    
    if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp' || ext === '.svg' || ext === '.avif') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.woff' || ext === '.woff2' || ext === '.ttf' || ext === '.otf') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 час
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 день
    }
  }
}));

// Обслуживание статических файлов из папки public с кэшированием
app.use('/images', express.static(path.join(__dirname, '../public/images'), {
  setHeaders: (res, path) => {
    const ext = require('path').extname(path).toLowerCase();
    
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp' || ext === '.svg' || ext === '.avif') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
    }
  }
}));

// Поддержка React Router - все остальные запросы направляем на index.html
app.get('*', (req, res) => {
  // Проверяем, что это не API запрос
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint не найден' });
  }
  
  // Проверяем, что это не статический файл
  const ext = path.extname(req.path).toLowerCase();
  if (ext && ext !== '.html') {
    return res.status(404).json({ error: 'Файл не найден' });
  }
  
  // Отправляем index.html для всех остальных запросов (React Router)
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});