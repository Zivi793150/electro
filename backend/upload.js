const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  }
});

// Middleware для конвертации в WebP
const convertToWebP = async (req, res, next) => {
  if (!req.file) {
    console.log('❌ Нет файла для конвертации');
    return next();
  }

  try {
    const originalPath = req.file.path;
    const webpPath = originalPath.replace(/\.[^/.]+$/, '.webp');
    
    console.log('🔍 Начинаем конвертацию в WebP:');
    console.log('   Оригинальный файл:', originalPath);
    console.log('   WebP файл будет создан:', webpPath);
    console.log('   Размер оригинального файла:', req.file.size, 'байт');
    
    // Проверяем, существует ли оригинальный файл
    if (!fs.existsSync(originalPath)) {
      console.error('❌ Оригинальный файл не найден:', originalPath);
      return next();
    }
    
    // Конвертируем в WebP с оптимизацией
    await sharp(originalPath)
      .webp({ 
        quality: 80, // Качество 80% (хороший баланс размер/качество)
        effort: 6    // Уровень сжатия (0-6, 6 = максимальное сжатие)
      })
      .toFile(webpPath);

    // Проверяем, что webp файл создался
    if (fs.existsSync(webpPath)) {
      const webpStats = fs.statSync(webpPath);
      console.log(`✅ Изображение конвертировано в WebP: ${originalPath} -> ${webpPath}`);
      console.log(`   Размер WebP файла: ${webpStats.size} байт`);
    } else {
      console.error('❌ WebP файл не был создан:', webpPath);
    }

    // Добавляем информацию о WebP версии в req.file
    req.file.webpPath = webpPath;
    req.file.webpUrl = webpPath.replace('public', '');
    
    next();
  } catch (error) {
    console.error('❌ Ошибка конвертации в WebP:', error);
    console.error('   Детали ошибки:', error.message);
    console.error('   Стек вызовов:', error.stack);
    next(); // Продолжаем даже если конвертация не удалась
  }
};

// Middleware для создания разных размеров изображений
const createImageSizes = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const originalPath = req.file.path;
    const sizes = [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'medium', width: 400, height: 400 },
      { name: 'large', width: 800, height: 800 }
    ];

    req.file.variants = {};

    for (const size of sizes) {
      const variantPath = originalPath.replace(/\.[^/.]+$/, `-${size.name}.webp`);
      
      await sharp(originalPath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(variantPath);

      req.file.variants[size.name] = {
        path: variantPath,
        url: variantPath.replace('public', ''),
        width: size.width,
        height: size.height
      };
    }

    console.log(`✅ Созданы варианты изображения: ${Object.keys(req.file.variants).join(', ')}`);
    next();
  } catch (error) {
    console.error('❌ Ошибка создания вариантов:', error);
    next();
  }
};

// Функция для отправки файла на upload.php
async function uploadToPlesk(localFilePath, remoteUploadUrl) {
  const form = new FormData();
  form.append('file', fs.createReadStream(localFilePath));
  const response = await axios.post(remoteUploadUrl, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 20000,
  });
  return response.data;
}

// Middleware для отправки файлов на Plesk после обработки
const uploadToPleskMiddleware = async (req, res, next) => {
  if (!req.file) return next();
  try {
    // Укажи свой URL upload.php:
    const PLESK_UPLOAD_URL = 'https://www.eltok.kz/upload.php';
    // Загружаем оригинал
    const origResult = await uploadToPlesk(req.file.path, PLESK_UPLOAD_URL);
    if (origResult.success && origResult.files && origResult.files[0]) {
      req.file.pleskUrl = origResult.files[0];
      // Удаляем локальный оригинал
      fs.unlinkSync(req.file.path);
    } else {
      console.error('Ошибка загрузки оригинала на Plesk:', origResult);
    }
    // Загружаем webp
    if (req.file.webpPath && fs.existsSync(req.file.webpPath)) {
      const webpResult = await uploadToPlesk(req.file.webpPath, PLESK_UPLOAD_URL);
      if (webpResult.success && webpResult.files && webpResult.files[0]) {
        req.file.pleskWebpUrl = webpResult.files[0];
        // Удаляем локальный webp
        fs.unlinkSync(req.file.webpPath);
      } else {
        console.error('Ошибка загрузки webp на Plesk:', webpResult);
      }
    }
    next();
  } catch (err) {
    console.error('Ошибка отправки на Plesk:', err);
    next();
  }
};

module.exports = {
  upload: upload.single('image'),
  convertToWebP,
  createImageSizes,
  uploadToPleskMiddleware
}; 