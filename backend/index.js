const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Tanker_tools';
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB подключена'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ message: 'Backend работает!', timestamp: new Date().toISOString() });
});

// Модель продукта
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

// Модель настроек сайта
const settingsSchema = new mongoose.Schema({
  city: { type: String, default: 'Алматы' },
  deliveryInfo: {
    freeDelivery: { type: String, default: 'Бесплатная доставка по городу' },
    freeDeliveryNote: { type: String, default: 'Сегодня — БЕСПЛАТНО' },
    pickupAddress: { type: String, default: 'ул. Толе би 216Б' },
    pickupInfo: { type: String, default: 'Сегодня с 9:00 до 18:00 — больше 5' },
    deliveryNote: { type: String, default: 'Срок доставки рассчитывается менеджером после оформления заказа' }
  },
  contactInfo: {
    phone: { type: String, default: '+7 707 703-31-13' },
    phoneName: { type: String, default: 'Виталий' },
    officePhone: { type: String, default: '+7 727 347 07 53' },
    officeName: { type: String, default: 'Офис' },
    address: { type: String, default: 'ул. Казыбаева 9/1 г. Алматы' },
    email: { type: String, default: 'info@промкраска.kz' }
  },
  companyInfo: {
    name: { type: String, default: 'ТОО «Long Partners»' },
    bin: { type: String, default: '170540006129' },
    iik: { type: String, default: 'KZ256018861000677041' },
    kbe: { type: String, default: '17' },
    bank: { type: String, default: 'АО «Народный Банк Казахстана»' }
  }
}, { collection: 'settings' });

const Settings = mongoose.model('Settings', settingsSchema);

// API endpoint для получения всех продуктов с поддержкой лимита
app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const products = await Product.find().limit(limit);
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения продуктов:', err);
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

// API endpoint для получения одного продукта по id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    console.error('Ошибка получения продукта:', err);
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
});

// API endpoint для создания нового продукта
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Ошибка создания продукта:', err);
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

// API endpoint для обновления продукта
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    console.error('Ошибка обновления продукта:', err);
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

// API endpoint для удаления продукта
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ success: true, message: 'Товар удален' });
  } catch (err) {
    console.error('Ошибка удаления продукта:', err);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

// API endpoint для получения настроек сайта
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Если настроек нет, создаем с дефолтными значениями
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json({ settings });
  } catch (err) {
    console.error('Ошибка получения настроек:', err);
    res.status(500).json({ error: 'Ошибка при получении настроек' });
  }
});

// API endpoint для сохранения настроек сайта
app.post('/api/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Данные настроек не предоставлены' });
    }
    
    let existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      // Обновляем существующие настройки
      Object.assign(existingSettings, settings);
      await existingSettings.save();
    } else {
      // Создаем новые настройки
      existingSettings = new Settings(settings);
      await existingSettings.save();
    }
    
    res.json({ success: true, settings: existingSettings });
  } catch (err) {
    console.error('Ошибка сохранения настроек:', err);
    res.status(500).json({ error: 'Ошибка при сохранении настроек' });
  }
});



// API endpoint для загрузки файлов (перенаправляем на основной хостинг)
app.post('/api/upload', (req, res) => {
  res.status(400).json({ 
    error: 'Загрузка файлов должна производиться на основном хостинге',
    message: 'Используйте /api/upload на основном домене'
  });
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (максимум 10MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

mongoose.connection.once('open', () => {
  console.log('MongoDB подключена успешно');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 