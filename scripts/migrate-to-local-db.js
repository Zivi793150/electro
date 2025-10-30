#!/usr/bin/env node

/**
 * Скрипт для миграции данных с MongoDB Atlas на локальную БД
 * Использование: node scripts/migrate-to-local-db.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Конфигурация
const SOURCE_URI = process.env.MONGO_URI || 'mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products?retryWrites=true&w=majority';
const TARGET_URI = process.env.LOCAL_MONGO_URI || 'mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products';

const COLLECTIONS_TO_MIGRATE = [
  'products',
  'product_groups', 
  'information',
  'pickup_points',
  'analytics',
  'orders'
];

async function migrateCollection(sourceDb, targetDb, collectionName) {
  console.log(`📦 Миграция коллекции: ${collectionName}`);
  
  try {
    const sourceCollection = sourceDb.collection(collectionName);
    const targetCollection = targetDb.collection(collectionName);
    
    // Получаем все документы из исходной коллекции
    const documents = await sourceCollection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`   ⚠️  Коллекция ${collectionName} пуста, пропускаем`);
      return;
    }
    
    console.log(`   📊 Найдено документов: ${documents.length}`);
    
    // Очищаем целевую коллекцию (если она существует)
    await targetCollection.deleteMany({});
    
    // Вставляем документы в целевую коллекцию
    if (documents.length > 0) {
      await targetCollection.insertMany(documents);
      console.log(`   ✅ Успешно мигрировано: ${documents.length} документов`);
    }
    
  } catch (error) {
    console.error(`   ❌ Ошибка миграции коллекции ${collectionName}:`, error.message);
  }
}

async function migrateDatabase() {
  let sourceClient, targetClient;
  
  try {
    console.log('🚀 Начинаем миграцию данных...');
    console.log(`📤 Источник: ${SOURCE_URI}`);
    console.log(`📥 Цель: ${TARGET_URI}`);
    console.log('');
    
    // Подключаемся к исходной БД
    console.log('🔌 Подключение к исходной БД...');
    sourceClient = new MongoClient(SOURCE_URI);
    await sourceClient.connect();
    const sourceDb = sourceClient.db('Tanker_products');
    console.log('✅ Подключение к исходной БД установлено');
    
    // Подключаемся к целевой БД
    console.log('🔌 Подключение к локальной БД...');
    targetClient = new MongoClient(TARGET_URI);
    await targetClient.connect();
    const targetDb = targetClient.db('tanker_products');
    console.log('✅ Подключение к локальной БД установлено');
    console.log('');
    
    // Мигрируем каждую коллекцию
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      await migrateCollection(sourceDb, targetDb, collectionName);
    }
    
    console.log('');
    console.log('🎉 Миграция завершена успешно!');
    console.log('');
    console.log('📝 Следующие шаги:');
    console.log('   1. Обновите MONGO_URI в .env файле на локальную БД');
    console.log('   2. Перезапустите приложение');
    console.log('   3. Проверьте работу сайта');
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  } finally {
    // Закрываем соединения
    if (sourceClient) {
      await sourceClient.close();
    }
    if (targetClient) {
      await targetClient.close();
    }
  }
}

// Проверяем, что скрипт запущен напрямую
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
