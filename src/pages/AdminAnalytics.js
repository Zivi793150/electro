import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, getAnalyticsEvents } from '../utils/analytics';
import '../styles/AdminAnalytics.css';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadStats();
    loadEvents();
  }, [period, currentPage, filters]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getAnalyticsStats(period);
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await getAnalyticsEvents(currentPage, 50, filters);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      'phone_click': 'Клик на телефон',
      'product_view': 'Просмотр товара',
      'form_submit': 'Отправка формы',
      'button_click': 'Клик на кнопку',
      'page_view': 'Просмотр страницы'
    };
    return labels[eventType] || eventType;
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'phone_click': '📞',
      'product_view': '👁️',
      'form_submit': '📝',
      'button_click': '🖱️',
      'page_view': '📄'
    };
    return icons[eventType] || '❓';
  };

  if (loading && !stats) {
    return <div className="admin-analytics-loading">Загрузка аналитики...</div>;
  }

  return (
    <div className="admin-analytics">
      <div className="admin-analytics-header">
        <h1>Аналитика сайта</h1>
        <div className="period-selector">
          <label>Период:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="24h">Последние 24 часа</option>
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="90d">Последние 90 дней</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="stats-overview">
          <div className="stats-card total-events">
            <h3>Всего событий</h3>
            <div className="stats-number">{stats.summary.totalEvents}</div>
          </div>
          <div className="stats-card unique-sessions">
            <h3>Уникальных сессий</h3>
            <div className="stats-number">{stats.summary.uniqueSessions}</div>
          </div>
          <div className="stats-card period-info">
            <h3>Период</h3>
            <div className="stats-text">
              {new Date(stats.startDate).toLocaleDateString('ru-RU')} - {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="stats-details">
          <div className="stats-section">
            <h3>Статистика по типам событий</h3>
            <div className="stats-grid">
              {stats.eventStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-icon">{getEventIcon(stat.eventType)}</div>
                  <div className="stat-info">
                    <div className="stat-label">{getEventTypeLabel(stat.eventType)}</div>
                    <div className="stat-count">{stat.count}</div>
                    <div className="stat-unique">Уникальных: {stat.uniqueSessions}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h3>Топ товаров по просмотрам</h3>
            <div className="top-products">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="product-stat">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.productName || 'Неизвестный товар'}</div>
                    <div className="product-views">
                      Просмотров: {product.views} | Уникальных: {product.uniqueViews}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h3>Статистика по страницам</h3>
            <div className="page-stats">
              {stats.pageStats.map((page, index) => (
                <div key={index} className="page-stat">
                  <div className="page-name">{page.page || 'Главная'}</div>
                  <div className="page-views">
                    Просмотров: {page.views} | Уникальных: {page.uniqueViews}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="events-section">
        <h3>Детальные события</h3>
        <div className="events-filters">
          <select 
            value={filters.eventType || ''} 
            onChange={(e) => setFilters({...filters, eventType: e.target.value || undefined})}
          >
            <option value="">Все типы событий</option>
            <option value="phone_click">Клик на телефон</option>
            <option value="product_view">Просмотр товара</option>
            <option value="form_submit">Отправка формы</option>
            <option value="button_click">Клик на кнопку</option>
            <option value="page_view">Просмотр страницы</option>
          </select>
        </div>
        
        <div className="events-table">
          <table>
            <thead>
              <tr>
                <th>Время</th>
                <th>Тип</th>
                <th>Данные</th>
                <th>Страница</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{formatDate(event.timestamp)}</td>
                  <td>
                    <span className="event-type">
                      {getEventIcon(event.eventType)} {getEventTypeLabel(event.eventType)}
                    </span>
                  </td>
                  <td>
                    <div className="event-data">
                      {event.eventData && Object.keys(event.eventData).length > 0 ? (
                        Object.entries(event.eventData).map(([key, value]) => (
                          <div key={key} className="event-data-item">
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))
                      ) : (
                        <span className="no-data">Нет данных</span>
                      )}
                    </div>
                  </td>
                  <td>{event.page || '-'}</td>
                  <td>{event.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </button>
          <span>Страница {currentPage}</span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={events.length < 50}
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
