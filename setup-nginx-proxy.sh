#!/bin/bash
# Настройка nginx для проксирования API

echo "=== Создаём конфиг для nginx ==="

# Проверяем какой сайт используется
if [ -f /etc/nginx/sites-available/default ]; then
    CONFIG="/etc/nginx/sites-available/default"
elif [ -f /etc/nginx/sites-available/electro ]; then
    CONFIG="/etc/nginx/sites-available/electro"
else
    CONFIG="/etc/nginx/sites-available/default"
fi

echo "Используем конфиг: $CONFIG"

# Создаём бэкап
cp $CONFIG $CONFIG.backup

# Добавляем проксирование для /api
cat >> $CONFIG << 'EOF'

# API Proxy
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Таймауты
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

echo "✓ Конфиг обновлен"

# Проверяем синтаксис
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Конфиг валиден"
    echo "Перезагружаем nginx..."
    systemctl reload nginx
    echo "✓ Nginx перезагружен"
else
    echo "✗ Ошибка в конфиге! Откатываем изменения..."
    cp $CONFIG.backup $CONFIG
    nginx -t
fi

