# Оптимизация производительности сайта

## Выполненные оптимизации

### 1. Изображения и CLS (Cumulative Layout Shift)

✅ **Добавлены атрибуты width/height для всех изображений:**
- Главное изображение на Home.js: `width="520" height="520"`
- Изображения товаров в каталоге: `width="260" height="160"`
- Миниатюры товаров: `width="200" height="120"`
- Логотипы: `width="133" height="41"`
- Иконки: `width="24" height="24"`

✅ **Добавлен fetchPriority для критических изображений:**
- Главное изображение: `fetchPriority="high"`

✅ **Добавлен loading="lazy" для некритических изображений**

### 2. CSS и блокирующие ресурсы

✅ **Асинхронная загрузка CSS:**
```html
<link rel="preload" href="/static/css/main.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/static/css/main.css"></noscript>
```

✅ **Критический CSS встроен в HTML:**
- Основные стили для главной страницы
- Шрифты с `font-display: swap`

✅ **Убраны Google Fonts** - используются локальные шрифты

### 3. Кэширование

✅ **Настроены заголовки кэширования на сервере:**
- CSS/JS: 1 год с `immutable`
- Изображения: 1 год с `immutable`
- Шрифты: 1 год с `immutable`
- HTML: 1 час

✅ **Service Worker для кэширования:**
- Критические ресурсы кэшируются при установке
- Стратегия "Cache First" для статических ресурсов

### 4. Предзагрузка ресурсов

✅ **Preconnect для внешних доменов:**
```html
<link rel="preconnect" href="https://electro-a8bl.onrender.com">
<link rel="dns-prefetch" href="https://electro-a8bl.onrender.com">
```

✅ **Preload критических ресурсов:**
- Главное изображение
- Логотип
- Критические шрифты

### 5. JavaScript оптимизации

✅ **Отложенная загрузка Google Maps:**
- iframe загружается только при прокрутке до карты
- `loading="lazy"` для iframe

✅ **Оптимизированные API запросы:**
- Кэширование на клиенте
- Обработка ошибок

## Рекомендации для дальнейшей оптимизации

### 1. Изображения

🔄 **Конвертация в WebP/AVIF:**
```bash
# Установка sharp для конвертации изображений
npm install sharp
```

🔄 **Responsive изображения:**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Описание" width="400" height="300">
</picture>
```

### 2. JavaScript

🔄 **Code Splitting:**
```javascript
// Ленивая загрузка компонентов
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

🔄 **Tree Shaking:**
- Удаление неиспользуемого кода
- Минификация в продакшене

### 3. CSS

🔄 **PurgeCSS для удаления неиспользуемых стилей:**
```bash
npm install purgecss
```

🔄 **Critical CSS:**
- Извлечение критических стилей
- Встроение в HTML

### 4. Серверные оптимизации

🔄 **Gzip/Brotli сжатие:**
```javascript
const compression = require('compression');
app.use(compression());
```

🔄 **HTTP/2 Server Push:**
```javascript
res.setHeader('Link', '</css/critical.css>; rel=preload; as=style');
```

### 5. Мониторинг производительности

🔄 **Web Vitals:**
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Целевые метрики

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s
- **TTFB (Time to First Byte):** < 600ms

## Инструменты для тестирования

1. **Google PageSpeed Insights**
2. **Lighthouse**
3. **WebPageTest**
4. **GTmetrix**
5. **Chrome DevTools Performance**

## Команды для сборки оптимизированной версии

```bash
# Продакшен сборка
npm run build

# Анализ размера бандла
npm install --save-dev webpack-bundle-analyzer
npm run analyze

# Оптимизация изображений
npm install --save-dev imagemin imagemin-webp
```

## Мониторинг в продакшене

1. **Real User Monitoring (RUM)**
2. **Core Web Vitals в Google Search Console**
3. **Аналитика производительности в браузере**
4. **Логирование медленных запросов** 