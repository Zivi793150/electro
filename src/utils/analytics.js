/* global ym, gtag */
const API_BASE = 'https://electro-1-vjdu.onrender.com';

// Генерируем уникальный sessionId для анонимных пользователей
const getSessionId = () => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Helpers
const parseUtmParams = () => {
  const params = new URLSearchParams(window.location.search || '');
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || ''
  };
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  let os = 'Other';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Other';
  if (/Chrome\//i.test(ua) && !/Edge\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Edg\//i.test(ua)) browser = 'Edge';

  return { isMobile, os, browser };
};

const detectChannel = (referrer) => {
  try {
    const host = referrer ? new URL(referrer).hostname : '';
    if (!host) return 'direct';
    if (/google\.|yandex\.|bing\.|yahoo\./i.test(host)) return 'organic';
    if (/t\.me|telegram|wa\.me|whatsapp|vk\.com|facebook|instagram|instagr|ok\.ru/i.test(host)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
};

// Отправка события на сервер
const trackEvent = async (eventType, eventData = {}, productId = null) => {
  try {
    const clientSessionId = getSessionId();
    const utm = parseUtmParams();
    const device = getDeviceInfo();
    const referrer = document.referrer || '';
    const channel = detectChannel(referrer);

    const response = await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventData: {
          ...eventData,
          ...utm,
          device,
          channel
        },
        clientSessionId,
        productId,
        page: window.location.pathname,
        referrer
      })
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.status);
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

// Отслеживание клика на телефон
export const trackPhoneClick = (phoneNumber, context = '') => {
  // Отправляем событие в нашу аналитику
  trackEvent('phone_click', {
    phoneNumber,
    context,
    buttonText: 'Позвонить'
  });

  // Отправляем цель в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'PHONE_CLICK');
      
      // Дополнительная цель с контекстом
      if (context) {
        const contextGoal = `PHONE_CLICK_${context.toUpperCase()}`;
        ym(104706911, 'reachGoal', contextGoal);
      }
    } catch (error) {
      console.warn('Ошибка отправки цели в Яндекс.Метрику:', error);
    }
  }

  // Отправляем в Google Tag Manager если доступен
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'phone_click', {
        'phone_number': phoneNumber,
        'phone_context': context
      });
    } catch (error) {
      console.warn('Ошибка отправки события в Google Analytics:', error);
    }
  }
};

// Отслеживание клика на социальные сети
export const trackSocialClick = (platform, context = '', url = '') => {
  // Отправляем событие в нашу аналитику
  trackEvent('social_click', {
    platform,
    context,
    url
  });

  // Отправляем цель в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      // Общая цель для всех соцсетей
      ym(104706911, 'reachGoal', 'SOCIAL_CLICK');
      
      // Специфичная цель для каждой платформы
      const goalName = `SOCIAL_${platform.toUpperCase()}`;
      ym(104706911, 'reachGoal', goalName);
      
      // Дополнительная цель с контекстом
      if (context) {
        const contextGoal = `SOCIAL_${platform.toUpperCase()}_${context.toUpperCase()}`;
        ym(104706911, 'reachGoal', contextGoal);
      }
    } catch (error) {
      console.warn('Ошибка отправки цели в Яндекс.Метрику:', error);
    }
  }

  // Отправляем в Google Tag Manager если доступен
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'social_click', {
        'social_platform': platform,
        'social_context': context,
        'social_url': url
      });
    } catch (error) {
      console.warn('Ошибка отправки события в Google Analytics:', error);
    }
  }
};

// Отслеживание просмотра товара (расширенное)
export const trackProductView = (productId, productName, productPrice = null, productCategory = null) => {
  trackEvent('product_view', {
    productName,
    productPrice,
    productCategory
  }, productId);

  // Enhanced ecommerce для Google Analytics
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'view_item', {
        'currency': 'KZT',
        'value': productPrice || 0,
        'items': [{
          'item_id': productId,
          'item_name': productName,
          'item_category': productCategory || 'Не указана',
          'price': productPrice || 0,
          'quantity': 1
        }]
      });
    } catch (error) {
      console.warn('Ошибка отправки view_item в Google Analytics:', error);
    }
  }

  // Еще одна цель в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'PRODUCT_VIEW', {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_category: productCategory
      });
    } catch (error) {
      console.warn('Ошибка отправки PRODUCT_VIEW в Яндекс.Метрику:', error);
    }
  }
};

// Отслеживание отправки формы
export const trackFormSubmit = (formType, productId = null) => {
  trackEvent('form_submit', {
    formType
  }, productId);
};

// Отслеживание завершения покупки
export const trackPurchaseComplete = (orderId, productId, productName, price, context = '') => {
  // Отправляем событие в нашу аналитику
  trackEvent('purchase_complete', {
    orderId,
    productName,
    price,
    context
  }, productId);

  // Отправляем цель в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'PURCHASE_COMPLETE', {
        order_id: orderId,
        product_id: productId,
        product_name: productName,
        price: price
      });
      
      // Дополнительная цель с контекстом
      if (context) {
        const contextGoal = `PURCHASE_COMPLETE_${context.toUpperCase()}`;
        ym(104706911, 'reachGoal', contextGoal);
      }
    } catch (error) {
      console.warn('Ошибка отправки цели в Яндекс.Метрику:', error);
    }
  }

  // Отправляем в Google Tag Manager если доступен
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'purchase', {
        'transaction_id': orderId,
        'currency': 'KZT',
        'value': price,
        'items': [{
          'item_id': productId,
          'item_name': productName,
          'price': price,
          'quantity': 1
        }]
      });
    } catch (error) {
      console.warn('Ошибка отправки события в Google Analytics:', error);
    }
  }
};

