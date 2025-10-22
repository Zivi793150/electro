import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'https://electro-1-vjdu.onrender.com/api/admin/products';
const PRODUCTS_API_URL = 'https://electro-1-vjdu.onrender.com/api/products';

function RentalList({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentalProducts, setRentalProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('rental'); // 'rental' или 'available'

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Разделяем товары на арендуемые и доступные для добавления
    const rental = products.filter(p => p.rentalAvailable);
    const sale = products.filter(p => !p.rentalAvailable && p.saleAvailable !== false);
    setRentalProducts(rental);
    setSaleProducts(sale);
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
    setLoading(false);
  };

  const handleAddToRental = async (product) => {
    try {
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          rentalAvailable: true,
          rentalPrice: product.rentalPrice || null
        })
      });

      if (response.ok) {
        fetchProducts();
        alert('Товар добавлен в аренду!');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении товара в аренду');
    }
  };

  const handleRemoveFromRental = async (product) => {
    if (!window.confirm('Убрать товар из аренды?')) return;

    try {
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          rentalAvailable: false,
          rentalPrice: null
        })
      });

      if (response.ok) {
        fetchProducts();
        alert('Товар убран из аренды');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении товара из аренды');
    }
  };

  const handleUpdateRentalPrice = async (product, newPrice) => {
    try {
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          rentalPrice: parseFloat(newPrice) || null
        })
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const filteredRentalProducts = rentalProducts.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSaleProducts = saleProducts.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>🏠 Управление арендой</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/admin/products" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '500' }}>
            ← К товарам
          </Link>
          <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '500' }}>
            Заказы
          </Link>
          <Link to="/admin/variations" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '500' }}>
            Вариации
          </Link>
          <Link to="/admin/settings" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '500' }}>
            Настройки
          </Link>
          <button onClick={onLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Поиск товара..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
        <button
          onClick={() => setActiveTab('rental')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'rental' ? '#fff' : 'transparent',
            color: activeTab === 'rental' ? '#1e88e5' : '#666',
            border: 'none',
            borderBottom: activeTab === 'rental' ? '3px solid #1e88e5' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          В аренде ({rentalProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'available' ? '#fff' : 'transparent',
            color: activeTab === 'available' ? '#1e88e5' : '#666',
            border: 'none',
            borderBottom: activeTab === 'available' ? '3px solid #1e88e5' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          Доступные для добавления ({saleProducts.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Загрузка...</div>
      ) : (
        <>
          {/* Rental Tab */}
          {activeTab === 'rental' && (
            <div>
              {filteredRentalProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Нет товаров в аренде
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {filteredRentalProducts.map(product => (
                    <div key={product._id} style={{
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#fff'
                    }}>
                      <img
                        src={product.image || '/images/products/placeholder.png'}
                        alt={product.name}
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }}
                      />
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                          Цена аренды (₸/сутки):
                        </label>
                        <input
                          type="number"
                          defaultValue={product.rentalPrice || ''}
                          onBlur={(e) => handleUpdateRentalPrice(product, e.target.value)}
                          placeholder="Цена не указана"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFromRental(product)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Убрать из аренды
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Available Tab */}
          {activeTab === 'available' && (
            <div>
              {filteredSaleProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Все товары уже добавлены в аренду
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {filteredSaleProducts.map(product => (
                    <div key={product._id} style={{
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#fff'
                    }}>
                      <img
                        src={product.image || '/images/products/placeholder.png'}
                        alt={product.name}
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }}
                      />
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{product.name}</h3>
                      <button
                        onClick={() => handleAddToRental(product)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        + Добавить в аренду
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RentalList;
