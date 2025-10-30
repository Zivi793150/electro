#!/bin/bash
# Скрипт для копирования фото, шрифтов и других ресурсов с хостинга на VPS

# Настройки
HOSTING_USER="eltokkz"  # Ваш пользователь на ps.kz
HOSTING_HOST="srv227.ps.kz"  # Или ваш адрес хостинга
HOSTING_PATH="/httpdocs"  # Путь на хостинге
VPS_PATH="/var/www/electro"  # Путь на VPS

echo "🔄 Начинаем копирование файлов с хостинга на VPS..."

# Копируем фото товаров
echo "📸 Копируем папку images/products..."
mkdir -p $VPS_PATH/build/images/products
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/images/products/ $VPS_PATH/build/images/products/

# Копируем шрифты
echo "🔤 Копируем папку fonts..."
mkdir -p $VPS_PATH/build/fonts
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/fonts/ $VPS_PATH/build/fonts/

# Копируем загруженные файлы
echo "📁 Копируем папку uploads..."
mkdir -p $VPS_PATH/build/uploads
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/uploads/ $VPS_PATH/build/uploads/

# Копируем иконки
echo "🎨 Копируем папку icons..."
mkdir -p $VPS_PATH/build/icons
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/icons/ $VPS_PATH/build/icons/

# Копируем другие изображения
echo "🖼️ Копируем другие изображения..."
mkdir -p $VPS_PATH/build/images/hero
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/images/hero/ $VPS_PATH/build/images/hero/
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/*.webp $VPS_PATH/build/
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/*.jpg $VPS_PATH/build/
rsync -avz --progress $HOSTING_USER@$HOSTING_HOST:$HOSTING_PATH/*.jpeg $VPS_PATH/build/

echo "✅ Копирование завершено!"