// Отслеживание клика на кнопку
export const trackButtonClick = (buttonText, context = '', productId = null) => {
  trackEvent('button_click', {
    buttonText,
    context
  }, productId);
};

// Отслеживание покупки (переход к оформлению заказа)
export const trackPurchaseStart = (productId, productName, price, context = '') => {
  // Отправляем событие в нашу аналитику
  trackEvent('purchase_start', {
    productName,
    price,
    context
  }, productId);

  // Отправляем цель в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'PURCHASE_START', {
        product_id: productId,
        product_name: productName,
        price: price
      });
      
      // Дополнительная цель с контекстом
      if (context) {
        const contextGoal = `PURCHASE_START_${context.toUpperCase()}`;
        ym(104706911, 'reachGoal', contextGoal);
      }
    } catch (error) {
      console.warn('Ошибка отправки цели в Яндекс.Метрику:', error);
    }
  }

  // Отправляем в Google Tag Manager если доступен
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'begin_checkout', {
        'currency': 'KZT',
        'value': price,
        'items': [{
          'item_id': productId,
          'item_name': productName,
          'price': price,
          'quantity': 1
        }]
      });
    } catch (error) {
      console.warn('Ошибка отправки события в Google Analytics:', error);
    }
  }
};

// Отслеживание просмотра страницы
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    pageName
  });
};

// Отслеживание поиска (для будущего функционала)
export const trackSearch = (searchTerm, resultsCount = 0) => {
  trackEvent('search', {
    searchTerm,
    resultsCount
  });

  // Отправляем в Google Analytics
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'search', {
        'search_term': searchTerm,
        'results_count': resultsCount
      });
    } catch (error) {
      console.warn('Ошибка отправки search в Google Analytics:', error);
    }
  }

  // Отправляем в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'SEARCH', {
        search_term: searchTerm,
        results_count: resultsCount
      });
    } catch (error) {
      console.warn('Ошибка отправки SEARCH в Яндекс.Метрику:', error);
    }
  }
};

// Отслеживание просмотра категории
export const trackCategoryView = (categoryName, categoryId, productsCount = 0) => {
  trackEvent('category_view', {
    categoryName,
    categoryId,
    productsCount
  });

  // Отправляем в Google Analytics
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', 'view_item_list', {
        'item_list_id': categoryId,
        'item_list_name': categoryName,
        'items_count': productsCount
      });
    } catch (error) {
      console.warn('Ошибка отправки view_item_list в Google Analytics:', error);
    }
  }

  // Отправляем в Яндекс.Метрику
  if (typeof ym !== 'undefined') {
    try {
      ym(104706911, 'reachGoal', 'CATEGORY_VIEW', {
        category_name: categoryName,
        category_id: categoryId,
        products_count: productsCount
      });
    } catch (error) {
      console.warn('Ошибка отправки CATEGORY_VIEW в Яндекс.Метрику:', error);
    }
  }
};

// Автоматическое отслеживание при загрузке страницы
export const initPageTracking = () => {
  // Отслеживаем текущую страницу
  const pageName = window.location.pathname;
  trackPageView(pageName);

  // Отслеживаем клики на телефонные номера и социальные сети
  document.addEventListener('click', (e) => {
    const target = e.target;
    const link = target.closest('a'); // Найти ближайшую ссылку (на случай клика на img внутри ссылки)
    
    // Клик на телефонный номер
    if (link && link.href.startsWith('tel:')) {
      const phoneNumber = link.href.replace('tel:', '');
      const context = link.closest('[data-analytics-context]')?.dataset.analyticsContext || 'auto_detect';
      trackPhoneClick(phoneNumber, context);
    }
    
    // Клик на социальные сети (автоматическое определение)
    if (link && link.href) {
      const url = link.href;
      let platform = null;
      
      if (url.includes('whatsapp') || url.includes('wa.me')) {
        platform = 'WhatsApp';
      } else if (url.includes('instagram')) {
        platform = 'Instagram';
      } else if (url.includes('facebook')) {
        platform = 'Facebook';
      } else if (url.includes('tiktok')) {
        platform = 'TikTok';
      } else if (url.includes('telegram') || url.includes('t.me')) {
        platform = 'Telegram';
      } else if (url.includes('vk.com')) {
        platform = 'VKontakte';
      } else if (url.includes('youtube')) {
        platform = 'YouTube';
      } else if (url.includes('twitter') || url.includes('x.com')) {
        platform = 'Twitter';
      }
      
      if (platform) {
        const context = link.closest('[data-analytics-context]')?.dataset.analyticsContext || 'auto_detect';
        trackSocialClick(platform, context, url);
      }
    }
    
    // Клик на кнопку "Позвонить"
    if (target.textContent.includes('Позвонить') || target.textContent.includes('Звонить')) {
      const context = target.closest('[data-analytics-context]')?.dataset.analyticsContext || 'auto_detect';
      trackButtonClick('Позвонить', context);
    }
    
    // Клик на кнопку "Задать вопрос"
    if (target.textContent.includes('Задать вопрос')) {
      const context = target.closest('[data-analytics-context]')?.dataset.analyticsContext || 'auto_detect';
      trackButtonClick('Задать вопрос', context);
    }
  });
};

// Утилита для получения статистики (для админки)
export const getAnalyticsStats = async (period = '7d', eventType = null) => {
  try {
    const params = new URLSearchParams({ period });
    if (eventType) params.append('eventType', eventType);
    
    const response = await fetch(`${API_BASE}/api/analytics/stats?${params}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    throw error;
  }
};

// Утилита для получения детальных событий
export const getAnalyticsEvents = async (page = 1, limit = 50, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await fetch(`${API_BASE}/api/analytics/events?${params}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    throw error;
  }
};
