# Инструкция по загрузке исправленных файлов на VPS

## Проблема
Сайт работает, но товары не загружаются из-за того, что приложение обращается к старому URL `https://electro-1-vjdu.onrender.com` вместо локального API на VPS.

## Решение
Нужно заменить следующие файлы на VPS в папке `/var/www/electro/src/`:

### Исправленные файлы (заменили Render URL на локальный API):

1. **src/components/Header.js**
2. **src/components/Footer.js**
3. **src/pages/Product.js**
4. **src/pages/opt/Product.js**
5. **src/pages/Rental.js**
6. **src/pages/opt/Category.js**
7. **src/pages/opt/Catalog.js**
8. **src/pages/Checkout.js**
9. **src/admin/ProductList.js**
10. **src/admin/ProductVariations.js**
11. **src/admin/RentalList.js**
12. **src/admin/SiteSettings.js**
13. **src/admin/Orders.js**
14. **src/admin/PickupPoints.js**
15. **src/components/DeliveryInfo.js**
16. **src/utils/telegram.js**

## Что было исправлено
Все URL вида `https://electro-1-vjdu.onrender.com/api/...` заменены на `/api/...` (относительные пути)

## Как загрузить файлы на VPS

### Вариант 1: Через SFTP в Termius (РЕКОМЕНДУЕТСЯ)
1. Откройте Termius → подключитесь к `root@32470`
2. Откройте SFTP (File Transfer) 
3. Перейдите в `/var/www/electro/src/`
4. Загрузите исправленные файлы (можно выбрать несколько файлов сразу)

### Вариант 2: Скопировать файлы по SSH через терминал
На вашем компьютере в PowerShell:
```powershell
# Компоненты
scp D:\electro\src\components\Header.js root@32470:/var/www/electro/src/components/
scp D:\electro\src\components\Footer.js root@32470:/var/www/electro/src/components/
scp D:\electro\src\components\DeliveryInfo.js root@32470:/var/www/electro/src/components/

# Страницы
scp D:\electro\src\pages\Product.js root@32470:/var/www/electro/src/pages/
scp D:\electro\src\pages\Rental.js root@32470:/var/www/electro/src/pages/
scp D:\electro\src\pages\Checkout.js root@32470:/var/www/electro/src/pages/

# Opt страницы
scp D:\electro\src\pages\opt\Product.js root@32470:/var/www/electro/src/pages/opt/
scp D:\electro\src\pages\opt\Category.js root@32470:/var/www/electro/src/pages/opt/
scp D:\electro\src\pages\opt\Catalog.js root@32470:/var/www/electro/src/pages/opt/

# Админка
scp D:\electro\src\admin\ProductList.js root@32470:/var/www/electro/src/admin/
scp D:\electro\src\admin\ProductVariations.js root@32470:/var/www/electro/src/admin/
scp D:\electro\src\admin\RentalList.js root@32470:/var/www/electro/src/admin/
scp D:\electro\src\admin\SiteSettings.js root@32470:/var/www/electro/src/admin/
scp D:\electro\src\admin\Orders.js root@32470:/var/www/electro/src/admin/
scp D:\electro\src\admin\PickupPoints.js root@32470:/var/www/electro/src/admin/

# Утилиты
scp D:\electro\src\utils\telegram.js root@32470:/var/www/electro/src/utils/
```

### После загрузки файлов на VPS

1. **Подключитесь к VPS через Termius**
2. **Пересоберите проект:**
```bash
cd /var/www/electro
npm run build
```

3. **Перезапустите приложение (если используете PM2):**
```bash
pm2 restart electro
# или
pm2 restart all
```

4. **Проверьте, что MongoDB запущен:**
```bash
systemctl status mongod
# Если не запущен:
systemctl start mongod
```

5. **Проверьте логи приложения:**
```bash
pm2 logs electro
```

## Загрузка фото и шрифтов с хостинга

1. Скачайте с хостинга через File Manager папки:
   - `fonts/`
   - `images/`
   - `uploads/`

2. Загрузите их на VPS в `/var/www/electro/public/` (если они там) или в `/var/www/electro/build/`

## Проверка работы API

После пересборки проверьте, что API доступен:
```bash
curl http://localhost/api/products
curl http://localhost/api/information
```

Если всё работает, сайт должен начать загружать товары из локальной MongoDB!

