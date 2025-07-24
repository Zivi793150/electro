import React, { useEffect, useState } from 'react';

const API_URL = '/api/products';

function ProductForm({ onClose, onSuccess, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(initialData && initialData._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Преобразуем цену к числу с плавающей точкой, поддерживаем запятую и точку
    let parsedPrice = price.replace(',', '.');
    if (parsedPrice === '' || isNaN(Number(parsedPrice))) {
      setError('Введите корректную цену (например: 19.65 или 19,65)');
      setLoading(false);
      return;
    }
    parsedPrice = Number(parsedPrice);
    try {
      const res = await fetch(isEdit ? `${API_URL}/${initialData._id}` : API_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parsedPrice, category, image, description })
      });
      if (!res.ok) throw new Error(isEdit ? 'Ошибка при обновлении товара' : 'Ошибка при добавлении товара');
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка');
      setLoading(false);
    }
  };

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:10,padding:28,minWidth:340,maxWidth:400,boxShadow:'0 2px 16px rgba(30,40,90,0.10)'}}>
        <h3 style={{marginTop:0,marginBottom:18,fontWeight:700,fontSize:20}}>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h3>
        <div style={{marginBottom:12}}>
          <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Название" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15}} />
        </div>
        <div style={{marginBottom:12}}>
          <input required type="text" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Цена (например: 19.65)" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15}} />
        </div>
        <div style={{marginBottom:12}}>
          <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Категория" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15}} />
        </div>
        <div style={{marginBottom:12}}>
          <input value={image} onChange={e=>setImage(e.target.value)} placeholder="URL изображения" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15}} />
        </div>
        <div style={{marginBottom:16}}>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Краткое описание" maxLength={160} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
        </div>
        {error && <div style={{color:'#e53935',marginBottom:10}}>{error}</div>}
        <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
          <button type="button" onClick={onClose} style={{background:'#f5f7fa',color:'#222',border:'1px solid #e0e0e0',borderRadius:6,padding:'7px 16px',fontWeight:500,cursor:'pointer'}}>Отмена</button>
          <button type="submit" disabled={loading} style={{background:'#FF6B00',color:'#fff',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:600,cursor:'pointer'}}>{loading ? (isEdit ? 'Сохранение...' : 'Добавление...') : (isEdit ? 'Сохранить' : 'Добавить')}</button>
        </div>
      </form>
    </div>
  );
}

const ProductList = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = () => {
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
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    try {
      const res = await fetch(`${API_URL}/${product._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка при удалении товара');
      fetchProducts();
    } catch (e) {
      alert('Ошибка при удалении товара');
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
      <div style={{maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
          <h2 style={{fontWeight: 700, fontSize: 24, color: '#1a2236', margin: 0}}>Товары</h2>
          <div>
            <button onClick={()=>{setShowForm(true);setEditProduct(null);}} style={{background: '#FF6B00', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>+ Добавить товар</button>
            <button onClick={onLogout} style={{background: '#e53935', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer'}}>Выйти</button>
          </div>
        </div>
        {loading ? (
          <div style={{padding: 32, textAlign: 'center'}}>Загрузка...</div>
        ) : error ? (
          <div style={{color: '#e53935', padding: 32, textAlign: 'center'}}>{error}</div>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff'}}>
            <thead>
              <tr style={{background: '#f5f7fa'}}>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Фото</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Название</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Цена</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Категория</th>
                <th style={{padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#222'}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} style={{borderBottom: '1px solid #e0e0e0'}}>
                  <td style={{padding: '6px 6px'}}>
                    <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 44, height: 44, objectFit: 'contain', borderRadius: 5, background: '#f5f7fa', border: '1px solid #e0e0e0'}} />
                  </td>
                  <td style={{padding: '6px 6px', fontWeight: 500, color: '#1a2236'}}>{product.name}</td>
                  <td style={{padding: '6px 6px', color: '#FFB300', fontWeight: 700}}>{product.price ? Number(product.price).toLocaleString('ru-RU') + ' ₸' : ''}</td>
                  <td style={{padding: '6px 6px', color: '#222'}}>{product.category || '-'}</td>
                  <td style={{padding: '6px 6px', textAlign: 'center'}}>
                    <button onClick={()=>handleEdit(product)} style={{background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, marginRight: 6, cursor: 'pointer'}}>Редактировать</button>
                    <button onClick={()=>handleDelete(product)} style={{background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer'}}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && <ProductForm onClose={handleFormClose} onSuccess={fetchProducts} initialData={editProduct} />}
    </div>
  );
};

export default ProductList; 