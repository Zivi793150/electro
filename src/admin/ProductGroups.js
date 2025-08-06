import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://electro-a8bl.onrender.com/api/product-groups';

const ProductGroups = ({ onLogout }) => {
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProductGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Ошибка загрузки групп товаров');
      }
      const data = await response.json();
      setProductGroups(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductGroups();
  }, []);

  const getOptimalImage = (product, preferredSize = 'medium') => {
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  if (loading) {
    return (
      <div className="admin-container" style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
        <div style={{maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
          <div style={{padding: 50, textAlign: 'center'}}>Загрузка групп товаров...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container" style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
        <div style={{maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
          <div style={{color: '#e53935', padding: 50, textAlign: 'center'}}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
      <div style={{maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
          <h2 className="admin-header" style={{fontWeight: 700, fontSize: 24, color: '#1a2236', margin: 0}}>
            Группы товаров по вольтам
          </h2>
          <div>
            <button onClick={() => navigate('/admin')} style={{background: '#1e88e5', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>← Назад к товарам</button>
            <button onClick={onLogout} style={{background: '#e53935', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer'}}>Выйти</button>
          </div>
        </div>

        {productGroups.length === 0 ? (
          <div style={{textAlign: 'center', padding: '50px 20px', color: '#666'}}>
            <h3 style={{marginBottom: '16px', color: '#333'}}>Группы товаров не найдены</h3>
            <p style={{marginBottom: '24px'}}>
              Для создания групп товаров по вольтам добавьте товары с названиями в формате:<br />
              <strong>"Название 220 Вольт"</strong>, <strong>"Название 380 Вольт"</strong> и т.д.
            </p>
            <button 
              onClick={() => navigate('/admin')} 
              style={{
                background: '#FF6B00', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 15, 
                border: 'none', 
                borderRadius: 7, 
                padding: '12px 24px', 
                cursor: 'pointer'
              }}
            >
              Добавить товары
            </button>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '20px'}}>
            {productGroups.map((group, index) => (
              <div 
                key={index} 
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#fafafa'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                  <div>
                    <h3 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#333'}}>
                      {group.baseName}
                    </h3>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      {group.voltages.map(voltage => (
                        <span 
                          key={voltage}
                          style={{
                            background: '#e86c0a',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {voltage} В
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>
                      Товаров в группе: {group.products.length}
                    </div>
                    <button 
                      onClick={() => window.open(`/product-group/${encodeURIComponent(group.baseName)}`, '_blank')}
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Посмотреть на сайте
                    </button>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px'}}>
                  {group.products.map((product, productIndex) => (
                    <div 
                      key={productIndex}
                      style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}
                    >
                      <img 
                        src={getOptimalImage(product, 'thumb')} 
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          background: '#f5f7fa',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: '500', fontSize: '14px', color: '#333', marginBottom: '4px'}}>
                          {product.name}
                        </div>
                        <div style={{fontSize: '13px', color: '#666', marginBottom: '4px'}}>
                          Артикул: {product.article || 'Не указан'}
                        </div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: '#FFB300'}}>
                          {Number(product.price).toLocaleString('ru-RU')} ₸
                        </div>
                      </div>
                      <div style={{textAlign: 'center'}}>
                        <div style={{
                          background: '#e86c0a',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {product.voltage} В
                        </div>
                        <button 
                          onClick={() => window.open(`/admin`, '_blank')}
                          style={{
                            background: '#1e88e5',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Редактировать
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop: '32px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
          <h4 style={{margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#495057'}}>
            💡 Как создать группу товаров по вольтам:
          </h4>
          <ol style={{margin: 0, paddingLeft: '20px', color: '#666', lineHeight: '1.6'}}>
            <li>Добавьте товары с одинаковым базовым названием</li>
            <li>В названии укажите напряжение в формате: "Название 220 Вольт"</li>
            <li>Система автоматически сгруппирует товары по базовому названию</li>
            <li>На сайте пользователи смогут выбирать нужное напряжение</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProductGroups; 