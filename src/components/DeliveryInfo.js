import React, { useState, useEffect } from 'react';

const DeliveryInfo = ({ city, onDeliverySelect, compact = false, selectedDelivery = null }) => {
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://electro-a8bl.onrender.com/api/pickup-points';

  useEffect(() => {
    if (city) {
      fetchDeliveryInfo(city);
    }
  }, [city]);

  const fetchDeliveryInfo = async (cityName) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Загружаем информацию о доставке для города:', cityName);
      const response = await fetch(`${API_URL}/delivery/${encodeURIComponent(cityName)}`);
      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Информация о доставке:', data);
        setDeliveryInfo(data);
      } else {
        console.error('HTTP ошибка:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о доставке:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('Сервер недоступен. Проверьте подключение к интернету.');
      } else if (error.message.includes('Unexpected token')) {
        setError('Сервер вернул неверный формат данных. Возможно, сервер не запущен.');
      } else {
        setError(`Ошибка загрузки: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySelect = (deliveryOption) => {
    if (onDeliverySelect) {
      onDeliverySelect(deliveryOption);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '12px', 
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        Загрузка информации о доставке...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '12px', 
        background: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        borderRadius: 6,
        color: '#721c24',
        marginBottom: 12,
        fontSize: '0.85rem'
      }}>
        ❌ {error}
      </div>
    );
  }

  if (!deliveryInfo) {
    return null;
  }

  // Компактный вид для страницы товара
  if (compact) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {deliveryInfo.deliveryOptions.slice(0, 3).map((option, index) => (
            <div
              key={index}
              onClick={() => handleDeliverySelect(option)}
              style={{
                border: selectedDelivery && selectedDelivery.type === option.type ? '2px solid #ffc107' : '1px solid #e0e0e0',
                borderRadius: 6,
                padding: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedDelivery && selectedDelivery.type === option.type ? '#fffbf0' : '#fff',
                fontSize: '0.85rem',
                boxShadow: selectedDelivery && selectedDelivery.type === option.type ? '0 2px 8px rgba(255, 193, 7, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#ffc107';
                e.target.style.boxShadow = '0 2px 8px rgba(255, 193, 7, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 2
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  fontWeight: 600, 
                  color: '#333' 
                }}>
                  <span style={{ fontSize: '1rem' }}>
                    {option.type === 'pickup' ? '🏬' : 
                     option.type === 'indriver' ? '🚗' :
                     option.type === 'yandex' ? '📦' :
                     option.type === 'kazpost' ? '📮' :
                     option.type === 'cdek' ? '🚚' :
                     option.type === 'air' ? '✈️' : '🚚'}
                  </span>
                  {option.name}
                </div>
                <div style={{ 
                  fontWeight: 700, 
                  color: option.cost === 0 ? '#28a745' : '#ffc107',
                  fontSize: '0.9rem'
                }}>
                  {option.cost === 0 ? 'Бесплатно' : `${option.cost} ₸`}
                </div>
              </div>
              <div style={{ color: '#666', fontSize: '0.75rem', marginLeft: '1.5rem' }}>
                {option.type === 'pickup' ? `Самовывоз из ${deliveryInfo.pickupPointsCount || 'наших'} пунктов` :
                 option.type === 'indriver' ? 'Курьерская доставка в течение дня' :
                 option.type === 'yandex' ? 'Быстрая курьерская доставка' :
                 option.type === 'kazpost' ? 'Почтовая доставка 3-5 дней' :
                 option.type === 'cdek' ? 'Экспресс доставка 1-2 дня' :
                 option.type === 'air' ? 'Авиа доставка 1-3 дня' : option.description}
              </div>
            </div>
          ))}
        </div>

        {deliveryInfo.deliveryOptions.length > 3 && (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: '#666',
            marginTop: 6
          }}>
            + еще {deliveryInfo.deliveryOptions.length - 3} варианта
          </div>
        )}
      </div>
    );
  }

  // Полный вид для страницы оформления заказа
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        color: '#333', 
        marginBottom: 16 
      }}>
        🚚 Варианты доставки в {deliveryInfo.city}
      </h3>

      {deliveryInfo.isAlmaty && deliveryInfo.hasPickupPoints ? (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 8,
            color: '#155724',
            fontWeight: 600
          }}>
            🎉 Бесплатная доставка!
          </div>
          <div style={{ color: '#155724', fontSize: 14 }}>
            В Алматы доступен самовывоз из наших пунктов выдачи
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ 
            color: '#856404', 
            fontSize: 14,
            marginBottom: 8
          }}>
            💡 Доставка в другие города осуществляется платно
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {deliveryInfo.deliveryOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => handleDeliverySelect(option)}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#ffc107';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 193, 7, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 4
            }}>
              <div style={{ fontWeight: 600, color: '#333' }}>
                {option.name}
              </div>
              <div style={{ 
                fontWeight: 700, 
                color: option.cost === 0 ? '#28a745' : '#ffc107',
                fontSize: 16
              }}>
                {option.cost === 0 ? 'Бесплатно' : `${option.cost} ₸`}
              </div>
            </div>
            <div style={{ color: '#666', fontSize: 14 }}>
              {option.description}
            </div>
          </div>
        ))}
      </div>

      {deliveryInfo.isAlmaty && deliveryInfo.hasPickupPoints && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => {
              // Здесь можно добавить логику для показа карты пунктов самовывоза
              alert('Функция показа пунктов самовывоза будет добавлена позже');
            }}
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            🗺️ Показать пункты самовывоза
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfo; 