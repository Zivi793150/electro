#!/bin/bash
# Проверка конфигурации веб-сервера

echo "=== Проверяем какий веб-сервер используется ==="
systemctl status nginx 2>/dev/null && echo "Используется NGINX" || echo "NGINX не запущен"
systemctl status apache2 2>/dev/null && echo "Используется APACHE" || echo "Apache не запущен"

echo -e "\n=== Проверяем конфигурацию nginx ==="
cat /etc/nginx/sites-available/default 2>/dev/null | grep -A 10 "location /api"

echo -e "\n=== Или конфигурацию Apache ==="
cat /etc/apache2/sites-available/000-default.conf 2>/dev/null | grep -A 10 "ProxyPass /api"

echo -e "\n=== Проверяем открыт ли порт 5000 ==="
netstat -tlnp | grep 5000

