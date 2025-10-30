#!/bin/bash
# Тестирование API на VPS

echo "=== Тест 1: API Products ==="
curl -s http://localhost:5000/api/products | jq '.[] | .name' | head -5

echo -e "\n=== Тест 2: API Information ==="
curl -s http://localhost:5000/api/information | jq '.'

echo -e "\n=== Тест 3: С внешнего IP ==="
curl -s http://78.40.109.33:5000/api/products | head -100

echo -e "\n=== Тест 4: Проверяем nginx конфиг ==="
nginx -t 2>&1 | grep -A 5 "server"

