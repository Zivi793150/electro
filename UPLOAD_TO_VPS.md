# Инструкция по загрузке папок на VPS

## Вариант 1: Через SFTP в Termius (САМЫЙ ПРОСТОЙ!)

### Шаг 1: Подключитесь к VPS через Termius
1. Откройте Termius
2. Подключитесь к `root@32470`
3. Откройте **File Transfer** (кнопка Files)

### Шаг 2: Найдите папки на компьютере
Откройте проводник Windows (D:/) и найдите папки:
- `D:/uploads/`
- `D:/fonts/` (если есть)
- `D:/images/` (если есть)
- `D:/icons/` (если есть)

### Шаг 3: Перетащите папки в Termius
1. В Termius File Transfer перейдите в `/var/www/electro/build/`
2. Откройте проводник Windows рядом
3. **Перетащите папки** из Windows в `/var/www/electro/build/` в Termius

### Шаг 4: Установите права на VPS
Подключитесь через SSH и выполните:
```bash
cd /var/www/electro/build
chown -R www-data:www-data *
chmod -R 755 *
```

---

## Вариант 2: Через PowerShell + scp

### Откройте PowerShell и выполните:

```powershell
# Перейдите в корень диска D:
cd D:\

# Загрузите папку uploads
scp -r uploads root@32470:/var/www/electro/build/

# Загрузите папку fonts (если есть)
scp -r fonts root@32470:/var/www/electro/build/

# Загрузите папку images (если есть)
scp -r images root@32470:/var/www/electro/build/

# Загрузите папку icons (если есть)
scp -r icons root@32470:/var/www/electro/build/
```

---

## Вариант 3: Через WinSCP

1. Скачайте WinSCP: https://winscp.net/
2. Установите и откройте
3. Подключитесь:
   - Host: `32470` (или IP)
   - User: `root`
   - Password: ваш пароль
4. Слева: папка `D:\` на компьютере
5. Справа: `/var/www/electro/build/` на VPS
6. Выделите папки и нажмите Upload

---

## После загрузки файлов

### 1. Загрузите исправленные JS файлы

Выполните на компьютере в PowerShell:
```powershell
cd D:\electro

# Загрузите компоненты
scp src\components\Header.js root@32470:/var/www/electro/src/components/
scp src\components\Footer.js root@32470:/var/www/electro/src/components/
scp src\components\DeliveryInfo.js root@32470:/var/www/electro/src/components/

# Загрузите страницы
scp src\pages\Product.js root@32470:/var/www/electro/src/pages/
scp src\pages\Rental.js root@32470:/var/www/electro/src/pages/
scp src\pages\Checkout.js root@32470:/var/www/electro/src/pages/

# Оптовые страницы
scp src\pages\opt\Product.js root@32470:/var/www/electro/src/pages/opt/
scp src\pages\opt\Category.js root@32470:/var/www/electro/src/pages/opt/
scp src\pages\opt\Catalog.js root@32470:/var/www/electro/src/pages/opt/

# Админка
scp src\admin\*.js root@32470:/var/www/electro/src/admin/

# Утилиты
scp src\utils\telegram.js root@32470:/var/www/electro/src/utils/
```

### 2. На VPS пересоберите проект

```bash
cd /var/www/electro
npm run build
pm2 restart electro
```

### 3. Проверьте

Откройте: `http://78.40.109.33` - должны загрузиться товары!

