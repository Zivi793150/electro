#!/bin/bash

# Скрипт для деплоя проекта на VPS
# Использование: ./scripts/deploy-to-vps.sh [VPS_IP] [USERNAME]

VPS_IP=${1:-"your-vps-ip"}
USERNAME=${2:-"root"}
PROJECT_NAME="electro"

echo "🚀 Деплой проекта на VPS..."
echo "📡 VPS IP: $VPS_IP"
echo "👤 Пользователь: $USERNAME"
echo ""

# Проверяем, что IP адрес указан
if [ "$VPS_IP" = "your-vps-ip" ]; then
    echo "❌ Ошибка: Укажите IP адрес VPS"
    echo "Использование: ./scripts/deploy-to-vps.sh [VPS_IP] [USERNAME]"
    exit 1
fi

echo "📦 Подготовка проекта..."

# Создаем архив проекта (исключая node_modules и другие ненужные файлы)
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='build' \
    --exclude='.env' \
    --exclude='*.log' \
    -czf ${PROJECT_NAME}.tar.gz .

echo "📤 Загрузка проекта на VPS..."

# Загружаем архив на VPS
scp ${PROJECT_NAME}.tar.gz ${USERNAME}@${VPS_IP}:/tmp/

echo "🔧 Установка на VPS..."

# Выполняем команды на VPS
ssh ${USERNAME}@${VPS_IP} << EOF
    echo "📁 Создание директории проекта..."
    mkdir -p /var/www/${PROJECT_NAME}
    cd /var/www/${PROJECT_NAME}
    
    echo "📦 Распаковка проекта..."
    tar -xzf /tmp/${PROJECT_NAME}.tar.gz
    
    echo "🔧 Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    
    echo "📦 Установка зависимостей..."
    npm install
    
    echo "🏗️ Сборка проекта..."
    npm run build
    
    echo "🔧 Установка PM2..."
    npm install -g pm2
    
    echo "📝 Создание конфигурации PM2..."
    cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: 'backend/index.js',
    cwd: '/var/www/${PROJECT_NAME}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGO_URI: 'mongodb://tanker_user:tanker_password_2024@localhost:27017/tanker_products'
    }
  }]
};
EOL
    
    echo "🚀 Запуск приложения..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "🔧 Настройка Nginx..."
    cat > /etc/nginx/sites-available/${PROJECT_NAME} << 'EOL'
server {
    listen 80;
    server_name ${VPS_IP};
    
    # Статические файлы React
    location / {
        root /var/www/${PROJECT_NAME}/build;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API запросы
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Статические файлы (изображения, CSS, JS)
    location /static/ {
        root /var/www/${PROJECT_NAME}/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOL
    
    # Включаем сайт
    ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx
    
    echo "🧹 Очистка..."
    rm /tmp/${PROJECT_NAME}.tar.gz
    
    echo "✅ Деплой завершен!"
    echo "🌐 Сайт доступен по адресу: http://${VPS_IP}"
EOF

# Удаляем локальный архив
rm ${PROJECT_NAME}.tar.gz

echo ""
echo "🎉 Деплой завершен успешно!"
echo "🌐 Сайт доступен по адресу: http://$VPS_IP"
echo ""
echo "📝 Дополнительные команды для управления:"
echo "   ssh $USERNAME@$VPS_IP 'pm2 status'          # Статус приложения"
echo "   ssh $USERNAME@$VPS_IP 'pm2 restart $PROJECT_NAME'  # Перезапуск"
echo "   ssh $USERNAME@$VPS_IP 'pm2 logs $PROJECT_NAME'     # Логи"
