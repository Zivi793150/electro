#!/bin/bash
# Обход проблемы с правами в /var/www/electro/build

echo "🔧 Исправляем права на саму папку build..."

# Установите полные права на папку build
chmod -R 777 /var/www/electro/build

# Проверьте владельца
ls -lad /var/www/electro/build
ls -la /var/www/electro/build

echo -e "\n=== Попробуйте загрузить файлы ТЕПЕРЬ ==="
echo "Если не работает, используйте альтернативный вариант ниже..."

