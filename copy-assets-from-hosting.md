# Копирование файлов с хостинга ps.kz на VPS

## Правильный адрес хостинга
- **Сервер:** `srv-plesk20.ps.kz` (не srv227!)
- **Пользователь:** `eltokkz`
- **Путь:** `/httpdocs`

## Вариант 1: Через rsync с правильным адресом

```bash
cd /var/www/electro

# Копируем фото товаров
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/images/products/ build/images/products/

# Копируем шрифты
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/fonts/ build/fonts/

# Копируем uploads
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/uploads/ build/uploads/

# Копируем иконки
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/icons/ build/icons/

# Копируем hero изображения
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/images/hero/ build/images/hero/

# Копируем основные файлы (logo, manifest и т.д.)
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.webp build/
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.jpg build/
rsync -avz --progress eltokkz@srv-plesk20.ps.kz:/httpdocs/*.jpeg build/
```

## Вариант 2: Через wget (если rsync не работает)

```bash
cd /var/www/electro

# Копируем папку images с http подключением
wget -r -np -nH --cut-dirs=0 -P build/ https://eltok.kz/images/

# Копируем fonts
wget -r -np -nH --cut-dirs=0 -P build/ https://eltok.kz/fonts/

# Копируем uploads
wget -r -np -nH --cut-dirs=0 -P build/ https://eltok.kz/uploads/

# Копируем icons
wget -r -np -nH --cut-dirs=0 -P build/ https://eltok.kz/icons/

# Копируем hero
wget -r -np -nH --cut-dirs=0 -P build/ https://eltok.kz/images/hero/
```

## Вариант 3: Через SFTP в Termius (ЛУЧШИЙ ВАРИАНТ)

### Шаг 1: Подключитесь к хостингу
1. Откройте Termius
2. Добавьте новый хост:
   - Host: `srv-plesk20.ps.kz`
   - User: `eltokkz`
   - Port: `22`
3. Подключитесь

### Шаг 2: Настройте SFTP File Manager
1. В Termius нажмите кнопку **"Files"** или **"File Transfer"**
2. Подключитесь к `srv-plesk20.ps.kz`

### Шаг 3: Скачайте папки
1. Перейдите в `/httpdocs/`
2. Выделите папки:
   - `fonts/`
   - `icons/`
   - `images/` (вся папка)
   - `uploads/`
3. Нажмите кнопку **"Download"** или просто перетащите в правую панель (локальную)
4. Сохраните локально в `D:\downloaded-assets\`

### Шаг 4: Загрузите на VPS
1. В Termius откройте новое подключение к VPS (`root@32470`)
2. Откройте **File Transfer** для VPS
3. Перейдите в `/var/www/electro/build/`
4. Загрузите папки: `fonts`, `icons`, `images`, `uploads`

## Вариант 4: Создать архив на хостинге через SSH

Подключитесь к хостингу:
```bash
ssh eltokkz@srv-plesk20.ps.kz
cd /httpdocs
tar -czf assets.tar.gz fonts/ icons/ images/ uploads/
```

Затем скачайте и загрузите на VPS:
```bash
# С VPS скачайте архив
cd /var/www/electro
wget https://eltok.kz/assets.tar.gz

# Или через scp с локального компьютера:
# scp eltokkz@srv-plesk20.ps.kz:/httpdocs/assets.tar.gz .

# Распакуйте
tar -xzf assets.tar.gz -C build/

# Удалите архив
rm assets.tar.gz
```

## После копирования файлов

```bash
cd /var/www/electro

# Установите права
chown -R www-data:www-data build/
chmod -R 755 build/

# Проверьте файлы
ls -la build/images/products/ | head -20

# Перезапустите
pm2 restart electro
```

