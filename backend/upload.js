const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

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
    return next();
  }

  try {
    const originalPath = req.file.path;
    const webpPath = originalPath.replace(/\.[^/.]+$/, '.webp');
    
    // Конвертируем в WebP с оптимизацией
    await sharp(originalPath)
      .webp({ 
        quality: 80, // Качество 80% (хороший баланс размер/качество)
        effort: 6    // Уровень сжатия (0-6, 6 = максимальное сжатие)
      })
      .toFile(webpPath);

    // Добавляем информацию о WebP версии в req.file
    req.file.webpPath = webpPath;
    req.file.webpUrl = webpPath.replace('public', '');
    
    console.log(`✅ Изображение конвертировано в WebP: ${originalPath} -> ${webpPath}`);
    
    next();
  } catch (error) {
    console.error('❌ Ошибка конвертации в WebP:', error);
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

module.exports = {
  upload: upload.single('image'),
  convertToWebP,
  createImageSizes
}; 