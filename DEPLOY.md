# Инструкции по деплою на хостинг

## Подготовка проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Сборка React приложения
```bash
npm run build
```

### 3. Создание файла .env
Создайте файл `.env` в корне проекта со следующим содержимым:
```
MONGO_URI=mongodb://your-mongodb-connection-string
PORT=5000
NODE_ENV=production
```

## Настройка хостинга

### Вариант 1: Shared Hosting (например, Timeweb, Beget)

1. **Загрузите файлы на хостинг:**
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - Папка `build/` (после выполнения `npm run build`)
   - Папка `public/` (с изображениями и другими статическими файлами)

2. **Настройте Node.js на хостинге:**
   - В панели управления хостингом найдите раздел "Node.js"
   - Укажите версию Node.js (рекомендуется 18+)
   - Укажите точку входа: `server.js`
   - Укажите порт: `5000` (или тот, который предоставляет хостинг)

3. **Настройте MongoDB:**
   - Создайте базу данных MongoDB (если хостинг предоставляет)
   - Или используйте MongoDB Atlas (облачная версия)
   - Обновите `MONGO_URI` в файле `.env`

4. **Настройте домен:**
   - Привяжите домен к папке с проектом
   - Настройте SSL сертификат (если необходимо)

### Вариант 2: VPS (Virtual Private Server)

1. **Подключитесь к серверу:**
   ```bash
   ssh username@your-server-ip
   ```

2. **Установите Node.js и npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Установите MongoDB:**
   ```bash
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

4. **Загрузите проект:**
   ```bash
   git clone your-repository-url
   cd your-project
   npm install
   npm run build
   ```

5. **Создайте файл .env:**
   ```bash
   nano .env
   ```
   Добавьте:
   ```
   MONGO_URI=mongodb://localhost:27017/Tanker_tools
   PORT=5000
   NODE_ENV=production
   ```

6. **Настройте PM2 для управления процессом:**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "tanker-tools"
   pm2 startup
   pm2 save
   ```

7. **Настройте Nginx (опционально):**
   ```bash
   sudo apt-get install nginx
   ```
   Создайте конфигурацию:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Проверка работы

1. **Проверьте API:**
   - Откройте `http://your-domain.com/api/products`
   - Должен вернуться JSON с товарами

2. **Проверьте загрузку файлов:**
   - Попробуйте загрузить изображение через админ панель
   - Файлы должны сохраняться в папке `public/uploads/`

3. **Проверьте React приложение:**
   - Откройте главную страницу
   - Проверьте навигацию между страницами

## Возможные проблемы

### 1. Ошибка "Module not found"
```bash
npm install
```

### 2. Ошибка подключения к MongoDB
- Проверьте строку подключения в `.env`
- Убедитесь, что MongoDB запущена
- Проверьте права доступа к базе данных

### 3. Ошибка "Port already in use"
- Измените порт в `.env`
- Или остановите процесс, использующий порт

### 4. Файлы не загружаются
- Проверьте права на запись в папку `public/uploads/`
- Убедитесь, что папка существует

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки хостинга
4. Обратитесь в техподдержку хостинга