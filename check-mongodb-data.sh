#!/bin/bash
# Проверка данных в MongoDB

echo "=== Проверяем MongoDB через mongosh ==="
mongosh tanker_products --eval "db.products.count()"

echo -e "\n=== Проверяем список коллекций ==="
mongosh tanker_products --eval "show collections"

echo -e "\n=== Проверяем первые 3 товара ==="
mongosh tanker_products --eval "db.products.find().limit(3).pretty()"

