#!/bin/bash
# Диагностика фото товаров на VPS

echo "=== Проверяем структуру build/images ==="
ls -la /var/www/electro/build/images/

echo -e "\n=== Проверяем uploads ==="
ls /var/www/electro/build/uploads/ | head -10

echo -e "\n=== Проверяем один товар из БД ==="
mongosh tanker_products --eval "db.products.findOne({}, {name: 1, image: 1, coverPhoto: 1})"

echo -e "\n=== Проверяем конфигурацию nginx ==="
cat /etc/nginx/sites-available/default | grep -A 5 "location /images"

