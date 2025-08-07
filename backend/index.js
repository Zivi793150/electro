const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

// Модель для вариаций товаров
const productVariationSchema = new mongoose.Schema({
  masterProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // Старый способ (оставляем для обратной совместимости)
  variationType: { type: String }, // например: 'voltage', 'power', 'size'
  variationValue: { type: String }, // например: '950W', '1100W'
  // Новый способ: произвольные параметры вариации
  variationOptions: { type: mongoose.Schema.Types.Mixed, default: {} }, // например: { voltage: '220', regulator: 'Да' }
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: String, required: true },
  article: { type: String },
  characteristics: { type: mongoose.Schema.Types.Mixed },
  equipment: { type: mongoose.Schema.Types.Mixed },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { collection: 'product_variations' });

const ProductVariation = mongoose.model('ProductVariation', productVariationSchema);

// Модель для мастер-товаров (объединенных товаров)
const masterProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  shortDescription: { type: String },
  mainImage: { type: String },
  variationTypes: { type: [String], default: [] }, // типы вариаций: ['voltage', 'power']
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'master_products' });

const MasterProduct = mongoose.model('MasterProduct', masterProductSchema);

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
    
    // Получаем все обычные товары
    const products = await Product.find().limit(limit);
    
    // Получаем все мастер-товары
    const masterProducts = await MasterProduct.find({ isActive: true });
    
    // Получаем ID всех товаров, которые являются вариациями
    const variationProductIds = await ProductVariation.distinct('productId');
    
    // Фильтруем обычные товары, исключая те, которые являются вариациями
    const filteredProducts = products.filter(product => 
      !variationProductIds.some(variationId => variationId.toString() === product._id.toString())
    );
    
    // Преобразуем мастер-товары в формат, совместимый с обычными товарами
    const masterProductsFormatted = masterProducts.map(master => ({
      _id: master._id,
      name: master.name,
      category: master.category,
      description: master.description,
      'Short description': master.shortDescription,
      image: master.mainImage,
      price: 'От 0', // Будет обновлено ниже
      article: 'MP-' + master._id.toString().slice(-6),
      isMasterProduct: true,
      masterProductId: master._id
    }));
    
    // Получаем минимальные цены для мастер-товаров
    for (let master of masterProductsFormatted) {
      const variations = await ProductVariation.find({ 
        masterProductId: master.masterProductId,
        isActive: true 
      });
      if (variations.length > 0) {
        const minPrice = Math.min(...variations.map(v => parseFloat(v.price) || 0));
        master.price = `От ${minPrice.toLocaleString()}`;
      }
    }
    
    // Объединяем обычные товары и мастер-товары
    const allProducts = [...filteredProducts, ...masterProductsFormatted];
    
    // Применяем лимит к общему списку
    const limitedProducts = limit > 0 ? allProducts.slice(0, limit) : allProducts;
    
    res.json(limitedProducts);
  } catch (err) {
    console.error('Ошибка получения продуктов:', err);
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

// API endpoint для получения одного продукта по id
app.get('/api/products/:id', async (req, res) => {
  try {
    // Сначала проверяем, является ли это мастер-товаром
    const masterProduct = await MasterProduct.findById(req.params.id);
    if (masterProduct) {
      // Получаем вариации для мастер-товара
      const variations = await ProductVariation.find({ 
        masterProductId: req.params.id,
        isActive: true 
      }).populate('productId');
      
      // Формируем ответ в формате обычного товара
      const productData = {
        _id: masterProduct._id,
        name: masterProduct.name,
        category: masterProduct.category,
        description: masterProduct.description,
        'Short description': masterProduct.shortDescription,
        image: masterProduct.mainImage,
        price: 'От 0',
        article: 'MP-' + masterProduct._id.toString().slice(-6),
        isMasterProduct: true,
        masterProductId: masterProduct._id,
        variations: variations
      };
      
      // Устанавливаем минимальную цену
      if (variations.length > 0) {
        const minPrice = Math.min(...variations.map(v => parseFloat(v.price) || 0));
        productData.price = `От ${minPrice.toLocaleString()}`;
      }
      
      return res.json(productData);
    }
    
    // Если не мастер-товар, ищем обычный товар
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

// ========== API ENDPOINTS ДЛЯ ВАРИАЦИЙ ТОВАРОВ ==========

// Получить все мастер-товары
app.get('/api/master-products', async (req, res) => {
  try {
    console.log('Запрос всех мастер-товаров');
    const masterProducts = await MasterProduct.find({ isActive: true });
    console.log('Найдено мастер-товаров:', masterProducts.length);
    res.json(masterProducts);
  } catch (err) {
    console.error('Ошибка получения мастер-товаров:', err);
    res.status(500).json({ error: 'Ошибка при получении мастер-товаров' });
  }
});

// Получить один мастер-товар с вариациями
app.get('/api/master-products/:id', async (req, res) => {
  try {
    const masterProduct = await MasterProduct.findById(req.params.id);
    
    if (!masterProduct) {
      return res.status(404).json({ error: 'Мастер-товар не найден' });
    }
    
    // Получаем вариации отдельно
    const variations = await ProductVariation.find({ 
      masterProductId: req.params.id,
      isActive: true 
    }).populate('productId');
    
    const result = {
      ...masterProduct.toObject(),
      variations
    };
    
    res.json(result);
  } catch (err) {
    console.error('Ошибка получения мастер-товара:', err);
    res.status(500).json({ error: 'Ошибка при получении мастер-товара' });
  }
});

// Создать новый мастер-товар
app.post('/api/master-products', async (req, res) => {
  try {
    const masterProduct = new MasterProduct(req.body);
    const savedMasterProduct = await masterProduct.save();
    res.status(201).json(savedMasterProduct);
  } catch (err) {
    console.error('Ошибка создания мастер-товара:', err);
    res.status(500).json({ error: 'Ошибка при создании мастер-товара' });
  }
});

// Обновить мастер-товар
app.put('/api/master-products/:id', async (req, res) => {
  try {
    const masterProduct = await MasterProduct.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!masterProduct) return res.status(404).json({ error: 'Мастер-товар не найден' });
    res.json(masterProduct);
  } catch (err) {
    console.error('Ошибка обновления мастер-товара:', err);
    res.status(500).json({ error: 'Ошибка при обновлении мастер-товара' });
  }
});

// Удалить мастер-товар
app.delete('/api/master-products/:id', async (req, res) => {
  try {
    const masterProduct = await MasterProduct.findByIdAndDelete(req.params.id);
    if (!masterProduct) return res.status(404).json({ error: 'Мастер-товар не найден' });
    
    // Удаляем все связанные вариации
    await ProductVariation.deleteMany({ masterProductId: req.params.id });
    
    res.json({ success: true, message: 'Мастер-товар и все вариации удалены' });
  } catch (err) {
    console.error('Ошибка удаления мастер-товара:', err);
    res.status(500).json({ error: 'Ошибка при удалении мастер-товара' });
  }
});

// Получить все вариации товара
app.get('/api/product-variations/:masterProductId', async (req, res) => {
  try {
    const variations = await ProductVariation.find({ 
      masterProductId: req.params.masterProductId,
      isActive: true 
    }).populate('productId');
    res.json(variations);
  } catch (err) {
    console.error('Ошибка получения вариаций:', err);
    res.status(500).json({ error: 'Ошибка при получении вариаций' });
  }
});

// Создать вариацию товара
app.post('/api/product-variations', async (req, res) => {
  try {
    const variation = new ProductVariation(req.body);
    const savedVariation = await variation.save();
    res.status(201).json(savedVariation);
  } catch (err) {
    console.error('Ошибка создания вариации:', err);
    res.status(500).json({ error: 'Ошибка при создании вариации' });
  }
});

// Обновить вариацию товара
app.put('/api/product-variations/:id', async (req, res) => {
  try {
    const variation = await ProductVariation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!variation) return res.status(404).json({ error: 'Вариация не найдена' });
    res.json(variation);
  } catch (err) {
    console.error('Ошибка обновления вариации:', err);
    res.status(500).json({ error: 'Ошибка при обновлении вариации' });
  }
});

// Удалить вариацию товара
app.delete('/api/product-variations/:id', async (req, res) => {
  try {
    const variation = await ProductVariation.findByIdAndDelete(req.params.id);
    if (!variation) return res.status(404).json({ error: 'Вариация не найдена' });
    res.json({ success: true, message: 'Вариация удалена' });
  } catch (err) {
    console.error('Ошибка удаления вариации:', err);
    res.status(500).json({ error: 'Ошибка при удалении вариации' });
  }
});

// API для объединения товаров в мастер-товар
app.post('/api/merge-products', async (req, res) => {
  try {
    const { productIds, masterProductData, variationType, variationOptions } = req.body;
    console.log('Начало объединения товаров:', { productIds, masterProductData, variationType, variationOptions });
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ error: 'Необходимо выбрать минимум 2 товара для объединения' });
    }
    
    if (!masterProductData || !masterProductData.name) {
      return res.status(400).json({ error: 'Необходимо указать название мастер-товара' });
    }
    
    // Поддержка как старого способа (variationType), так и нового (variationOptions)
    if (!variationType && (!variationOptions || Object.keys(variationOptions).length === 0)) {
      return res.status(400).json({ error: 'Необходимо указать параметры вариации' });
    }
    
    // Получаем все товары для объединения
    console.log('Поиск товаров с ID:', productIds);
    const products = await Product.find({ _id: { $in: productIds } });
    console.log('Найдено товаров:', products.length);
    
    if (products.length !== productIds.length) {
      console.log('Ошибка: не все товары найдены. Ожидалось:', productIds.length, 'Найдено:', products.length);
      return res.status(400).json({ error: 'Некоторые товары не найдены' });
    }
    
    // Создаем мастер-товар
    const masterProduct = new MasterProduct({
      ...masterProductData,
      variationTypes: variationOptions ? Object.keys(variationOptions) : [variationType]
    });
    
    const savedMasterProduct = await masterProduct.save();
    
    // Создаем вариации для каждого товара
    console.log('Начинаем создание вариаций для', products.length, 'товаров');
    const variations = [];
    for (const product of products) {
      console.log('Создание вариации для товара:', product.name);
      let variationData = {
        masterProductId: savedMasterProduct._id,
        productId: product._id,
        price: product.price,
        article: product.article,
        characteristics: product.characteristics,
        equipment: product.equipment,
        images: product.images || []
      };

      if (variationOptions) {
        // Новый способ: произвольные параметры
        variationData.variationOptions = {};
        
        // Для каждого параметра из variationOptions создаем значение
        for (const [paramName, paramValues] of Object.entries(variationOptions)) {
          if (Array.isArray(paramValues) && paramValues.length > 0) {
            // Берем значение по индексу товара (циклически)
            const valueIndex = variations.length % paramValues.length;
            variationData.variationOptions[paramName] = paramValues[valueIndex];
          }
        }
      } else {
        // Старый способ: автоматическое извлечение значения
        let variationValue = '';
        
        // Пытаемся найти значение в характеристиках
        if (product.characteristics) {
          try {
            const characteristics = typeof product.characteristics === 'string' 
              ? JSON.parse(product.characteristics) 
              : product.characteristics;
            
            if (Array.isArray(characteristics)) {
              const powerChar = characteristics.find(char => 
                char.parameter && char.parameter.toLowerCase().includes('мощность') ||
                char.parameter && char.parameter.toLowerCase().includes('power')
              );
              if (powerChar) {
                variationValue = powerChar.value;
              }
            }
          } catch (e) {
            // Если не удалось распарсить JSON, ищем в строке
            const powerMatch = product.characteristics.match(/(\d+)\s*[ВтW]/i);
            if (powerMatch) {
              variationValue = powerMatch[0];
            }
          }
        }
        
        // Если не нашли в характеристиках, ищем в названии
        if (!variationValue) {
          const powerMatch = product.name.match(/(\d+)\s*[ВтW]/i);
          if (powerMatch) {
            variationValue = powerMatch[0];
          }
        }
        
        // Если все еще не нашли, используем артикул или ID
        if (!variationValue) {
          variationValue = product.article || product._id.toString().slice(-6);
        }
        
        variationData.variationType = variationType;
        variationData.variationValue = variationValue;
      }
      
      const variation = new ProductVariation(variationData);
      const savedVariation = await variation.save();
      variations.push(savedVariation);
    }
    
    console.log('Объединение завершено успешно. Создано вариаций:', variations.length);
    res.status(201).json({
      masterProduct: savedMasterProduct,
      variations,
      message: `Успешно объединено ${products.length} товаров в мастер-товар`
    });
    
  } catch (err) {
    console.error('Ошибка объединения товаров:', err);
    res.status(500).json({ error: 'Ошибка при объединении товаров' });
  }
});

