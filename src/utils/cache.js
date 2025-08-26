// Утилита для кэширования API запросов
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 минут по умолчанию
  }

  // Получить данные из кэша
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Проверяем, не истек ли срок действия
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Сохранить данные в кэш
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  // Очистить кэш
  clear() {
    this.cache.clear();
  }

  // Удалить конкретный ключ
  delete(key) {
    this.cache.delete(key);
  }

  // Получить размер кэша
  size() {
    return this.cache.size;
  }
}

// Создаем глобальный экземпляр кэша
export const apiCache = new ApiCache();

// Функция для кэшированного fetch
export const fetchWithCache = async (url, options = {}, ttl = 5 * 60 * 1000) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Пытаемся получить данные из кэша
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log('📦 Данные загружены из кэша:', url);
    return cachedData;
  }

  // Если в кэше нет, делаем запрос
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // Сохраняем в кэш
    apiCache.set(cacheKey, data, ttl);
    console.log('💾 Данные сохранены в кэш:', url);
    
    return data;
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    throw error;
  }
};

// Функция для принудительного обновления кэша
export const refreshCache = (url, options = {}) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  apiCache.delete(cacheKey);
  console.log('🔄 Кэш обновлен для:', url);
};
