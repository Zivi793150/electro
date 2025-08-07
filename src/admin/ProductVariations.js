import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://electro-a8bl.onrender.com/api';
const PRODUCTS_URL = `${API_URL}/products`;
const GROUPS_URL = `${API_URL}/product-groups`;

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
      const [productsRes, groupsRes] = await Promise.all([
        fetch(PRODUCTS_URL),
        fetch(GROUPS_URL)
      ]);

      if (!productsRes.ok || !groupsRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [productsData, groupsData] = await Promise.all([
        productsRes.json(),
        groupsRes.json()
      ]);

      setProducts(productsData);
      setGroups(groupsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      baseProductId: '',
      parameters: [],
      variants: []
    });
    setShowForm(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      baseProductId: group.baseProductId?._id || '',
      parameters: group.parameters || [],
      variants: group.variants || []
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
        required: false
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
        parameters: new Map(),
        price: '',
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
          parameters: new Map(variant.parameters).set(paramName, value) 
        } : variant
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Преобразуем Map в обычный объект для отправки
      const submitData = {
        ...formData,
        variants: formData.variants.map(variant => ({
          ...variant,
          parameters: Object.fromEntries(variant.parameters)
        }))
      };

      const response = await fetch(
        editingGroup ? `${GROUPS_URL}/${editingGroup._id}` : GROUPS_URL,
        {
          method: editingGroup ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка сохранения группы вариаций');
      }

      await fetchData();
      setShowForm(false);
      setEditingGroup(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showForm) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="product-variations">
      <div className="header">
        <h1>Управление вариациями товаров</h1>
        <button onClick={handleCreateGroup} className="btn-primary">
          Создать группу вариаций
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingGroup ? 'Редактировать группу' : 'Создать группу вариаций'}</h2>
              <button onClick={() => setShowForm(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название группы:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Базовый товар:</label>
                <select
                  value={formData.baseProductId}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseProductId: e.target.value }))}
                  required
                >
                  <option value="">Выберите товар</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <h3>Параметры вариаций</h3>
                {formData.parameters.map((param, index) => (
                  <div key={index} className="parameter-item">
                    <div className="parameter-header">
                      <input
                        type="text"
                        placeholder="Название параметра (например: Вольты)"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        required
                      />
                      <select
                        value={param.type}
                        onChange={(e) => updateParameter(index, 'type', e.target.value)}
                      >
                        <option value="select">Выпадающий список</option>
                        <option value="radio">Радио кнопки</option>
                        <option value="checkbox">Чекбокс</option>
                      </select>
                      <label>
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                        />
                        Обязательный
                      </label>
                      <button
                        type="button"
                        onClick={() => removeParameter(index)}
                        className="btn-danger"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="parameter-values">
                      <label>Возможные значения:</label>
                      {param.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="value-item">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateParameterValue(index, valueIndex, e.target.value)}
                            placeholder="Значение"
                          />
                          <button
                            type="button"
                            onClick={() => removeParameterValue(index, valueIndex)}
                            className="btn-danger"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addParameterValue(index)}
                        className="btn-secondary"
                      >
                        Добавить значение
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addParameter} className="btn-secondary">
                  Добавить параметр
                </button>
              </div>

              <div className="form-section">
                <h3>Вариации товаров</h3>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="variant-item">
                    <div className="variant-header">
                      <select
                        value={variant.productId}
                        onChange={(e) => updateVariant(index, 'productId', e.target.value)}
                        required
                      >
                        <option value="">Выберите товар</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Цена"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        required
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                        />
                        Активен
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="btn-danger"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="variant-parameters">
                      {formData.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="variant-param">
                          <label>{param.name}:</label>
                          {param.type === 'select' && (
                            <select
                              value={variant.parameters.get(param.name) || ''}
                              onChange={(e) => updateVariantParameter(index, param.name, e.target.value)}
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
                                <label key={valueIndex}>
                                  <input
                                    type="radio"
                                    name={`${index}-${param.name}`}
                                    value={value}
                                    checked={variant.parameters.get(param.name) === value}
                                    onChange={(e) => updateVariantParameter(index, param.name, e.target.value)}
                                    required={param.required}
                                  />
                                  {value}
                                </label>
                              ))}
                            </div>
                          )}
                          {param.type === 'checkbox' && (
                            <input
                              type="checkbox"
                              checked={variant.parameters.get(param.name) === 'true'}
                              onChange={(e) => updateVariantParameter(index, param.name, e.target.checked ? 'true' : 'false')}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="btn-secondary">
                  Добавить вариацию
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Сохранение...' : (editingGroup ? 'Обновить' : 'Создать')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="groups-list">
        <h2>Существующие группы вариаций</h2>
        {groups.length === 0 ? (
          <p>Группы вариаций не найдены</p>
        ) : (
          groups.map(group => (
            <div key={group._id} className="group-item">
              <div className="group-header">
                <h3>{group.name}</h3>
                <div className="group-actions">
                  <button onClick={() => handleEditGroup(group)} className="btn-secondary">
                    Редактировать
                  </button>
                  <button onClick={() => handleDeleteGroup(group._id)} className="btn-danger">
                    Удалить
                  </button>
                </div>
              </div>
              
              {group.description && <p>{group.description}</p>}
              
              <div className="group-details">
                <div className="base-product">
                  <strong>Базовый товар:</strong> {group.baseProductId?.name || 'Не указан'}
                </div>
                
                <div className="parameters">
                  <strong>Параметры:</strong>
                  <ul>
                    {group.parameters.map((param, index) => (
                      <li key={index}>
                        {param.name} ({param.type}) - {param.values.join(', ')}
                        {param.required && ' *'}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="variants">
                  <strong>Вариации ({group.variants.length}):</strong>
                  <ul>
                    {group.variants.map((variant, index) => (
                      <li key={index}>
                        {variant.productId?.name || 'Неизвестный товар'} - {variant.price}
                        {!variant.isActive && ' (неактивен)'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .product-variations {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 10px;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          width: 90%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .parameter-item,
        .variant-item {
          margin: 15px 0;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
        }

        .parameter-header,
        .variant-header {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .parameter-values,
        .variant-parameters {
          margin-top: 10px;
        }

        .value-item {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 5px 0;
        }

        .radio-group {
          display: flex;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .group-item {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .group-actions {
          display: flex;
          gap: 10px;
        }

        .group-details {
          margin-top: 15px;
        }

        .group-details > div {
          margin: 10px 0;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .loading {
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

export default ProductVariations;
