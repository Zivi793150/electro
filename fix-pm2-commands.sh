#!/bin/bash
# Команды для исправления бэкенда

echo "=== Останавливаем старый процесс ==="
pm2 stop electro
pm2 delete electro

echo -e "\n=== Переходим в backend ==="
cd /var/www/electro/backend

echo -e "\n=== Устанавливаем зависимости ==="
npm install

echo -e "\n=== Запускаем backend через PM2 ==="
pm2 start index.js --name electro-api

echo -e "\n=== Проверяем статус ==="
pm2 list

echo -e "\n=== Проверяем логи ==="
pm2 logs electro-api --lines 20 --nostream

echo -e "\n=== Проверяем API ==="
sleep 2
curl http://localhost:5000/api/products 2>/dev/null | head -20

