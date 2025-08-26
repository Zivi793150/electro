import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://electro-1-vjdu.onrender.com/api';
const PRODUCTS_URL = `${API_URL}/admin/products`; // Используем админский endpoint для получения всех товаров
const GROUPS_URL = `${API_URL}/product-groups`;

// Поисковый селект для выбора товара(ов)
function SearchableProductSelect({ products, value, onChange, multiple = false, placeholder = 'Выберите товар' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const getLabel = (p) => `${p.name}${p.article ? ` (арт.: ${p.article})` : ''}${p.price ? ` — ${p.price} ₸` : ''}`;
  const filtered = Array.isArray(products)
    ? products.filter(p => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const name = (p.name || '').toLowerCase();
        const article = (p.article || '').toLowerCase();
        return name.includes(q) || article.includes(q);
      })
    : [];

  const isSelected = (id) => {
    if (multiple) return Array.isArray(value) && value.map(String).includes(String(id));
    return String(value || '') === String(id);
  };

  const toggleId = (id) => {
    if (multiple) {
      const current = Array.isArray(value) ? value.map(String) : [];
      const idStr = String(id);
      const next = current.includes(idStr) ? current.filter(v => v !== idStr) : [...current, idStr];
      onChange(next);
    } else {
      onChange(String(id));
      setOpen(false);
    }
  };

  const removeChip = (id) => {
    if (!multiple) return;
    const current = Array.isArray(value) ? value.map(String) : [];
    onChange(current.filter(v => v !== String(id)));
  };

  const selectedProducts = multiple
    ? (Array.isArray(value) ? value : []).map(id => products.find(p => String(p._id) === String(id))).filter(Boolean)
    : (products.find(p => String(p._id) === String(value)) || null);

  return (
    <div className="sp-select" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <div className="sp-control" onClick={() => setOpen(!open)}>
        {multiple ? (
          <div className="sp-chips">
            {selectedProducts.length > 0 ? selectedProducts.map(p => (
              <span key={p._id} className="sp-chip" onClick={(e) => { e.stopPropagation(); removeChip(p._id); }}>
                {getLabel(p)} <span className="sp-x">×</span>
              </span>
            )) : <span className="sp-placeholder">{placeholder}</span>}
          </div>
        ) : (
          <span className={selectedProducts ? 'sp-value' : 'sp-placeholder'}>
            {selectedProducts ? getLabel(selectedProducts) : placeholder}
          </span>
        )}
        <span className="sp-caret">▾</span>
      </div>
      {open && (
        <div className="sp-dropdown">
          <input
            className="sp-search"
            placeholder="Поиск по названию или артикулу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="sp-list">
            {filtered.length === 0 && (
              <div className="sp-empty">Ничего не найдено</div>
            )}
            {filtered.map(p => (
              <button
                key={p._id}
                type="button"
                className={`sp-item${isSelected(p._id) ? ' selected' : ''}`}
                onClick={() => toggleId(p._id)}
              >
                {multiple && (
                  <input type="checkbox" readOnly checked={isSelected(p._id)} />
                )}
                <span className="sp-item-label">{getLabel(p)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductVariations() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseProductId: '',
    coverImage: '',
    parameters: [],
    variants: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Очищаем предыдущие ошибки
      
      const [productsRes, groupsRes] = await Promise.all([
        fetch(PRODUCTS_URL),
        fetch(GROUPS_URL)
      ]);

      if (!productsRes.ok) {
        const errorText = await productsRes.text();
        throw new Error(`Ошибка загрузки товаров: ${productsRes.status} - ${errorText}`);
      }

      if (!groupsRes.ok) {
        const errorText = await groupsRes.text();
        throw new Error(`Ошибка загрузки групп: ${groupsRes.status} - ${errorText}`);
      }

      const [productsData, groupsData] = await Promise.all([
        productsRes.json(),
        groupsRes.json()
      ]);

       console.log('Загруженные товары:', productsData);
       console.log('Загруженные группы:', groupsData);

      setProducts(productsData);
      setGroups(groupsData);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    const newFormData = {
      name: '',
      description: '',
      baseProductId: '',
      coverImage: '',
      parameters: [],
      variants: []
    };
    console.log('🆕 Создаем новую группу с данными:', newFormData);
    setFormData(newFormData);
    setShowForm(true);
  };

  const handleEditGroup = (group) => {
    console.log('Редактируем группу:', group);
    setEditingGroup(group);
    
    // Обрабатываем вариации, чтобы правильно извлечь ID товаров
    const processedVariants = (group.variants || []).map(variant => {
      console.log('Обрабатываем вариацию:', variant);
      
      // Определяем правильный ID товара
      let productId = '';
      if (typeof variant.productId === 'string') {
        productId = variant.productId;
      } else if (variant.productId && variant.productId._id) {
        productId = variant.productId._id;
      } else if (variant.productId && typeof variant.productId === 'object') {
        productId = variant.productId.toString();
      }
      
      console.log('Извлеченный productId:', productId);
      
      return {
        ...variant,
        productId: productId,
        parameters: variant.parameters || {}
      };
    });
    
    // Определяем правильный ID базового товара
    let baseProductId = '';
    if (typeof group.baseProductId === 'string') {
      baseProductId = group.baseProductId;
    } else if (group.baseProductId && group.baseProductId._id) {
      baseProductId = group.baseProductId._id;
    } else if (group.baseProductId && typeof group.baseProductId === 'object') {
      baseProductId = group.baseProductId.toString();
    }
    
    console.log('Извлеченный baseProductId:', baseProductId);
    console.log('Обработанные вариации:', processedVariants);
    
    console.log('📥 Загружаем данные группы для редактирования:', group);
    console.log('🖼️ CoverImage в загруженной группе:', group.coverImage);
    
    setFormData({
      name: group.name,
      description: group.description || '',
      baseProductId: baseProductId,
      coverImage: group.coverImage || '',
      parameters: group.parameters || [],
      variants: processedVariants
    });
    setShowForm(true);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту группу вариаций?')) {
      return;
    }

    try {
      const response = await fetch(`${GROUPS_URL}/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления группы');
      }

      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addParameter = () => {
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, {
        name: '',
        type: 'select',
        values: [''],
        required: false,
        visibleByDefault: true,
        visibleForProductIds: []
      }]
    }));
  };

  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const updateParameter = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const addParameterValue = (paramIndex) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === paramIndex ? { ...param, values: [...param.values, ''] } : param
      )
    }));
  };

  const removeParameterValue = (paramIndex, valueIndex) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === paramIndex ? { 
          ...param, 
          values: param.values.filter((_, vi) => vi !== valueIndex) 
        } : param
      )
    }));
  };

  const updateParameterValue = (paramIndex, valueIndex, value) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === paramIndex ? { 
          ...param, 
          values: param.values.map((v, vi) => vi === valueIndex ? value : v) 
        } : param
      )
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        productId: '',
        parameters: {},
        isActive: true
      }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const updateVariantParameter = (variantIndex, paramName, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex ? { 
          ...variant, 
          parameters: { ...variant.parameters, [paramName]: value }
        } : variant
      )
    }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('image', files[0]);
      
      const response = await fetch('https://electro-1-vjdu.onrender.com/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }
      
      const result = await response.json();
      
      if (result.webp) {
        // Используем WebP версию для лучшей производительности
        const imageUrl = result.webp.path;
        
        setFormData(prev => ({
          ...prev,
          coverImage: imageUrl
        }));
        
        // Сохраняем варианты изображений для оптимизации
        const imageVariants = {
          original: result.original.path,
          webp: result.webp.path,
          thumb: result.variants?.thumb?.url || result.webp.path,
          medium: result.variants?.medium?.url || result.webp.path,
          large: result.variants?.large?.url || result.webp.path
        };
        
        // Сохраняем варианты в localStorage для использования при сохранении продукта
        localStorage.setItem('lastUploadedCoverImageVariants', JSON.stringify(imageVariants));
        
        console.log('✅ Обложка загружена:', imageUrl);
        console.log('📊 Полный ответ сервера:', result);
        
        setTimeout(() => {
          alert(`✅ Обложка вариации успешно загружена и оптимизирована!\n\n` +
                `📁 Оригинал: ${result.original.filename}\n` +
                `🎨 WebP: ${result.webp.filename}\n` +
                `📏 Размер: ${Math.round(result.original.size / 1024)} KB\n` +
                `🚀 Экономия: ~60-70% размера\n` +
                `📱 Варианты: thumb, medium, large\n\n` +
                `WebP URL автоматически добавлен в поле.`);
        }, 100);
      } else {
        // Fallback на оригинальный файл
        const imageUrl = result.original.path;
        
        setFormData(prev => ({
          ...prev,
          coverImage: imageUrl
        }));
        
        console.log('✅ Обложка загружена (fallback):', imageUrl);
        
        setTimeout(() => {
          alert(`✅ Обложка вариации успешно загружена!\n\nURL: ${imageUrl}`);
        }, 100);
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      setError('Ошибка загрузки изображения: ' + error.message);
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(''); // Очищаем предыдущие ошибки
      
      // Параметры уже хранятся как обычный объект
      const submitData = {
        ...formData,
        variants: formData.variants.map(variant => ({
          ...variant,
          parameters: variant.parameters || {}
        }))
      };

      console.log('📤 Отправляем данные на сервер:', submitData);
      console.log('🖼️ CoverImage в данных:', submitData.coverImage);
      console.log('📊 Полная структура данных:', JSON.stringify(submitData, null, 2));

      const response = await fetch(
        editingGroup ? `${GROUPS_URL}/${editingGroup._id}` : GROUPS_URL,
        {
          method: editingGroup ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сохранения группы вариаций: ${response.status} - ${errorText}`);
      }

      await fetchData();
      setShowForm(false);
      setEditingGroup(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showForm) {
    return (
      <div className="variations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="variations-container">
      {/* Заголовок */}
      <div className="variations-header">
        <div className="header-content">
          <h1 className="header-title">
            <span className="icon">🔄</span>
            Управление вариациями товаров
          </h1>
          <p className="header-subtitle">
            Создавайте группы товаров с различными параметрами и ценами
          </p>
        </div>
        <div className="header-actions">
        <button onClick={handleCreateGroup} className="create-btn">
          <span className="btn-icon">+</span>
          Создать группу
          </button>
          <div className="admin-nav">
            <button onClick={() => navigate('/admin/products')} className="nav-btn nav-products">
              📦 Товары
            </button>
            <button onClick={() => navigate('/admin/settings')} className="nav-btn nav-settings">
              ⚙️ Настройки
            </button>
            <button onClick={() => navigate('/admin/analytics')} className="nav-btn nav-analytics">
              📊 Аналитика
            </button>
            <button onClick={() => navigate('/admin/pickup-points')} className="nav-btn nav-pickup">
              🏬 Пункты самовывоза
        </button>
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Список групп */}
      <div className="groups-section">
        <h2 className="section-title">Существующие группы вариаций</h2>
        
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Группы вариаций не найдены</h3>
            <p>Создайте первую группу вариаций для ваших товаров</p>
            <button onClick={handleCreateGroup} className="empty-btn">
              Создать группу
            </button>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group._id} className="group-card">
                <div className="card-header">
                  <h3 className="card-title">{group.name}</h3>
                  <div className="card-actions">
                    <button 
                      onClick={() => handleEditGroup(group)} 
                      className="action-btn edit-btn"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteGroup(group._id)} 
                      className="action-btn delete-btn"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {group.description && (
                  <p className="card-description">{group.description}</p>
                )}
                
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Базовый товар:</span>
                    <span className="info-value">{group.baseProductId?.name || 'Не указан'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Параметры:</span>
                    <div className="parameters-list">
                      {group.parameters.map((param, index) => (
                        <span key={index} className="parameter-tag">
                          {param.name} ({param.type})
                          {param.required && <span className="required-mark">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Вариации:</span>
                    <span className="variants-count">{group.variants.length} шт.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно формы */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingGroup ? 'Редактировать группу' : 'Создать группу вариаций'}
              </h2>
              <button onClick={() => setShowForm(false)} className="modal-close">
                <span>×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="variations-form">
               {/* Отладочная информация */}
               {process.env.NODE_ENV === 'development' && (
                 <div style={{background: '#f0f0f0', padding: '10px', marginBottom: '20px', fontSize: '12px'}}>
                   <strong>Отладка:</strong><br/>
                   baseProductId: {formData.baseProductId}<br/>
                   variants: {JSON.stringify(formData.variants.map(v => ({productId: v.productId, isActive: v.isActive})))}
                 </div>
               )}
              {/* Основная информация */}
              <div className="form-section">
                <h3 className="section-title">Основная информация</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Название группы <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Например: Болгарки Tanker TK12501"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="form-textarea"
                      placeholder="Краткое описание группы"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Базовый товар <span className="required">*</span>
                    </label>
                    <select
                      value={formData.baseProductId}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseProductId: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Выберите товар</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} {product.article ? `(арт.: ${product.article})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Обложка вариации:</label>
                    <div className="image-upload-section">
                      {formData.coverImage ? (
                        <div className="image-preview">
                          <img 
                            src={formData.coverImage} 
                            alt="Обложка вариации" 
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                            className="remove-image-btn"
                            title="Удалить изображение"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                                                     <input
                             type="file"
                             accept="image/*"
                             onChange={handleImageUpload}
                             className="image-upload-input"
                             id="group-cover-image"
                           />
                          <label htmlFor="group-cover-image" className="image-upload-label">
                            <span className="upload-icon">📷</span>
                            <span>Загрузить обложку для вариации</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Параметры */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Параметры вариаций</h3>
                  <button type="button" onClick={addParameter} className="add-btn">
                    <span>+</span> Добавить параметр
                  </button>
                </div>
                
                {formData.parameters.map((param, index) => (
                  <div key={index} className="parameter-card">
                    <div className="parameter-header">
                      <div className="parameter-inputs">
                        <input
                          type="text"
                          placeholder="Название параметра (например: Вольты)"
                          value={param.name}
                          onChange={(e) => updateParameter(index, 'name', e.target.value)}
                          className="form-input"
                          required
                        />
                        <select
                          value={param.type}
                          onChange={(e) => updateParameter(index, 'type', e.target.value)}
                          className="form-select"
                        >
                          <option value="select">Выпадающий список</option>
                          <option value="radio">Радио кнопки</option>
                          <option value="checkbox">Чекбокс</option>
                        </select>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={param.visibleByDefault ?? true}
                            onChange={(e) => updateParameter(index, 'visibleByDefault', e.target.checked)}
                          />
                          <span>Виден по умолчанию</span>
                        </label>
                      </div>
                      <div className="parameter-options">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                          />
                          <span>Обязательный</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeParameter(index)}
                          className="remove-btn"
                          title="Удалить параметр"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="parameter-values">
                      <label className="form-label">Возможные значения:</label>
                      <div className="values-list">
                        {param.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="value-item">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateParameterValue(index, valueIndex, e.target.value)}
                              className="form-input"
                              placeholder="Значение"
                            />
                            <button
                              type="button"
                              onClick={() => removeParameterValue(index, valueIndex)}
                              className="remove-btn small"
                              title="Удалить значение"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addParameterValue(index)}
                          className="add-value-btn"
                        >
                          + Добавить значение
                        </button>
                      </div>
                    </div>

                    <div className="parameter-visibility">
                      <label className="form-label">Показывать только для товаров:</label>
                      <SearchableProductSelect
                        products={products}
                        multiple
                        value={param.visibleForProductIds || []}
                        onChange={(ids) => updateParameter(index, 'visibleForProductIds', ids)}
                        placeholder="Выберите товары..."
                      />
                      <div style={{fontSize: 12, color: '#718096', marginTop: 6}}>
                        Если снять галочку «Виден по умолчанию», параметр будет скрыт везде, кроме выбранных здесь товаров.
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Вариации */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Вариации товаров</h3>
                  <button type="button" onClick={addVariant} className="add-btn">
                    <span>+</span> Добавить вариацию
                  </button>
                </div>
                
                {formData.variants.map((variant, index) => (
                  <div key={index} className="variant-card">
                    <div className="variant-header">
                      <div className="variant-inputs">
                        <SearchableProductSelect
                          products={products}
                          value={variant.productId || ''}
                          onChange={(id) => updateVariant(index, 'productId', id)}
                          placeholder="Выберите товар"
                        />
                      </div>
                      <div className="variant-options">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                          />
                          <span>Активен</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="remove-btn"
                          title="Удалить вариацию"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    

                    <div className="variant-parameters">
                      {formData.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="variant-param">
                          <label className="form-label">{param.name}:</label>
                          {param.type === 'select' && (
                            <select
                              value={variant.parameters[param.name] || ''}
                              onChange={(e) => updateVariantParameter(index, param.name, e.target.value)}
                              className="form-select"
                              required={param.required}
                            >
                              <option value="">Выберите</option>
                              {param.values.map((value, valueIndex) => (
                                <option key={valueIndex} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          )}
                          {param.type === 'radio' && (
                            <div className="radio-group">
                              {param.values.map((value, valueIndex) => (
                                <label key={valueIndex} className="radio-label">
                                  <input
                                    type="radio"
                                    name={`${index}-${param.name}`}
                                    value={value}
                                    checked={variant.parameters[param.name] === value}
                                    onChange={(e) => updateVariantParameter(index, param.name, e.target.value)}
                                    required={param.required}
                                  />
                                  <span className="radio-text">{value}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {param.type === 'checkbox' && (
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={variant.parameters[param.name] === 'true'}
                                onChange={(e) => updateVariantParameter(index, param.name, e.target.checked ? 'true' : 'false')}
                              />
                              <span>{param.name}</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопки действий */}
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Отмена
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Сохранение...
                    </>
                  ) : (
                    editingGroup ? 'Обновить группу' : 'Создать группу'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .variations-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .variations-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          flex: 1;
        }

        .header-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon {
          font-size: 32px;
        }

        .header-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .create-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .error-alert {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #c53030;
        }

        .error-icon {
          font-size: 20px;
        }

        .error-text {
          flex: 1;
          font-weight: 500;
        }

        .error-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #c53030;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .groups-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 24px 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #4a5568;
        }

        .empty-state p {
          margin: 0 0 24px 0;
          font-size: 16px;
        }

        .empty-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .group-card {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .group-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
          flex: 1;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: #ebf8ff;
        }

        .delete-btn:hover {
          background: #fed7d7;
        }

        .card-description {
          color: #718096;
          font-size: 14px;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          color: #2d3748;
          font-weight: 500;
        }

        .parameters-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .parameter-tag {
          background: #e6fffa;
          color: #234e52;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .required-mark {
          color: #e53e3e;
          margin-left: 2px;
        }

        .variants-count {
          font-size: 14px;
          color: #2d3748;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .variations-form {
          padding: 32px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-btn {
          background: #48bb78;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          background: #38a169;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }

        .required {
          color: #e53e3e;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .parameter-card,
        .variant-card {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .parameter-header,
        .variant-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 16px;
        }

        .parameter-inputs,
        .variant-inputs {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .parameter-inputs .form-input {
          flex: 2;
        }

        .parameter-inputs .form-select {
          flex: 1;
        }

        .variant-inputs .form-select {
          flex: 2;
        }

        .variant-inputs .form-input {
          flex: 1;
        }

        .parameter-options,
        .variant-options {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4a5568;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #667eea;
        }

        .remove-btn {
          background: #fed7d7;
          color: #c53030;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #feb2b2;
        }

        .remove-btn.small {
          padding: 4px 8px;
          font-size: 12px;
        }

        .parameter-values {
          margin-top: 16px;
        }

        .values-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .value-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .value-item .form-input {
          flex: 1;
        }

        .add-value-btn {
          background: #ebf8ff;
          color: #2b6cb0;
          border: 1px dashed #90cdf4;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .add-value-btn:hover {
          background: #bee3f8;
          border-color: #63b3ed;
        }

        .variant-parameters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .variant-param {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .radio-label input[type="radio"] {
          accent-color: #667eea;
        }

        .radio-text {
          font-size: 14px;
          color: #4a5568;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .cancel-btn {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #cbd5e0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: white;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Стили для загрузки изображения обложки */
        .variant-cover-image {
          margin: 16px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
        }

        .image-upload-section {
          margin-top: 8px;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .preview-image {
          width: 120px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid #e2e8f0;
        }

        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-image-btn:hover {
          background: #c53030;
        }

        .image-upload-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          border: 2px dashed #cbd5e0;
          border-radius: 6px;
          background: #f7fafc;
          transition: all 0.2s ease;
        }

        .image-upload-placeholder:hover {
          border-color: #667eea;
          background: #ebf8ff;
        }

        .image-upload-input {
          display: none;
        }

        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #4a5568;
          font-size: 14px;
          padding: 16px;
        }

        .upload-icon {
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .variations-container {
            padding: 16px;
          }

          .variations-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .parameter-inputs,
          .variant-inputs {
            flex-direction: column;
          }

          .parameter-options,
          .variant-options {
            flex-direction: column;
            align-items: flex-start;
          }

          .variant-parameters {
            grid-template-columns: 1fr;
          }

          .groups-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }

          .variations-form {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductVariations;

/* lightweight styles for SearchableProductSelect */
/* These are scoped by class names used above */
<style jsx>{`
.sp-select { position: relative; width: 100%; }
.sp-control { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #fff; cursor: pointer; }
.sp-placeholder { color: #a0aec0; }
.sp-value { color: #2d3748; font-weight: 500; }
.sp-caret { color: #718096; }
.sp-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 12px 30px rgba(0,0,0,0.12); z-index: 20; padding: 10px; }
.sp-search { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
.sp-list { max-height: 260px; overflow: auto; display: flex; flex-direction: column; gap: 4px; }
.sp-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: 1px solid transparent; background: #f9fafb; cursor: pointer; text-align: left; }
.sp-item.selected { background: #ebf8ff; border-color: #bee3f8; }
.sp-item:hover { background: #edf2f7; }
.sp-empty { padding: 10px; color: #718096; text-align: center; }
.sp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sp-chip { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; padding: 4px 8px; border-radius: 999px; font-size: 12px; cursor: pointer; }
.sp-chip .sp-x { margin-left: 6px; }
`}</style>
