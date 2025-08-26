const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
require('dotenv').config();
const path = require('path');
const compression = require('compression');

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Дополнительная обработка preflight запросов
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Сжатие ответов для ускорения доставки и снижения трафика
app.use(compression());

app.use(express.json());

// Настройка сессий для аналитики
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// ===== Реальный курс USD→KZT с кэшированием =====
const RATE_TTL_MS = 10 * 60 * 1000; // 10 минут
let cachedRate = null;
let cachedAt = 0;

async function fetchUsdKztRate() {
  const now = Date.now();
  if (cachedRate && now - cachedAt < RATE_TTL_MS) return cachedRate;
  try {
    // Пул публичных источников (без ключа), идём по очереди
    const sources = [
      async () => {
        const r = await fetch('https://open.er-api.com/v6/latest/USD');
        const j = await r.json();
        if (j && j.result === 'success' && j.rates && j.rates.KZT) return j.rates.KZT;
        throw new Error('er-api fail');
      },
      async () => {
        const r = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=KZT');
        const j = await r.json();
        if (j && j.success !== false && j.rates && j.rates.KZT) return j.rates.KZT;
        throw new Error('exchangerate.host fail');
      }
    ];
    for (const src of sources) {
      try {
        const rate = await src();
        if (rate && isFinite(rate)) {
          cachedRate = Number(rate);
          cachedAt = now;
          return cachedRate;
        }
      } catch (_) {}
    }
  } catch (e) {
    console.error('Ошибка получения курса USD→KZT:', e.message);
  }
  // Фолбэк: env или 480
  const fallback = parseFloat(process.env.USD_KZT_RATE || '480');
  cachedRate = fallback;
  cachedAt = now;
  return cachedRate;
}

app.get('/api/rate/usd-kzt', async (req, res) => {
  try {
    const rate = await fetchUsdKztRate();
    res.json({ rate });
  } catch (e) {
    res.status(500).json({ error: 'Не удалось получить курс' });
  }
});

// Простой CSV прайс-лист для оптовиков (name;article;price)
app.get('/api/price-list.csv', async (req, res) => {
  try {
    const products = await Product.find({}).limit(2000);
    const header = 'name;article;price\n';
    const rows = products.map(p => {
      const name = (p.name || '').toString().replace(/;/g, ',');
      const article = (p.article || '').toString().replace(/;/g, ',');
      const price = p.price != null ? p.price : '';
      return `${name};${article};${price}`;
    });
    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="price-list.csv"');
    return res.status(200).send(csv);
  } catch (e) {
    console.error('price-list.csv error', e);
    return res.status(500).send('error');
  }
});

// Telegram endpoint (Render backend)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
app.post('/api/send-telegram', async (req, res) => {
  try {
    const { name, phone, message, product } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken) return res.status(500).json({ error: 'Telegram bot не настроен' });
         const text = `\nНовая заявка с сайта!\n\n<b>Имя:</b> ${name}\n<b>Телефон:</b> ${phone}\n<b>Сообщение:</b> ${message || 'Не указано'}\n${product ? `<b>Товар:</b> ${product}` : ''}\n<b>Время:</b> ${new Date().toLocaleString('ru-RU')}`;
    // Если CHAT_ID не задан, просто логируем (чтобы не падать 500)
    if (!chatId) {
      console.log('TG message (no CHAT_ID):', text);
      return res.json({ success: true, note: 'No CHAT_ID, message logged' });
    }

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

// Более устойчивое подключение к MongoDB
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000, // быстрее отваливаемся при недоступности
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  family: 4
})
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
  coverImage: { type: String }, // URL обложки для группы вариаций
  variants: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    parameters: { type: Map, of: String }, // Динамические параметры (вольты, с регулятором и т.д.)
    isActive: { type: Boolean, default: true }
  }],
  parameters: [{ // Настраиваемые параметры для группы
    name: { type: String, required: true }, // например "Вольты", "С регулятором"
    type: { type: String, enum: ['select', 'radio', 'checkbox'], default: 'select' },
    values: [String], // возможные значения
    required: { type: Boolean, default: false },
    // Видимость параметра: по умолчанию виден, можно сделать невидимым и показать только для конкретных товаров
    visibleByDefault: { type: Boolean, default: true },
    visibleForProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'product_groups' });

const ProductGroup = mongoose.model('ProductGroup', productGroupSchema);

