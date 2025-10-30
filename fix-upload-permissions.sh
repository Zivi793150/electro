#!/bin/bash
# Исправление прав доступа для загрузки файлов на VPS

echo "🔧 Исправляем права доступа..."

cd /var/www/electro/build

# Установите полные права для текущих папок
chmod -R 777 uploads
chmod -R 777 images
chmod -R 777 fonts
chmod -R 777 icons

# Измените владельца на www-data (если используете apache/nginx)
chown -R www-data:www-data uploads images fonts icons

# Или на root (если не работает с www-data)
# chown -R root:root uploads images fonts icons

echo "✅ Права установлены!"

