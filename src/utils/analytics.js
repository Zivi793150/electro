const API_BASE = 'https://electro-a8bl.onrender.com';

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
  trackEvent('phone_click', {
    phoneNumber,
    context,
    buttonText: 'Позвонить'
  });
};

// Отслеживание просмотра товара
export const trackProductView = (productId, productName) => {
  trackEvent('product_view', {
    productName
  }, productId);
};

// Отслеживание отправки формы
export const trackFormSubmit = (formType, productId = null) => {
  trackEvent('form_submit', {
    formType
  }, productId);
};

// Отслеживание клика на кнопку
export const trackButtonClick = (buttonText, context = '', productId = null) => {
  trackEvent('button_click', {
    buttonText,
    context
  }, productId);
};

// Отслеживание просмотра страницы
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    pageName
  });
};

// Автоматическое отслеживание при загрузке страницы
export const initPageTracking = () => {
  // Отслеживаем текущую страницу
  const pageName = window.location.pathname;
  trackPageView(pageName);

  // Отслеживаем клики на телефонные номера
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Клик на телефонный номер
    if (target.tagName === 'A' && target.href.startsWith('tel:')) {
      const phoneNumber = target.href.replace('tel:', '');
      const context = target.closest('[data-analytics-context]')?.dataset.analyticsContext || '';
      trackPhoneClick(phoneNumber, context);
    }
    
    // Клик на кнопку "Позвонить"
    if (target.textContent.includes('Позвонить') || target.textContent.includes('Звонить')) {
      const context = target.closest('[data-analytics-context]')?.dataset.analyticsContext || '';
      trackButtonClick('Позвонить', context);
    }
    
    // Клик на кнопку "Задать вопрос"
    if (target.textContent.includes('Задать вопрос')) {
      const context = target.closest('[data-analytics-context]')?.dataset.analyticsContext || '';
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
