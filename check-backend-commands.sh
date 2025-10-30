#!/bin/bash
# Команды для диагностики бэкенда на VPS

echo "=== Проверяем структуру проекта ==="
cd /var/www/electro
ls -la

echo -e "\n=== Проверяем backend ==="
cd backend
ls -la

echo -e "\n=== Проверяем .env ==="
cat .env

echo -e "\n=== Проверяем MongoDB ==="
mongo tanker_products --eval "show collections" 2>/dev/null || echo "Не удалось подключиться к MongoDB"

echo -e "\n=== Проверяем логи PM2 ==="
pm2 logs electro --lines 50 --nostream

echo -e "\n=== Пробуем запустить backend напрямую ==="
node index.js

