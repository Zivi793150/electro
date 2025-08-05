# 🔧 Диагностика проблем с WebP

## 🚨 Проблема: WebP изображения не отображаются

### ✅ Что мы исправили:

1. **Добавили MIME типы в .htaccess:**
   ```apache
   AddType image/webp .webp
   AddType image/avif .avif
   ```

2. **Добавили MIME типы в Express сервер:**
   ```javascript
   app.use((req, res, next) => {
     if (req.path.endsWith('.webp')) {
       res.setHeader('Content-Type', 'image/webp');
     }
     next();
   });
   ```

3. **Создали тестовую страницу:** `/test-webp.html`

## 🔍 Шаги для диагностики:

### 1. Проверьте тестовую страницу
Откройте: `https://ваш-домен.com/test-webp.html`

Эта страница покажет:
- ✅ Поддерживает ли браузер WebP
- ✅ Загружаются ли WebP файлы
- ✅ Работают ли Picture элементы
- ✅ Информацию о браузере

### 2. Проверьте в DevTools
1. Откройте DevTools (F12)
2. Перейдите на вкладку **Network**
3. Обновите страницу
4. Найдите запросы к `.webp` файлам
5. Проверьте:
   - **Status Code** (должен быть 200)
   - **Content-Type** (должен быть `image/webp`)
   - **Response Headers**

### 3. Проверьте серверные логи
Если используете Apache, проверьте error.log:
```bash
tail -f /var/log/apache2/error.log
```

### 4. Проверьте права доступа
```bash
ls -la /path/to/your/webp/files
```
Права должны быть: `644` или `rw-r--r--`

## 🛠️ Возможные решения:

### Если WebP не поддерживается браузером:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback">
</picture>
```

### Если проблема с MIME типами:
Добавьте в `.htaccess`:
```apache
<IfModule mod_mime.c>
  AddType image/webp .webp
</IfModule>
```

### Если проблема с кэшированием:
Очистите кэш браузера или добавьте версию:
```html
<img src="/image.webp?v=1" alt="Image">
```

## 📋 Чек-лист:

- [ ] WebP файлы загружены на сервер
- [ ] MIME типы настроены в .htaccess
- [ ] MIME типы настроены в Express
- [ ] Права доступа корректные (644)
- [ ] Браузер поддерживает WebP
- [ ] Нет ошибок в DevTools Network
- [ ] Нет ошибок в серверных логах

## 🆘 Если ничего не помогает:

1. **Временно используйте только JPEG:**
   ```html
   <img src="/images/hero/hero-main.jpg" alt="Image">
   ```

2. **Проверьте хостинг:**
   - Некоторые хостинги не поддерживают WebP
   - Обратитесь в поддержку хостинга

3. **Используйте CDN:**
   - Загрузите изображения на CDN
   - CDN автоматически настроит MIME типы

## 📞 Поддержка:

Если проблема остается, предоставьте:
1. Результаты тестовой страницы
2. Скриншот DevTools Network
3. Серверные логи
4. Информацию о хостинге 