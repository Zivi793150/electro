#!/bin/bash
# Правильные команды для копирования файлов с хостинга на VPS

cd /var/www/electro

echo "📸 Копируем фото товаров..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/images/products/ build/images/products/

echo "🔤 Копируем шрифты..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/fonts/ build/fonts/

echo "📁 Копируем uploads..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/uploads/ build/uploads/

echo "🎨 Копируем иконки..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/icons/ build/icons/

echo "🖼️ Копируем hero изображения..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/images/hero/ build/images/hero/

echo "📄 Копируем основные файлы (logo, manifest)..."
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.webp build/
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.jpg build/
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.jpeg build/
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.png build/

echo "✅ Копирование завершено!"

# Установите права
chown -R www-data:www-data build/
chmod -R 755 build/

echo "🎉 Готово! Файлы скопированы."

