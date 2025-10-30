# Как извлечь все файлы с хостинга ps.kz на VPS

## Вариант 1: Через rsync с хостинга (РЕКОМЕНДУЕТСЯ)

### Подключитесь к VPS через Termius и выполните:

```bash
cd /var/www/electro

# Создайте необходимые папки
mkdir -p build/images/products build/fonts build/uploads build/icons build/images/hero

# Скопируйте файлы с хостинга на VPS через rsync
rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/images/products/ build/images/products/

rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/fonts/ build/fonts/

rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/uploads/ build/uploads/

rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/icons/ build/icons/

rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/images/hero/ build/images/hero/

# Скопируйте основные файлы
rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/*.webp build/
rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/*.jpg build/
rsync -avz --progress eltokkz@srv227.ps.kz:/httpdocs/*.jpeg build/
```

## Вариант 2: Создать архив на хостинге

### 1. Войдите на хостинг через SSH:

```bash
ssh eltokkz@srv227.ps.kz
```

### 2. Создайте архив с нужными файлами:

```bash
cd /httpdocs

# Создайте архив с папками
tar -czf assets.tar.gz fonts/ icons/ images/ uploads/ *.webp *.jpg *.jpeg

# Или если нужен полный бэкап (осторожно - большие файлы)
tar -czf full_backup.tar.gz fonts/ icons/ images/ uploads/ static/
```

### 3. Скачайте архив с хостинга:

На вашем компьютере:
```powershell
scp eltokkz@srv227.ps.kz:/httpdocs/assets.tar.gz D:\
```

### 4. Загрузите на VPS:

```powershell
scp D:\assets.tar.gz root@32470:/var/www/electro/
```

### 5. Распакуйте на VPS:

```bash
cd /var/www/electro
tar -xzf assets.tar.gz -C build/
```

## Вариант 3: Через wget по прямой ссылке

Если у вас есть прямой HTTP доступ к хостингу:

```bash
cd /var/www/electro

# Скачайте архивы с хостинга через wget
wget -r -np -nH --cut-dirs=1 http://eltok.kz/images/ -P build/images/
wget -r -np -nH --cut-dirs=1 http://eltok.kz/fonts/ -P build/fonts/
wget -r -np -nH --cut-dirs=1 http://eltok.kz/uploads/ -P build/uploads/
```

## Вариант 4: Через FileZilla или другой FTP/SFTP клиент

1. Установите FileZilla на компьютер
2. Подключитесь к хостингу ps.kz через SFTP
3. Скачайте папки:
   - `/httpdocs/images/` → локально
   - `/httpdocs/fonts/` → локально
   - `/httpdocs/uploads/` → локально
   - `/httpdocs/icons/` → локально

4. Затем загрузите их на VPS через Termius SFTP в `/var/www/electro/build/`

## После загрузки файлов

```bash
cd /var/www/electro

# Установите права
chown -R www-data:www-data build/
chmod -R 755 build/

# Проверьте, что файлы есть
ls -la build/images/products/ | head
ls -la build/fonts/ | head

# Перезапустите приложение
pm2 restart electro
```

## Проверка

Откройте браузер и проверьте:
- `http://78.40.109.33/images/products/` - должны быть фото
- `http://78.40.109.33/fonts/` - должны быть шрифты

