# Настройка бэкенда на VPS для локальной MongoDB

## Проблема
API возвращает 502 Bad Gateway - бэкенд не запущен или не может подключиться к MongoDB.

## Решение

### Шаг 1: Создайте файл .env в backend/
Подключитесь к VPS через Termius и выполните:

```bash
cd /var/www/electro/backend

# Создайте .env файл
cp env.example .env

# Проверьте содержимое
cat .env
```

Должен содержать:
```env
MONGO_URI=mongodb://localhost:27017/tanker_products
PORT=5000
NODE_ENV=production
SESSION_SECRET=your-secret-key-here
USD_KZT_RATE=480
```

### Шаг 2: Проверьте MongoDB на VPS

```bash
# Проверьте, запущен ли MongoDB
systemctl status mongod

# Если не запущен - запустите
systemctl start mongod

# Проверьте подключение
mongo --eval "db.adminCommand('listDatabases')"
```

### Шаг 3: Импортируйте товары из Atlas в локальную MongoDB

```bash
# Экспортируйте из Atlas
mongoexport --uri="mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products" --collection=products --out=products.json

# Импортируйте в локальную MongoDB
mongoimport --uri="mongodb://localhost:27017/tanker_products" --collection=products --file=products.json
```

### Шаг 4: Запустите backend сервер

```bash
cd /var/www/electro/backend

# Установите зависимости (если нужно)
npm install

# Проверьте, что всё работает
node index.js
```

Если сервер запустился успешно, остановите его (Ctrl+C) и запустите через PM2:

```bash
# Запустите через PM2
pm2 start backend/index.js --name electro-api

# Или если используете другую структуру
pm2 restart electro
```

### Шаг 5: Проверьте что сервер работает

```bash
# Проверьте статус PM2
pm2 list

# Проверьте логи
pm2 logs electro-api

# Проверьте API напрямую
curl http://localhost:5000/api/products
curl http://localhost:5000/api/information
```

### Шаг 6: Настройте nginx/apache для проксирования API

Если используете nginx, откройте конфигурацию:

```bash
nano /etc/nginx/sites-available/electro
# или
nano /etc/apache2/sites-available/000-default.conf
```

Убедитесь что есть проксирование для /api:

```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Перезагрузите nginx:
```bash
sudo systemctl reload nginx
```

## Альтернатива: Быстрый тест

Если ничего не работает, попробуйте запустить backend вручную:

```bash
cd /var/www/electro/backend
node index.js
```

И в другом терминале проверьте:
```bash
curl http://localhost:5000/api/products | head
```

Если получаете JSON с товарами - API работает, проблема в PM2 или nginx!