// API для получения товара с вариациями (для фронтенда)
app.get('/api/products/:id/with-variations', async (req, res) => {
  try {
    console.log('Запрос товара с вариациями для ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Товар не найден в базе данных');
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Ищем, является ли этот товар частью мастер-товара
    const variation = await ProductVariation.findOne({ 
      productId: req.params.id,
      isActive: true 
    }).populate('masterProductId');
    
    if (variation) {
      // Получаем все вариации этого мастер-товара
      const allVariations = await ProductVariation.find({ 
        masterProductId: variation.masterProductId._id,
        isActive: true 
      }).populate('productId');
      
      res.json({
        isVariation: true,
        masterProduct: variation.masterProductId,
        variations: allVariations,
        currentVariation: variation
      });
    } else {
      // Проверяем, является ли это мастер-товаром
      const masterProduct = await MasterProduct.findById(req.params.id);
      if (masterProduct) {
        const variations = await ProductVariation.find({ 
          masterProductId: req.params.id,
          isActive: true 
        }).populate('productId');
        
        res.json({
          isMasterProduct: true,
          masterProduct,
          variations
        });
      } else {
        // Обычный товар без вариаций
        res.json({
          isVariation: false,
          product
        });
      }
    }
  } catch (err) {
    console.error('Ошибка получения товара с вариациями:', err);
    res.status(500).json({ error: 'Ошибка при получении товара с вариациями' });
  }
});

mongoose.connection.once('open', () => {
  console.log('MongoDB подключена успешно');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 