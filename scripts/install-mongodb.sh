#!/bin/bash

# Скрипт для установки MongoDB на VPS (Ubuntu/Debian)

echo "🚀 Установка MongoDB на VPS..."

# Обновляем систему
sudo apt update
sudo apt upgrade -y

# Устанавливаем необходимые пакеты
sudo apt install -y wget curl gnupg

# Добавляем ключ MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Добавляем репозиторий MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Обновляем список пакетов
sudo apt update

# Устанавливаем MongoDB
sudo apt install -y mongodb-org

# Запускаем и включаем автозапуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Проверяем статус
sudo systemctl status mongod

# Создаем базу данных и пользователя
echo "📊 Настройка базы данных..."

# Подключаемся к MongoDB и создаем базу данных
mongosh --eval "
use tanker_products;
db.createUser({
  user: 'tanker_user',
  pwd: 'tanker_password_2024',
  roles: [
    { role: 'readWrite', db: 'tanker_products' }
  ]
});
"

echo "✅ MongoDB установлен и настроен!"
echo "📝 Данные для подключения:"
echo "   - База данных: tanker_products"
echo "   - Пользователь: tanker_user"
echo "   - Пароль: tanker_password_2024"
echo "   - URI: mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products"
echo ""
echo "🔧 Для настройки проекта:"
echo "   1. Скопируйте env.example в .env"
echo "   2. Обновите MONGO_URI в .env файле"
echo "   3. Перезапустите приложение"
