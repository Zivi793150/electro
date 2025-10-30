#!/bin/bash
# Скрипт для загрузки папок с локального компьютера на VPS
# Выполнять на компьютере (не на VPS!)

VPS="root@32470"
VPS_PATH="/var/www/electro/build"

echo "📤 Загружаем папки на VPS..."

# Загружаем uploads
if [ -d "D:/uploads" ]; then
    echo "📁 Загружаем uploads..."
    scp -r D:/uploads $VPS:$VPS_PATH/
fi

# Загружаем fonts
if [ -d "D:/fonts" ]; then
    echo "🔤 Загружаем fonts..."
    scp -r D:/fonts $VPS:$VPS_PATH/
fi

# Загружаем images
if [ -d "D:/images" ]; then
    echo "🖼️ Загружаем images..."
    scp -r D:/images $VPS:$VPS_PATH/
fi

# Загружаем icons
if [ -d "D:/icons" ]; then
    echo "🎨 Загружаем icons..."
    scp -r D:/icons $VPS:$VPS_PATH/
fi

echo "✅ Загрузка завершена!"
echo "📋 Теперь на VPS выполните:"
echo "   cd /var/www/electro/build"
echo "   chown -R www-data:www-data ."
echo "   chmod -R 755 ."

