import React, { useState, useEffect } from 'react';
import './ProductMerge.css';

const API_URL = 'https://electro-a8bl.onrender.com/api';

function ProductMerge({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [masterProducts, setMasterProducts] = useState([]);
  const [showMergeForm, setShowMergeForm] = useState(false);
  const [mergeFormData, setMergeFormData] = useState({
    name: '',
    category: '',
    description: '',
    shortDescription: '',
    mainImage: '',
    variationType: 'power'
  });

  // Состояние для произвольных параметров вариаций
  const [variationOptions, setVariationOptions] = useState([]);
  const [useCustomOptions, setUseCustomOptions] = useState(false);

  // Загрузка всех товаров
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      // Проверяем, что data является массивом
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка мастер-товаров
  const fetchMasterProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/master-products`);
      const data = await response.json();
      // Проверяем, что data является массивом
      setMasterProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки мастер-товаров:', err);
      setMasterProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMasterProducts();
  }, []);

  // Выбор товара
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Выбор всех товаров
  const handleSelectAll = () => {
    if (!Array.isArray(products)) return;
    
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.filter(p => p && p._id).map(p => p._id));
    }
  };

  // Открытие формы объединения
  const handleMergeClick = () => {
    if (selectedProducts.length < 2) {
      setError('Выберите минимум 2 товара для объединения');
      return;
    }
    
    const selectedProductObjects = products.filter(p => selectedProducts.includes(p._id));
    
    // Автоматически заполняем форму данными первого товара
    const firstProduct = selectedProductObjects[0];
    setMergeFormData({
      name: firstProduct.name.replace(/\d+\s*[ВтW]/i, '').trim(), // Убираем мощность из названия
      category: firstProduct.category || '',
      description: firstProduct.description || '',
      shortDescription: firstProduct['Short description'] || '',
      mainImage: firstProduct.image || '',
      variationType: 'power'
    });
    
    setShowMergeForm(true);
    setError('');
  };

  // Объединение товаров
  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/merge-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        const requestData = {
          productIds: selectedProducts,
          masterProductData: mergeFormData,
          variationType: useCustomOptions ? null : mergeFormData.variationType,
          variationOptions: useCustomOptions ? getVariationOptionsForAPI() : null
        };
        
        console.log('Отправляем данные на сервер:', requestData);
        
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка объединения товаров');
      }
      
      setSuccess(data.message);
      setSelectedProducts([]);
      setShowMergeForm(false);
      setMergeFormData({
        name: '',
        category: '',
        description: '',
        shortDescription: '',
        mainImage: '',
        variationType: 'power'
      });
      
      // Обновляем списки
      await fetchProducts();
      await fetchMasterProducts();
      
      // Очищаем сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Удаление мастер-товара
  const handleDeleteMasterProduct = async (masterProductId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот мастер-товар и все его вариации?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/master-products/${masterProductId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления');
      }
      
      setSuccess('Мастер-товар успешно удален');
      await fetchMasterProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Получение выбранных товаров
  const getSelectedProductObjects = () => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && p._id && selectedProducts.includes(p._id));
  };

  // Добавление нового параметра вариации
  const addVariationOption = () => {
    setVariationOptions(prev => [...prev, {
      id: Date.now(),
      name: '',
      values: ['']
    }]);
  };

  // Удаление параметра вариации
  const removeVariationOption = (optionId) => {
    setVariationOptions(prev => prev.filter(option => option.id !== optionId));
  };

  // Обновление названия параметра
  const updateVariationOptionName = (optionId, name) => {
    setVariationOptions(prev => prev.map(option => 
      option.id === optionId ? { ...option, name } : option
    ));
  };

  // Добавление значения к параметру
  const addVariationOptionValue = (optionId) => {
    setVariationOptions(prev => prev.map(option => 
      option.id === optionId ? { ...option, values: [...option.values, ''] } : option
    ));
  };

  // Удаление значения параметра
  const removeVariationOptionValue = (optionId, valueIndex) => {
    setVariationOptions(prev => prev.map(option => 
      option.id === optionId ? { 
        ...option, 
        values: option.values.filter((_, index) => index !== valueIndex) 
      } : option
    ));
  };

  // Обновление значения параметра
  const updateVariationOptionValue = (optionId, valueIndex, value) => {
    setVariationOptions(prev => prev.map(option => 
      option.id === optionId ? { 
        ...option, 
        values: option.values.map((v, index) => index === valueIndex ? value : v) 
      } : option
    ));
  };

  // Преобразование variationOptions в формат для API
  const getVariationOptionsForAPI = () => {
    const result = {};
    variationOptions.forEach(option => {
      if (option.name && option.values.length > 0 && option.values.some(v => v.trim())) {
        result[option.name] = option.values.filter(v => v.trim());
      }
    });
    return result;
  };

  return (
    <div className="product-merge">
      <div className="product-merge-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <div>
            <h1>Объединение товаров</h1>
            <p>Выберите товары, которые отличаются только параметрами (например, мощностью), и объедините их в один товар с вариациями.</p>
          </div>
          <div style={{display: 'flex', gap: 10}}>
            <button 
              onClick={() => window.location.href = '/admin/products'} 
              style={{
                background: '#1976d2', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 15, 
                border: 'none', 
                borderRadius: 7, 
                padding: '8px 18px', 
                cursor: 'pointer'
              }}
            >
              📦 Товары
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'} 
              style={{
                background: '#1e88e5', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 15, 
                border: 'none', 
                borderRadius: 7, 
                padding: '8px 18px', 
                cursor: 'pointer'
              }}
            >
              ⚙️ Настройки
            </button>
            <button 
              onClick={() => window.location.href = '/admin/pickup-points'} 
              style={{
                background: '#28a745', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 15, 
                border: 'none', 
                borderRadius: 7, 
                padding: '8px 18px', 
                cursor: 'pointer'
              }}
            >
              🏬 Пункты самовывоза
            </button>
            <button 
              onClick={onLogout} 
              style={{
                background: '#e53935', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 15, 
                border: 'none', 
                borderRadius: 7, 
                padding: '8px 18px', 
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')}>&times;</button>
        </div>
      )}

      <div className="product-merge-content">
        <div className="product-merge-section">
          <div className="section-header">
            <h2>Выбор товаров для объединения</h2>
            <div className="section-actions">
              <button 
                onClick={handleSelectAll}
                className="btn-secondary"
              >
                                 {Array.isArray(products) && selectedProducts.length === products.length ? 'Снять выделение' : 'Выбрать все'}
              </button>
              <button 
                onClick={handleMergeClick}
                disabled={selectedProducts.length < 2 || loading}
                className="btn-primary"
              >
                Объединить выбранные ({selectedProducts.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Загрузка товаров...</div>
          ) : (
            <div className="products-grid">
              {Array.isArray(products) && products.map(product => (
                <div 
                  key={product._id || Math.random()} 
                  className={`product-card ${selectedProducts.includes(product._id) ? 'selected' : ''}`}
                  onClick={() => product._id && handleProductSelect(product._id)}
                >
                                     <div className="product-image">
                     <img src={product.image || '/images/products/placeholder.png'} alt={product.name || 'Товар'} />
                   </div>
                                     <div className="product-info">
                     <h3>{product.name || 'Без названия'}</h3>
                     <p className="product-price">{product.price || '0'} ₸</p>
                     <p className="product-article">Артикул: {product.article || 'Нет'}</p>
                    {product.characteristics && (
                      <div className="product-characteristics">
                        <small>Характеристики:</small>
                        <div className="characteristics-preview">
                          {typeof product.characteristics === 'string' 
                            ? product.characteristics.substring(0, 100) + '...'
                            : JSON.stringify(product.characteristics).substring(0, 100) + '...'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                                     <div className="product-checkbox">
                     <input 
                       type="checkbox" 
                       checked={product._id ? selectedProducts.includes(product._id) : false}
                       onChange={() => product._id && handleProductSelect(product._id)}
                       onClick={(e) => e.stopPropagation()}
                     />
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showMergeForm && (
          <div className="merge-form-overlay">
            <div className="merge-form">
              <div className="form-header">
                <h2>Настройки объединения</h2>
                <button onClick={() => setShowMergeForm(false)}>&times;</button>
              </div>
              
              <form onSubmit={handleMergeSubmit}>
                <div className="form-group">
                  <label>Название мастер-товара:</label>
                  <input
                    type="text"
                    value={mergeFormData.name}
                    onChange={(e) => setMergeFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Например: Угловая шлифовальная машина"
                  />
                </div>

                <div className="form-group">
                  <label>Категория:</label>
                  <input
                    type="text"
                    value={mergeFormData.category}
                    onChange={(e) => setMergeFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                    placeholder="Например: Болгарка"
                  />
                </div>

                <div className="form-group">
                  <label>Способ задания вариаций:</label>
                  <div style={{marginBottom: 15}}>
                    <label style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
                      <input
                        type="radio"
                        checked={!useCustomOptions}
                        onChange={() => setUseCustomOptions(false)}
                        style={{marginRight: 8}}
                      />
                      Автоматический (по мощности)
                    </label>
                    <label style={{display: 'flex', alignItems: 'center'}}>
                      <input
                        type="radio"
                        checked={useCustomOptions}
                        onChange={() => setUseCustomOptions(true)}
                        style={{marginRight: 8}}
                      />
                      Произвольные параметры
                    </label>
                  </div>
                  
                  {!useCustomOptions ? (
                    <div>
                      <label>Тип вариации:</label>
                      <select
                        value={mergeFormData.variationType}
                        onChange={(e) => setMergeFormData(prev => ({ ...prev, variationType: e.target.value }))}
                      >
                        <option value="power">Мощность (Вт)</option>
                        <option value="voltage">Напряжение (В)</option>
                        <option value="size">Размер</option>
                        <option value="color">Цвет</option>
                        <option value="custom">Другое</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label>Произвольные параметры вариаций:</label>
                      <div style={{marginTop: 10}}>
                        {variationOptions.map((option, optionIndex) => (
                          <div key={option.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '15px',
                            marginBottom: '10px',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                              <input
                                type="text"
                                placeholder="Название параметра (например: Вольты)"
                                value={option.name}
                                onChange={(e) => updateVariationOptionName(option.id, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  marginRight: '10px'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeVariationOption(option.id)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '8px 12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Удалить
                              </button>
                            </div>
                            
                            <div>
                              <label style={{fontSize: '14px', color: '#666', marginBottom: '5px', display: 'block'}}>
                                Значения параметра:
                              </label>
                              {option.values.map((value, valueIndex) => (
                                <div key={valueIndex} style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                                  <input
                                    type="text"
                                    placeholder="Значение (например: 220)"
                                    value={value}
                                    onChange={(e) => updateVariationOptionValue(option.id, valueIndex, e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '6px',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      marginRight: '5px'
                                    }}
                                  />
                                  {option.values.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeVariationOptionValue(option.id, valueIndex)}
                                      style={{
                                        background: '#ffc107',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '6px 8px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                      }}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addVariationOptionValue(option.id)}
                                style={{
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  marginTop: '5px'
                                }}
                              >
                                + Добавить значение
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={addVariationOption}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 15px',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          + Добавить параметр
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Описание:</label>
                  <textarea
                    value={mergeFormData.description}
                    onChange={(e) => setMergeFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание товара"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Краткое описание:</label>
                  <textarea
                    value={mergeFormData.shortDescription}
                    onChange={(e) => setMergeFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Краткое описание"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Главное изображение:</label>
                  <input
                    type="text"
                    value={mergeFormData.mainImage}
                    onChange={(e) => setMergeFormData(prev => ({ ...prev, mainImage: e.target.value }))}
                    placeholder="URL изображения"
                  />
                </div>

                <div className="selected-products-preview">
                  <h4>Выбранные товары ({selectedProducts.length}):</h4>
                  <div className="selected-products-list">
                                         {getSelectedProductObjects().map(product => (
                       <div key={product._id || Math.random()} className="selected-product-item">
                         <img src={product.image || '/images/products/placeholder.png'} alt={product.name || 'Товар'} />
                         <div>
                           <strong>{product.name || 'Без названия'}</strong>
                           <span>{product.price || '0'} ₸</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowMergeForm(false)} className="btn-secondary">
                    Отмена
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Объединение...' : 'Объединить товары'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="product-merge-section">
          <h2>Существующие мастер-товары</h2>
          {!Array.isArray(masterProducts) || masterProducts.length === 0 ? (
            <p>Пока нет объединенных товаров</p>
          ) : (
            <div className="master-products-list">
              {masterProducts.map(masterProduct => (
                <div key={masterProduct._id} className="master-product-card">
                  <div className="master-product-info">
                    <h3>{masterProduct.name}</h3>
                    <p>Категория: {masterProduct.category}</p>
                    <p>Типы вариаций: {Array.isArray(masterProduct.variationTypes) ? masterProduct.variationTypes.join(', ') : 'Не указано'}</p>
                    <p>Создан: {masterProduct.createdAt ? new Date(masterProduct.createdAt).toLocaleDateString() : 'Не указано'}</p>
                  </div>
                  <div className="master-product-actions">
                    <button 
                      onClick={() => handleDeleteMasterProduct(masterProduct._id)}
                      className="btn-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductMerge; 