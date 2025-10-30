import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api/admin/products';
const PRODUCTS_API_URL = '/api/products';

function RentalList({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentalProducts, setRentalProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('rental'); // 'rental' или 'available'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    image: '',
    rentalPrice: '',
    category: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  // Черновики для редактирования товаров аренды
  const [drafts, setDrafts] = useState({}); // { [productId]: { name, image, rentalPrice } }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Разделяем товары на арендуемые и доступные для добавления
    const rental = products.filter(p => p.rentalAvailable);
    const sale = products.filter(p => !p.rentalAvailable && p.saleAvailable !== false);
    setRentalProducts(rental);
    setSaleProducts(sale);
    // Инициализируем черновики по текущим данным
    const nextDrafts = {};
    products.forEach(p => {
      if (!p || !p._id) return;
      nextDrafts[p._id] = {
        name: (p.name || ''),
        image: (p.image || ''),
        rentalPrice: (p.rentalPrice ?? '')
      };
    });
    setDrafts(nextDrafts);
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

  const setDraftField = (productId, field, value) => {
    setDrafts(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value
      }
    }));
  };

  const saveRentalDraft = async (product) => {
    const d = drafts[product._id] || {};
    const fields = {
      name: d.name ?? product.name,
      image: d.image ?? product.image,
      rentalPrice: d.rentalPrice === '' ? null : Number(d.rentalPrice)
    };
    await handleUpdateRentalFields(product, fields);
  };

  // Обновление произвольных полей для арендуемого товара (например, имя/фото)
  const handleUpdateRentalFields = async (product, fields) => {
    try {
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          ...fields
        })
      });
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Не удалось сохранить изменения');
      }
    } catch (e) {
      console.error('Ошибка сохранения полей аренды:', e);
      alert('Ошибка сохранения');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', files[0]);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      
      const result = await response.json();
      
      if (result.webp) {
        setNewProduct({ ...newProduct, image: result.webp.path });
        alert('✅ Изображение успешно загружено!');
      } else {
        setNewProduct({ ...newProduct, image: result.original.path });
        alert('✅ Файл успешно загружен!');
      }
    } catch (err) {
      alert('Ошибка загрузки файла: ' + err.message);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleCreateRentalProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.rentalPrice) {
      alert('Заполните название и цену аренды');
      return;
    }

    try {
      const response = await fetch(PRODUCTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          image: newProduct.image || '/images/products/placeholder.png',
          priceUSD: '0',
          category: newProduct.category || 'Аренда',
          rentalAvailable: true,
          rentalPrice: parseFloat(newProduct.rentalPrice),
          saleAvailable: false,
          description: '',
          characteristics: '',
          slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          categorySlug: (newProduct.category || 'аренда').toLowerCase().replace(/[^a-z0-9]/g, '-')
        })
      });

      if (response.ok) {
        fetchProducts();
        setShowAddForm(false);
        setNewProduct({ name: '', image: '', rentalPrice: '', category: '' });
        alert('Товар для аренды добавлен!');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании товара');
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
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            + Добавить товар для аренды
          </button>
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
                  <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, marginBottom:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:13, color:'#666', marginBottom:4 }}>Название</label>
                      <input
                        type="text"
                        value={(drafts[product._id]?.name) ?? product.name}
                        onChange={(e)=> setDraftField(product._id, 'name', e.target.value)}
                        style={{ width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4, fontSize:14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:13, color:'#666', marginBottom:4 }}>Фото (URL)</label>
                      <input
                        type="text"
                        value={(drafts[product._id]?.image) ?? (product.image || '')}
                        onChange={(e)=> setDraftField(product._id, 'image', e.target.value)}
                        placeholder="https://..."
                        style={{ width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4, fontSize:14 }}
                      />
                    </div>
                  </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                          Цена аренды (₸/сутки):
                        </label>
                        <input
                          type="number"
                          value={(drafts[product._id]?.rentalPrice) ?? (product.rentalPrice || '')}
                          onChange={(e) => setDraftField(product._id, 'rentalPrice', e.target.value)}
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
                        onClick={() => saveRentalDraft(product)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#FF6B00',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginBottom: '10px'
                        }}
                      >
                        Сохранить
                      </button>
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

      {/* Add Product Form Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Добавить товар для аренды</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct({ name: '', image: '', rentalPrice: '', category: '' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRentalProduct}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Название товара *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Например: Перфоратор Makita"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Цена аренды (₸/сутки) *
                </label>
                <input
                  type="number"
                  required
                  value={newProduct.rentalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, rentalPrice: e.target.value })}
                  placeholder="5000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Категория
                </label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Например: Перфораторы"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Главное фото
                </label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="URL главного изображения"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    style={{ flex: 1, fontSize: '14px' }}
                  />
                  {uploadingImage && (
                    <span style={{ color: '#1e88e5', fontSize: '14px' }}>Загрузка...</span>
                  )}
                </div>
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  💡 Загрузите файл или вставьте URL. Если не указано - placeholder
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProduct({ name: '', image: '', rentalPrice: '', category: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalList;
