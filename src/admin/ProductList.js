import React, { useEffect, useState } from 'react';

const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/products'
  : '/api/products';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{maxWidth: 900, margin: '40px auto', background: '#fff', border: '1.5px solid #bdbdbd', borderRadius: 10, padding: 32, boxShadow: '0 4px 18px rgba(30,40,90,0.06)'}}>
      <h2 style={{marginBottom: 24}}>Товары</h2>
      <button style={{marginBottom: 18, background: '#FF6B00', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 16, cursor: 'pointer'}}>Добавить товар</button>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div style={{color: 'red'}}>{error}</div>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 15}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th style={{padding: '8px 6px', border: '1px solid #e0e0e0'}}>Фото</th>
              <th style={{padding: '8px 6px', border: '1px solid #e0e0e0'}}>Название</th>
              <th style={{padding: '8px 6px', border: '1px solid #e0e0e0'}}>Категория</th>
              <th style={{padding: '8px 6px', border: '1px solid #e0e0e0'}}>Цена</th>
              <th style={{padding: '8px 6px', border: '1px solid #e0e0e0'}}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td style={{padding: '6px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                  <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 48, height: 48, objectFit: 'contain', borderRadius: 4, background: '#fff'}} />
                </td>
                <td style={{padding: '6px', border: '1px solid #e0e0e0'}}>{product.name}</td>
                <td style={{padding: '6px', border: '1px solid #e0e0e0'}}>{product.category}</td>
                <td style={{padding: '6px', border: '1px solid #e0e0e0'}}>{product.price ? Number(product.price).toLocaleString('ru-RU') + ' ₸' : ''}</td>
                <td style={{padding: '6px', border: '1px solid #e0e0e0'}}>
                  <button style={{marginRight: 8, background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer'}}>Редактировать</button>
                  <button style={{background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer'}}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProductList; 