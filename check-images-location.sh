#!/bin/bash
# Проверка расположения фото товаров на VPS

echo "=== Проверяем структуру папки images на VPS ==="
ls -la /var/www/electro/build/images/

echo -e "\n=== Проверяем есть ли папка products ==="
ls -la /var/www/electro/build/images/products/ 2>/dev/null || echo "Папка products не найдена"

echo -e "\n=== Проверяем сколько файлов в uploads ==="
ls /var/www/electro/build/uploads/ | wc -l

echo -e "\n=== Проверяем первые файлы в uploads ==="
ls /var/www/electro/build/uploads/ | head -5

