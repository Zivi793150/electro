const CACHE_NAME = 'electro-cache-v2';
const STATIC_CACHE = 'electro-static-v2';
const API_CACHE = 'electro-api-v2';

// Файлы для кэширования
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.webp',
  '/logo.png',
  '/manifest.json'
];

// API endpoints для кэширования
const API_ENDPOINTS = [
  '/api/products',
  '/api/information',
  '/api/rate/usd-kzt'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker установлен');
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Кэшируем статические файлы
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Кэшируем статические файлы');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Кэшируем API endpoints
      caches.open(API_CACHE).then((cache) => {
        console.log('🔌 Кэшируем API endpoints');
        return cache.addAll(API_ENDPOINTS);
      })
    ])
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker активирован');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Обрабатываем только GET запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // API запросы
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Статические файлы
  if (url.origin === self.location.origin) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Обработка API запросов
async function handleApiRequest(request) {
  try {
    // Сначала пытаемся получить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Клонируем ответ для кэширования
      const responseClone = networkResponse.clone();
      
      // Кэшируем успешный ответ
      caches.open(API_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
      
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Сетевой запрос не удался, используем кэш');
  }
  
  // Если сеть недоступна, используем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('📦 API ответ из кэша:', request.url);
    return cachedResponse;
  }
  
  // Если в кэше нет, возвращаем fallback
  return new Response(
    JSON.stringify({ error: 'Нет подключения к интернету' }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Обработка статических файлов
async function handleStaticRequest(request) {
  // Сначала пытаемся получить из кэша
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('📦 Статический файл из кэша:', request.url);
    return cachedResponse;
  }
  
  try {
    // Если в кэше нет, загружаем из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Клонируем ответ для кэширования
      const responseClone = networkResponse.clone();
      
      // Кэшируем успешный ответ
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Ошибка загрузки статического файла:', error);
    
    // Возвращаем fallback для HTML
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
  }
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Фоновая синхронизация');
    event.waitUntil(backgroundSync());
  }
});

// Фоновая синхронизация
async function backgroundSync() {
  try {
    // Обновляем кэш API
    const cache = await caches.open(API_CACHE);
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response);
          console.log('✅ Обновлен кэш для:', endpoint);
        }
      } catch (error) {
        console.log('❌ Ошибка обновления кэша для:', endpoint);
      }
    }
  } catch (error) {
    console.log('❌ Ошибка фоновой синхронизации:', error);
  }
}

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/logo.png',
        badge: '/logo.png',
        data: data.url
      })
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
}); 