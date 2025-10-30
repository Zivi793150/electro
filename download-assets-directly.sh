#!/bin/bash
# Скачивание файлов напрямую с сайта eltok.kz и упаковка для загрузки на VPS

cd /var/www/electro

echo "📥 Скачиваем изображения товаров..."
wget -r -np -nH --cut-dirs=0 https://eltok.kz/images/products/* -P build/images/products/ 2>/dev/null || echo "Папка products может быть пуста"

echo "🔤 Скачиваем шрифты..."
wget -r -np -nH --cut-dirs=0 https://eltok.kz/fonts/* -P build/fonts/

echo "📁 Скачиваем uploads..."
wget -r -np -nH --cut-dirs=0 https://eltok.kz/uploads/* -P build/uploads/

echo "🎨 Скачиваем иконки..."
wget -r -np -nH --cut-dirs=0 https://eltok.kz/icons/* -P build/icons/

echo "🖼️ Скачиваем hero изображения..."
wget -r -np -nH --cut-dirs=0 https://eltok.kz/images/hero/* -P build/images/hero/

echo "📄 Скачиваем основные файлы..."
wget -nc https://eltok.kz/logo.webp -P build/
wget -nc https://eltok.kz/manifest.json -P build/

echo "✅ Скачивание завершено!"

