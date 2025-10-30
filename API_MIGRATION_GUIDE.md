# Руководство по миграции с Render.com на локальный VPS

## Проблема
Приложение все еще обращается к `https://electro-1-vjdu.onrender.com` вместо локального API на VPS.

## Решение
Нужно заменить URL в следующих файлах:

### 1. Основные страницы
- `src/pages/Product.js`
- `src/pages/opt/Product.js`
- `src/pages/Rental.js`
- `src/pages/opt/Category.js`
- `src/pages/opt/Catalog.js`
- `src/pages/Checkout.js`

### 2. Компоненты
- `src/components/Header.js`
- `src/components/Footer.js`

### 3. Админка
- `src/admin/ProductList.js`
- `src/admin/ProductVariations.js`
- `src/admin/RentalList.js`
- `src/admin/SiteSettings.js`
- `src/admin/Orders.js`
- `src/admin/PickupPoints.js`

### 4. Утилиты
- `src/utils/telegram.js`

## Замена
Замените `https://electro-1-vjdu.onrender.com/api` на один из вариантов:

**Вариант 1: Относительный путь (рекомендуется)**
```javascript
const API_URL = '/api/products';
```

**Вариант 2: Абсолютный путь к VPS**
```javascript
const API_URL = 'http://78.40.109.33/api/products';
```

**Вариант 3: С переменной окружения**
```javascript
const API_BASE = process.env.REACT_APP_API_URL || '';
const API_URL = `${API_BASE}/api/products`;
```

