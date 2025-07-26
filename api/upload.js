import { connectToDatabase } from './mongodb';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Метод ${req.method} не разрешён`);
    return;
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    form.keepExtensions = true;
    form.maxFileSize = 10 * 1024 * 1024; // 10MB

    // Создаем папку если её нет
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Ошибка парсинга формы:', err);
        return res.status(500).json({ error: 'Ошибка загрузки файла' });
      }

      const uploadedFiles = [];
      
      if (files.file) {
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        
        for (const file of fileArray) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalFilename)}`;
          const newPath = path.join(form.uploadDir, fileName);
          
          // Переименовываем файл
          fs.renameSync(file.filepath, newPath);
          
          uploadedFiles.push(`/images/products/${fileName}`);
        }
      }

      res.status(200).json({ 
        success: true, 
        files: uploadedFiles,
        message: `Загружено ${uploadedFiles.length} файлов`
      });
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
} 