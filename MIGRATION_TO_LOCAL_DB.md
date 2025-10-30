# Миграция на локальную БД MongoDB

Этот документ описывает процесс переноса проекта с облачной MongoDB Atlas на локальную БД на VPS.

## 🎯 Цели миграции

- Переход с MongoDB Atlas на локальную БД
- Снижение затрат на облачные сервисы
- Полный контроль над данными
- Улучшение производительности

## 📋 Предварительные требования

- VPS с Ubuntu/Debian
- Доступ по SSH к VPS
- Node.js 18+ на VPS
- Права администратора на VPS

## 🚀 Пошаговая инструкция

### Шаг 1: Подготовка VPS

1. **Подключитесь к VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Установите MongoDB:**
   ```bash
   chmod +x scripts/install-mongodb.sh
   ./scripts/install-mongodb.sh
   ```

3. **Проверьте установку:**
   ```bash
   sudo systemctl status mongod
   mongosh --eval "db.adminCommand('ismaster')"
   ```

### Шаг 2: Миграция данных

1. **На локальной машине установите зависимости:**
   ```bash
   cd backend
   npm install mongodb dotenv
   ```

2. **Создайте .env файл:**
   ```bash
   cp env.example .env
   ```

3. **Обновите .env файл:**
   ```env
   # Для миграции - исходная БД
   MONGO_URI=mongodb+srv://electro:electro123@cluster0.mongodb.net/Tanker_products?retryWrites=true&w=majority
   
   # Для целевой БД
   LOCAL_MONGO_URI=mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products
   ```

4. **Запустите миграцию:**
   ```bash
   node scripts/migrate-to-local-db.js
   ```

### Шаг 3: Деплой на VPS

1. **Сделайте скрипты исполняемыми:**
   ```bash
   chmod +x scripts/deploy-to-vps.sh
   chmod +x scripts/install-mongodb.sh
   ```

2. **Запустите деплой:**
   ```bash
   ./scripts/deploy-to-vps.sh your-vps-ip root
   ```

### Шаг 4: Настройка домена (опционально)

1. **Установите SSL сертификат:**
   ```bash
   ssh root@your-vps-ip
   apt install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

2. **Обновите конфигурацию Nginx:**
   ```bash
   nano /etc/nginx/sites-available/electro
   # Добавьте ваш домен в server_name
   ```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` на VPS:

```env
# MongoDB Configuration
MONGO_URI=mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products

# Server Configuration
PORT=5000
NODE_ENV=production

# Session Secret
SESSION_SECRET=your-secret-key-here

# USD to KZT Rate (fallback)
USD_KZT_RATE=480

# Telegram Bot Configuration (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### Структура БД

После миграции в локальной БД будут созданы следующие коллекции:

- `products` - товары
- `product_groups` - группы вариаций товаров
- `information` - настройки сайта
- `pickup_points` - пункты самовывоза
- `analytics` - аналитика
- `orders` - заказы

## 🛠️ Управление

### PM2 команды

```bash
# Статус приложения
pm2 status

# Перезапуск
pm2 restart electro

# Логи
pm2 logs electro

# Мониторинг
pm2 monit
```

### MongoDB команды

```bash
# Подключение к БД
mongosh mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products

# Создание резервной копии
mongodump --uri="mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products" --out=/backup/

# Восстановление из резервной копии
mongorestore --uri="mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products" /backup/tanker_products/
```

## 🔍 Проверка

### Проверка работы сайта

1. Откройте браузер и перейдите на `http://your-vps-ip`
2. Проверьте загрузку товаров
3. Проверьте работу админки
4. Проверьте отправку форм

### Проверка БД

```bash
# Подключение к MongoDB
mongosh mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products

# Проверка коллекций
show collections

# Проверка количества товаров
db.products.countDocuments()

# Проверка настроек
db.information.findOne()
```

## 🚨 Устранение неполадок

### MongoDB не запускается

```bash
# Проверка логов
sudo journalctl -u mongod

# Перезапуск
sudo systemctl restart mongod

# Проверка конфигурации
sudo nano /etc/mongod.conf
```

### Приложение не запускается

```bash
# Проверка логов PM2
pm2 logs electro

# Проверка портов
netstat -tlnp | grep :5000

# Перезапуск
pm2 restart electro
```

### Проблемы с Nginx

```bash
# Проверка конфигурации
nginx -t

# Перезапуск
systemctl restart nginx

# Проверка логов
tail -f /var/log/nginx/error.log
```

## 📊 Мониторинг

### Настройка мониторинга

1. **Установите htop для мониторинга ресурсов:**
   ```bash
   apt install htop
   ```

2. **Настройте логирование:**
   ```bash
   # Ротация логов PM2
   pm2 install pm2-logrotate
   ```

3. **Мониторинг БД:**
   ```bash
   # Установка MongoDB Compass для GUI
   # Или используйте mongosh для командной строки
   ```

## 🔄 Обновления

### Обновление приложения

1. **Загрузите новую версию:**
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. **Перезапустите приложение:**
   ```bash
   pm2 restart electro
   ```

### Обновление БД

```bash
# Создайте резервную копию
mongodump --uri="mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products" --out=/backup/$(date +%Y%m%d)/

# Примените изменения
# (если есть миграции)
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `pm2 logs electro`
2. Проверьте статус сервисов: `systemctl status mongod nginx`
3. Проверьте подключение к БД: `mongosh mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products`
4. Проверьте конфигурацию Nginx: `nginx -t`

## ✅ Чек-лист после миграции

- [ ] MongoDB установлен и запущен
- [ ] Данные мигрированы
- [ ] Приложение развернуто
- [ ] Nginx настроен
- [ ] SSL сертификат установлен (если нужен)
- [ ] Домен настроен
- [ ] Мониторинг настроен
- [ ] Резервное копирование настроено
- [ ] Тестирование завершено
