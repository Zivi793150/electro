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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Создаем папку uploads если её нет
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Ошибка парсинга формы:', err);
        return res.status(500).json({ error: 'Ошибка при загрузке файлов' });
      }

      if (!files.file) {
        return res.status(400).json({ error: 'Файлы не были загружены' });
      }

      const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
      
      const fileUrls = uploadedFiles.map(file => {
        // Возвращаем относительный путь от public
        const relativePath = path.relative(path.join(process.cwd(), 'public'), file.filepath);
        return `/${relativePath.replace(/\\/g, '/')}`;
      });

      res.json({
        success: true,
        files: fileUrls,
        message: `Загружено ${fileUrls.length} файлов`
      });
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файлов' });
  }
} 