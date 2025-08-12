const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const path = require('path');

const app = express();

// Настройка CORS для разрешения запросов с вашего домена
app.use(cors({
  origin: [
    'https://www.eltok.kz',
    'https://eltok.kz',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Telegram endpoint (Render backend)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
app.post('/api/send-telegram', async (req, res) => {
  try {
    const { name, phone, message, product } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Telegram bot не настроен' });
    }
    const text = `\n🔔 Новая заявка с сайта!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message || 'Не указано'}\n${product ? `🛍️ Товар: ${product}` : ''}\n⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
    const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const result = await tgResp.json();
    if (result.ok) {
      return res.json({ success: true });
    }
    console.error('Telegram error:', result);
    return res.status(500).json({ error: 'Ошибка Telegram API' });
  } catch (e) {
    console.error('Ошибка /api/send-telegram:', e);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Middleware для кеширования статических ресурсов
app.use((req, res, next) => {
  // Кеширование изображений на 1 год
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Кеширование шрифтов на 1 год
  else if (req.path.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Кеширование CSS и JS на 1 месяц
  else if (req.path.match(/\.(css|js)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
  // Кеширование HTML на 1 час
  else if (req.path.match(/\.html?$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  next();
});

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products?retryWrites=true&w=majority';
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

// Модель группы вариаций товаров
const productGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  baseProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variants: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    parameters: { type: Map, of: String }, // Динамические параметры (вольты, с регулятором и т.д.)
    isActive: { type: Boolean, default: true }
  }],
  parameters: [{ // Настраиваемые параметры для группы
    name: { type: String, required: true }, // например "Вольты", "С регулятором"
    type: { type: String, enum: ['select', 'radio', 'checkbox'], default: 'select' },
    values: [String], // возможные значения
    required: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'product_groups' });

const ProductGroup = mongoose.model('ProductGroup', productGroupSchema);

// Модель информации сайта
const informationSchema = new mongoose.Schema({
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
}, { collection: 'information' });

const Information = mongoose.model('Information', informationSchema);

// API endpoint для получения всех продуктов с поддержкой лимита
app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    
    // Получаем все группы вариаций
    const productGroups = await ProductGroup.find();
    
    // Собираем ID всех товаров, которые являются вариациями
    const variantProductIds = new Set();
    // Собираем ID всех мастер-товаров
    const masterProductIds = new Set();
    productGroups.forEach(group => {
      if (group.baseProductId) masterProductIds.add(group.baseProductId.toString());
      group.variants.forEach(variant => {
        if (variant.productId && variant.isActive) {
          variantProductIds.add(variant.productId.toString());
        }
      });
    });
    
    // В каталоге должны быть:
    // 1. Все товары, которые НЕ входят в variants ни одной группы
    // 2. Все товары, которые являются baseProductId хотя бы одной группы
    const products = await Product.find({
      $or: [
        { _id: { $nin: Array.from(variantProductIds) } },
        { _id: { $in: Array.from(masterProductIds) } }
      ]
    }).limit(limit);
    
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

// Импортируем middleware для загрузки
const { upload, convertToWebP, createImageSizes, uploadToPleskMiddleware } = require('./upload');

// API endpoint для загрузки изображений
app.post('/api/upload', upload, convertToWebP, createImageSizes, uploadToPleskMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const response = {
      original: {
        filename: req.file.filename,
        path: req.file.pleskUrl || '',
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      webp: req.file.pleskWebpUrl ? {
        path: req.file.pleskWebpUrl,
        filename: req.file.pleskWebpUrl.split('/').pop()
      } : null,
      variants: req.file.pleskVariants || {},
      message: 'Изображение успешно загружено и оптимизировано'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
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

// API endpoint для получения информации сайта
app.get('/api/information', async (req, res) => {
  try {
    let information = await Information.findOne();
    
    // Если информации нет, создаем с дефолтными значениями
    if (!information) {
      information = new Information();
      await information.save();
    }
    
    res.json({ information });
  } catch (err) {
    console.error('Ошибка получения информации:', err);
    res.status(500).json({ error: 'Ошибка при получении информации' });
  }
});

// API endpoint для сохранения информации сайта
app.post('/api/information', async (req, res) => {
  try {
    const { information } = req.body;
    
    if (!information) {
      return res.status(400).json({ error: 'Данные информации не предоставлены' });
    }
    
    let existingInformation = await Information.findOne();
    
    if (existingInformation) {
      // Обновляем существующую информацию
      Object.assign(existingInformation, information);
      await existingInformation.save();
    } else {
      // Создаем новую информацию
      existingInformation = new Information(information);
      await existingInformation.save();
    }
    
    res.json({ success: true, information: existingInformation });
  } catch (err) {
    console.error('Ошибка сохранения информации:', err);
    res.status(500).json({ error: 'Ошибка при сохранении информации' });
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

// Роуты для пунктов самовывоза
const uri = process.env.MONGO_URI || 'mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products?retryWrites=true&w=majority';

// Тестовый endpoint для проверки подключения
app.get('/api/pickup-points/test', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collections = await database.listCollections().toArray();
    
    await client.close();
    
    res.json({ 
      message: 'Подключение к базе данных успешно',
      database: 'Tanker_products',
      collections: collections.map(col => col.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ошибка тестирования подключения:', error);
    res.status(500).json({ error: 'Ошибка подключения к базе данных' });
  }
});

// Получить все пункты самовывоза
app.get('/api/pickup-points', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collection = database.collection('pickup_points');
    
    // Проверяем, существует ли коллекция, если нет - создаем
    const collections = await database.listCollections({ name: 'pickup_points' }).toArray();
    if (collections.length === 0) {
      await database.createCollection('pickup_points');
      console.log('Коллекция pickup_points создана');
    }
    
    const pickupPoints = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json(pickupPoints);
  } catch (error) {
    console.error('Ошибка при получении пунктов самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить новый пункт самовывоза
app.post('/api/pickup-points', async (req, res) => {
  try {
    const { 
      name, 
      address, 
      city, 
      description, 
      workingHours, 
      phone, 
      deliveryType, 
      deliveryCost,
      isActive = true 
    } = req.body;
    
    if (!name || !address || !city) {
      return res.status(400).json({ error: 'Название, адрес и город обязательны' });
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collection = database.collection('pickup_points');
    
    const newPickupPoint = {
      name,
      address,
      city,
      description: description || '',
      workingHours: workingHours || 'Пн-Пт: 9:00-18:00',
      phone: phone || '',
      deliveryType: deliveryType || 'pickup',
      deliveryCost: deliveryType === 'pickup' ? 0 : (deliveryCost || 0),
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newPickupPoint);
    
    await client.close();
    
    res.status(201).json({ 
      message: 'Пункт самовывоза добавлен',
      id: result.insertedId,
      pickupPoint: newPickupPoint
    });
  } catch (error) {
    console.error('Ошибка при добавлении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить пункт самовывоза
app.put('/api/pickup-points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      address, 
      city, 
      description, 
      workingHours, 
      phone, 
      deliveryType, 
      deliveryCost,
      isActive 
    } = req.body;
    
    if (!name || !address || !city) {
      return res.status(400).json({ error: 'Название, адрес и город обязательны' });
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collection = database.collection('pickup_points');
    
    const updateData = {
      name,
      address,
      city,
      description: description || '',
      workingHours: workingHours || 'Пн-Пт: 9:00-18:00',
      phone: phone || '',
      deliveryType: deliveryType || 'pickup',
      deliveryCost: deliveryType === 'pickup' ? 0 : (deliveryCost || 0),
      isActive: isActive !== false,
      updatedAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Пункт самовывоза не найден' });
    }
    
    res.json({ 
      message: 'Пункт самовывоза обновлен',
      updatedPoint: updateData
    });
  } catch (error) {
    console.error('Ошибка при обновлении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить пункт самовывоза
app.delete('/api/pickup-points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collection = database.collection('pickup_points');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Пункт самовывоза не найден' });
    }
    
    res.json({ message: 'Пункт самовывоза удален' });
  } catch (error) {
    console.error('Ошибка при удалении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить информацию о доставке для города
app.get('/api/pickup-points/delivery/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('Tanker_products');
    const collection = database.collection('pickup_points');
    
    // Проверяем, есть ли пункты самовывоза в городе
    const pickupPoints = await collection.find({ 
      city: { $regex: new RegExp(city, 'i') },
      isActive: true 
    }).toArray();
    
    await client.close();
    
    // Если это Алматы и есть пункты самовывоза - бесплатная доставка
    const isAlmaty = city.toLowerCase().includes('алматы') || city.toLowerCase().includes('алмата');
    
    const deliveryInfo = {
      city,
      isAlmaty,
      hasPickupPoints: pickupPoints.length > 0,
      pickupPointsCount: pickupPoints.length,
      deliveryOptions: []
    };
    
    if (isAlmaty && pickupPoints.length > 0) {
      deliveryInfo.deliveryOptions.push({
        type: 'pickup',
        name: 'Самовывоз',
        cost: 0,
        description: 'Бесплатно'
      });
    } else {
      // Для других городов - платные варианты доставки
      deliveryInfo.deliveryOptions = [
        {
          type: 'indriver',
          name: 'InDriver',
          cost: 2000,
          description: 'Курьерская доставка'
        },
        {
          type: 'yandex',
          name: 'Яндекс.Доставка',
          cost: 2500,
          description: 'Курьерская доставка'
        },
        {
          type: 'kazpost',
          name: 'Казпочта',
          cost: 1500,
          description: 'Почтовая доставка'
        },
        {
          type: 'cdek',
          name: 'СДЭК',
          cost: 3000,
          description: 'Экспресс доставка'
        },
        {
          type: 'air',
          name: 'Авиа доставка',
          cost: 5000,
          description: 'Быстрая авиа доставка'
        }
      ];
    }
    
    res.json(deliveryInfo);
  } catch (error) {
    console.error('Ошибка при получении информации о доставке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для групп вариаций товаров

// Получить все группы вариаций
app.get('/api/product-groups', async (req, res) => {
  try {
    const groups = await ProductGroup.find().populate('baseProductId').populate('variants.productId');
    res.json(groups);
  } catch (err) {
    console.error('Ошибка получения групп вариаций:', err);
    res.status(500).json({ error: 'Ошибка при получении групп вариаций' });
  }
});

// Получить группу вариаций по ID
app.get('/api/product-groups/:id', async (req, res) => {
  try {
    const group = await ProductGroup.findById(req.params.id)
      .populate('baseProductId')
      .populate('variants.productId');
    
    if (!group) return res.status(404).json({ error: 'Группа вариаций не найдена' });
    res.json(group);
  } catch (err) {
    console.error('Ошибка получения группы вариаций:', err);
    res.status(500).json({ error: 'Ошибка при получении группы вариаций' });
  }
});

// Создать новую группу вариаций
app.post('/api/product-groups', async (req, res) => {
  try {
    const group = new ProductGroup(req.body);
    const savedGroup = await group.save();
    const populatedGroup = await ProductGroup.findById(savedGroup._id)
      .populate('baseProductId')
      .populate('variants.productId');
    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error('Ошибка создания группы вариаций:', err);
    res.status(500).json({ error: 'Ошибка при создании группы вариаций' });
  }
});

// Обновить группу вариаций
app.put('/api/product-groups/:id', async (req, res) => {
  try {
    const group = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('baseProductId').populate('variants.productId');
    
    if (!group) return res.status(404).json({ error: 'Группа вариаций не найдена' });
    res.json(group);
  } catch (err) {
    console.error('Ошибка обновления группы вариаций:', err);
    res.status(500).json({ error: 'Ошибка при обновлении группы вариаций' });
  }
});

// Удалить группу вариаций
app.delete('/api/product-groups/:id', async (req, res) => {
  try {
    const group = await ProductGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ error: 'Группа вариаций не найдена' });
    res.json({ success: true, message: 'Группа вариаций удалена' });
  } catch (err) {
    console.error('Ошибка удаления группы вариаций:', err);
    res.status(500).json({ error: 'Ошибка при удалении группы вариаций' });
  }
});

// Получить группу вариаций по ID продукта
app.get('/api/product-groups/by-product/:productId', async (req, res) => {
  try {
    const group = await ProductGroup.findOne({
      $or: [
        { baseProductId: req.params.productId },
        { 'variants.productId': req.params.productId }
      ]
    }).populate('baseProductId').populate('variants.productId');
    
    if (!group) return res.status(404).json({ error: 'Группа вариаций не найдена' });
    res.json(group);
  } catch (err) {
    console.error('Ошибка получения группы вариаций по продукту:', err);
    res.status(500).json({ error: 'Ошибка при получении группы вариаций' });
  }
});

mongoose.connection.once('open', () => {
  console.log('MongoDB подключена успешно');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 