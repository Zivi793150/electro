# Финальные шаги для применения изменений

## Проблема
Файлы (uploads, images, fonts, icons) загружены на VPS, но на сайте все еще старые URL с Render.

## Решение

### Шаг 1: Загрузите исправленные JS файлы на VPS

На компьютере в PowerShell (папка `D:\electro`):

```powershell
cd D:\electro

# Загрузите исправленные файлы
scp src\components\Header.js ubuntu@78.40.109.33:/var/www/electro/src/components/
scp src\components\Footer.js ubuntu@78.40.109.33:/var/www/electro/src/components/
scp src\components\DeliveryInfo.js ubuntu@78.40.109.33:/var/www/electro/src/components/

# Страницы
scp src\pages\Product.js ubuntu@78.40.109.33:/var/www/electro/src/pages/
scp src\pages\Rental.js ubuntu@78.40.109.33:/var/www/electro/src/pages/
scp src\pages\Checkout.js ubuntu@78.40.109.33:/var/www/electro/src/pages/

# Оптовые страницы
scp src\pages\opt\Product.js ubuntu@78.40.109.33:/var/www/electro/src/pages/opt/
scp src\pages\opt\Category.js ubuntu@78.40.109.33:/var/www/electro/src/pages/opt/
scp src\pages\opt\Catalog.js ubuntu@78.40.109.33:/var/www/electro/src/pages/opt/

# Админка
scp src\admin\ProductList.js ubuntu@78.40.109.33:/var/www/electro/src/admin/
scp src\admin\ProductVariations.js ubuntu@78.40.109.33:/var/www/electro/src/admin/
scp src\admin\RentalList.js ubuntu@78.40.109.33:/var/www/electro/src/admin/
scp src\admin\SiteSettings.js ubuntu@78.40.109.33:/var/www/electro/src/admin/
scp src\admin\Orders.js ubuntu@78.40.109.33:/var/www/electro/src/admin/
scp src\admin\PickupPoints.js ubuntu@78.40.109.33:/var/www/electro/src/admin/

# Утилиты
scp src\utils\telegram.js ubuntu@78.40.109.33:/var/www/electro/src/utils/
```

### Шаг 2: На VPS пересоберите проект

Подключитесь к VPS через Termius и выполните:

```bash
cd /var/www/electro

# Пересоберите проект
npm run build

# Перезапустите приложение
pm2 restart electro
```

### Шаг 3: Проверьте результат

Откройте в браузере: `http://78.40.109.33`

Товары должны начать загружаться из локальной MongoDB!

---

## Быстрая проверка через VPS

```bash
# Проверьте что API работает
curl http://localhost:5000/api/products | head -50

# Проверьте что nginx проксирует запросы
curl http://localhost/api/products | head -50
```

Если видите JSON с товарами - все работает!