// Модель информации сайта
const informationSchema = new mongoose.Schema({
  city: { type: String, default: 'Алматы' },
  markupPercentage: { type: Number, default: 20, min: 0, max: 100 },
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

// API endpoint для получения всех продуктов с поддержкой лимита (для каталога - исключает вариации)
// Простое серверное кэширование списка товаров в памяти (для стабильности/скорости)
let productsCache = { data: null, ts: 0 };
const PRODUCTS_CACHE_TTL_MS = 60 * 1000; // 60s

// Очищаем кэш при изменении групп вариаций
const clearProductsCache = () => {
  productsCache = { data: null, ts: 0 };
};

app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const now = Date.now();
    if (!req.query.limit && productsCache.data && (now - productsCache.ts < PRODUCTS_CACHE_TTL_MS)) {
      return res.json(productsCache.data);
    }
    
    // Получаем все группы вариаций
    const productGroups = await ProductGroup.find();
    
    // Создаем Map для быстрого поиска групп по baseProductId
    const groupsByBaseProduct = new Map();
    productGroups.forEach(group => {
      if (group.baseProductId) {
        groupsByBaseProduct.set(group.baseProductId.toString(), group);
      }
    });
    
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
    
    // Добавляем информацию о группах вариаций к товарам
    const productsWithGroups = products.map(product => {
      const productObj = product.toObject();
      const group = groupsByBaseProduct.get(product._id.toString());
      
      if (group) {
        // Если товар является базовым для группы вариаций, добавляем информацию о группе
        productObj.productGroup = {
          _id: group._id,
          name: group.name,
          description: group.description,
          coverImage: group.coverImage,
          parameters: group.parameters,
          variantsCount: group.variants.length
        };
      }
      
      return productObj;
    });
    
    if (!limit) {
      productsCache = { data: productsWithGroups, ts: now };
    }
    res.json(productsWithGroups);
  } catch (err) {
    console.error('Ошибка получения продуктов:', err);
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

// API endpoint для получения всех продуктов для админки (включая вариации)
app.get('/api/admin/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    
    // Для админки возвращаем ВСЕ товары, включая вариации
    const products = await Product.find().limit(limit);
    
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения продуктов для админки:', err);
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

// API endpoint для получения одного продукта по id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    
    // Проверяем, является ли товар базовым для группы вариаций
    const productGroup = await ProductGroup.findOne({ baseProductId: req.params.id });
    
    const productObj = product.toObject();
    if (productGroup) {
      productObj.productGroup = {
        _id: productGroup._id,
        name: productGroup.name,
        description: productGroup.description,
        coverImage: productGroup.coverImage,
        parameters: productGroup.parameters,
        variantsCount: productGroup.variants.length
      };
    }
    
    res.json(productObj);
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
    const doc = { ...req.body };
    // Если админ прислал цену в долларах, конвертируем и сохраняем обе
    if (doc.priceUSD !== undefined && doc.priceUSD !== null && doc.priceUSD !== '') {
      const usd = parseFloat(String(doc.priceUSD).replace(',', '.'));
      const rate = await fetchUsdKztRate();
      
      // Получаем настраиваемый процент наценки
      let markupPercentage = 20; // по умолчанию
      try {
        const information = await Information.findOne();
        if (information && information.markupPercentage !== undefined) {
          markupPercentage = information.markupPercentage;
        }
      } catch (e) {
        console.log('Ошибка получения процента наценки, используется 20%:', e.message);
      }
      
      const markupMultiplier = 1 + (markupPercentage / 100);
      const kzt = Math.round(usd * rate * markupMultiplier);
      doc.price = kzt;
      doc.meta = { ...(doc.meta || {}), usdKztRateUsed: rate, margin: markupPercentage / 100 };
    }
    const product = new Product(doc);
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
    const doc = { ...req.body };
    if (doc.priceUSD !== undefined && doc.priceUSD !== null && doc.priceUSD !== '') {
      const usd = parseFloat(String(doc.priceUSD).replace(',', '.'));
      const rate = await fetchUsdKztRate();
      
      // Получаем настраиваемый процент наценки
      let markupPercentage = 20; // по умолчанию
      try {
        const information = await Information.findOne();
        if (information && information.markupPercentage !== undefined) {
          markupPercentage = information.markupPercentage;
        }
      } catch (e) {
        console.log('Ошибка получения процента наценки, используется 20%:', e.message);
      }
      
      const markupMultiplier = 1 + (markupPercentage / 100);
      const kzt = Math.round(usd * rate * markupMultiplier);
      doc.price = kzt;
      doc.meta = { ...(doc.meta || {}), usdKztRateUsed: rate, margin: markupPercentage / 100 };
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      doc, 
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
    console.log('Загружена информация из БД:', information ? 'найдена' : 'не найдена');
    
    // Если информации нет, создаем с дефолтными значениями
    if (!information) {
      console.log('Создаем новую информацию с дефолтными значениями');
      information = new Information();
      await information.save();
    } else {
      // Миграция: добавляем поле markupPercentage если его нет
      if (information.markupPercentage === undefined) {
        console.log('Добавляем поле markupPercentage к существующей записи');
        information.markupPercentage = 20;
        await information.save();
      }
    }
    
    console.log('Процент наценки в ответе:', information.markupPercentage);
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
    
    console.log('Получены данные для сохранения:', JSON.stringify(information, null, 2));
    console.log('Процент наценки в запросе:', information.markupPercentage);
    
    let existingInformation = await Information.findOne();
    console.log('Существующая информация в БД:', existingInformation ? 'найдена' : 'не найдена');
    
    if (existingInformation) {
      console.log('Старый процент наценки:', existingInformation.markupPercentage);
      // Обновляем существующую информацию
      Object.assign(existingInformation, information);
      console.log('Новый процент наценки после Object.assign:', existingInformation.markupPercentage);
      await existingInformation.save();
      console.log('Процент наценки после сохранения:', existingInformation.markupPercentage);
    } else {
      console.log('Создаем новую информацию с процентом наценки:', information.markupPercentage);
      // Создаем новую информацию
      existingInformation = new Information(information);
      await existingInformation.save();
    }
    
    console.log('Финальный процент наценки в ответе:', existingInformation.markupPercentage);
    res.json({ success: true, information: existingInformation });
  } catch (err) {
    console.error('Ошибка сохранения информации:', err);
    res.status(500).json({ error: 'Ошибка при сохранении информации' });
  }
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
      deliveryOptions: [],
      // Отдаем минимально необходимые данные пунктов самовывоза для фронта
      pickupPoints: pickupPoints.map(p => ({
        id: p._id,
        name: p.name,
        address: p.address,
        workingHours: p.workingHours || '',
        phone: p.phone || ''
      })),
      firstPickupPoint: pickupPoints.length > 0 ? {
        id: pickupPoints[0]._id,
        name: pickupPoints[0].name,
        address: pickupPoints[0].address,
        workingHours: pickupPoints[0].workingHours || '',
        phone: pickupPoints[0].phone || ''
      } : null
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
    console.log('Запрос на получение групп вариаций...');
    const groups = await ProductGroup.find().populate('baseProductId').populate('variants.productId');
    console.log('Найдено групп:', groups.length);
    res.json(groups);
  } catch (err) {
    console.error('Ошибка получения групп вариаций:', err);
    res.status(500).json({ error: 'Ошибка при получении групп вариаций', details: err.message });
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
    console.log('Создание группы вариаций с данными:', req.body);
    console.log('🖼️ CoverImage в запросе:', req.body.coverImage);
    const body = { ...req.body };
    // Нормализуем параметры, чтобы гарантировать сохранение falsy значений и корректных типов
    if (Array.isArray(body.parameters)) {
      body.parameters = body.parameters.map((p) => ({
        name: p.name,
        type: p.type || 'select',
        values: Array.isArray(p.values) ? p.values.filter(v => v !== null && v !== undefined && String(v).trim() !== '') : [],
        required: !!p.required,
        visibleByDefault: p.visibleByDefault === false ? false : true,
        visibleForProductIds: Array.isArray(p.visibleForProductIds)
          ? p.visibleForProductIds
              .map(id => {
                try { return new mongoose.Types.ObjectId(String(id)); } catch { return null; }
              })
              .filter(Boolean)
          : []
      }));
    }
    const group = new ProductGroup(body);
    const savedGroup = await group.save();
    const populatedGroup = await ProductGroup.findById(savedGroup._id)
      .populate('baseProductId')
      .populate('variants.productId');
    console.log('Группа создана:', populatedGroup);
    console.log('🖼️ CoverImage в сохраненной группе:', populatedGroup.coverImage);
    
    // Очищаем кэш продуктов
    clearProductsCache();
    
    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error('Ошибка создания группы вариаций:', err);
    res.status(500).json({ error: 'Ошибка при создании группы вариаций', details: err.message });
  }
});

