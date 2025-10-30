#!/bin/bash
# Настройка прав для пользователя ubuntu
# Выполнить на VPS как root (через sudo)

echo "🔧 Настраиваем права для ubuntu..."

# Добавим ubuntu в группу www-data
usermod -a -G www-data ubuntu

# Установим права на папку build
chown -R ubuntu:www-data /var/www/electro/build
chmod -R 775 /var/www/electro/build

# Разрешим ubuntu работать в /var/www/electro
chown -R ubuntu:www-data /var/www/electro
chmod -R 775 /var/www/electro

echo "✅ Права настроены для ubuntu"