// Обновить группу вариаций
app.put('/api/product-groups/:id', async (req, res) => {
  try {
    console.log('Обновление группы вариаций с данными:', req.body);
    console.log('🖼️ CoverImage в запросе обновления:', req.body.coverImage);
    const body = { ...req.body, updatedAt: Date.now() };
    if (Array.isArray(body.parameters)) {
      body.parameters = body.parameters.map((p) => ({
        name: p.name,
        type: p.type || 'select',
        values: Array.isArray(p.values) ? p.values.filter(v => v !== null && v !== undefined && String(v).trim() !== '') : [],
        required: !!p.required,
        visibleByDefault: p.visibleByDefault === false ? false : true,
        visibleForProductIds: Array.isArray(p.visibleForProductIds)
          ? p.visibleForProductIds
              .map(id => {
                try { return new mongoose.Types.ObjectId(String(id)); } catch { return null; }
              })
              .filter(Boolean)
          : []
      }));
    }
    const group = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('baseProductId').populate('variants.productId');
    
    if (!group) return res.status(404).json({ error: 'Группа вариаций не найдена' });
    
    console.log('🖼️ CoverImage в обновленной группе:', group.coverImage);
    
    // Очищаем кэш продуктов
    clearProductsCache();
    
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
    
    // Очищаем кэш продуктов
    clearProductsCache();
    
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

// Подключаем роуты аналитики
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

mongoose.connection.once('open', () => {
  console.log('MongoDB подключена успешно');
});

// Настройка таймаутов HTTP сервера для стабильности под нагрузкой/проксами
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
server.keepAliveTimeout = 65000; // чуть больше 60с
server.headersTimeout = 66000;   // больше keepAliveTimeout
server.requestTimeout = 65000;