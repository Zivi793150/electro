import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

  const API_URL = 'https://electro-a8bl.onrender.com/api/products';

function ProductForm({ onClose, onSuccess, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [article, setArticle] = useState(initialData?.article || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [photo1, setPhoto1] = useState(initialData?.images?.[0] || '');
  const [photo2, setPhoto2] = useState(initialData?.images?.[1] || '');
  const [photo3, setPhoto3] = useState(initialData?.images?.[2] || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.['Short description'] || '');
  const [characteristics, setCharacteristics] = useState(initialData?.characteristics || '');
  const [equipment, setEquipment] = useState(initialData?.equipment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Состояние для динамических характеристик
  const [characteristicFields, setCharacteristicFields] = useState(() => {
    if (initialData?.characteristics) {
      try {
        // Пытаемся распарсить существующие характеристики
        const parsed = JSON.parse(initialData.characteristics);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Если не JSON, разбиваем по строкам
        const lines = initialData.characteristics.split('\n').filter(line => line.trim());
        return lines.map(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            return {
              parameter: parts[0].trim(),
              value: parts.slice(1).join(':').trim()
            };
          }
          return { parameter: line.trim(), value: '' };
        });
      }
    }
    // Начальные поля
    return [
      { parameter: 'Код товара', value: '' },
      { parameter: 'Тип патрона', value: '' },
      { parameter: 'Тип инструмента', value: '' },
      { parameter: 'Количество скоростей работы', value: '' },
      { parameter: 'Диаметр патрона', value: '' },
      { parameter: 'Максимальное число оборотов холостого хода', value: '' },
      { parameter: 'Максимальный крутящий момент', value: '' },
      { parameter: 'Потребляемая мощность', value: '' },
      { parameter: 'Максимальный диаметр сверления дерева', value: '' },
      { parameter: 'Максимальный диаметр сверления металла', value: '' }
    ];
  });
  
  // Функция для загрузки одного файла
  const handleFileUpload = async (event, setField) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/upload.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }
      
      const result = await response.json();
      
      if (result.success && result.files.length > 0) {
        const newUrl = result.files[0];
        setField(newUrl);
        // Показываем уведомление без блокировки
        setError('');
        setTimeout(() => {
          alert(`✅ Файл успешно загружен!\n\nURL: ${newUrl}\n\nURL автоматически добавлен в поле.`);
        }, 100);
      } else {
        setError('Ошибка загрузки файла');
      }
    } catch (err) {
      setError('Ошибка загрузки файла: ' + err.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  // Функции для работы с характеристиками
  const addCharacteristic = () => {
    setCharacteristicFields([...characteristicFields, { parameter: '', value: '' }]);
  };

  const removeCharacteristic = (index) => {
    setCharacteristicFields(characteristicFields.filter((_, i) => i !== index));
  };

  const updateCharacteristic = (index, field, value) => {
    const newFields = [...characteristicFields];
    newFields[index][field] = value;
    setCharacteristicFields(newFields);
  };

  // Преобразование характеристик в строку для сохранения
  const formatCharacteristics = () => {
    return characteristicFields
      .filter(field => field.parameter.trim() && field.value.trim())
      .map(field => `${field.parameter}: ${field.value}`)
      .join('\n');
  };

  const isEdit = Boolean(initialData && initialData._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Проверяем корректность цены, но сохраняем как строку
    let parsedPrice = String(price).replace(',', '.');
    if (parsedPrice === '' || isNaN(Number(parsedPrice))) {
      setError('Введите корректную цену (например: 19.65 или 19,65)');
      setLoading(false);
      return;
    }
    // Сохраняем цену как строку, чтобы не терять нули
    parsedPrice = String(parsedPrice);
    
    // Собираем все фото в массив
    const allPhotos = [photo1, photo2, photo3].filter(photo => photo.trim() !== '');
    
    try {
      let payload = { 
        name, 
        price: parsedPrice, 
        category, 
        image, 
        images: allPhotos,
        images2: [],
        images3: [],
        description, 
        'Short description': shortDescription, 
        characteristics: formatCharacteristics(), 
        equipment, 
        article 
      };
      
      const res = await fetch(isEdit ? `${API_URL}/${initialData._id}` : API_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:10,padding:28,minWidth:400,maxWidth:600,boxShadow:'0 2px 16px rgba(30,40,90,0.10)',maxHeight:'90vh',overflowY:'auto'}}>
        <h3 style={{marginTop:0,marginBottom:20,fontWeight:700,fontSize:22,color:'#333'}}>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h3>
        
        {/* Основная информация */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:8,padding:16,marginBottom:20}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>📋 Основная информация</h4>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Название товара *</label>
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Введите название товара" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Цена *</label>
            <input required type="text" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Например: 19.65 или 19,65" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Категория</label>
            <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Например: Электроинструменты" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          
          <div style={{marginBottom:0}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Артикул</label>
            <input value={article} onChange={e=>setArticle(e.target.value)} placeholder="Например: 119356208" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <small style={{color:'#6c757d',fontSize:12}}>Уникальный код товара</small>
          </div>
        </div>

        {/* Изображения */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:8,padding:16,marginBottom:20}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>📸 Изображения</h4>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Главное фото *</label>
            <input required value={image} onChange={e=>setImage(e.target.value)} placeholder="URL главного изображения" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setImage)} style={{flex:1}} />
              <button type="button" onClick={()=>setImage('/images/products/bolgarka-makita-125.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
          </div>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Фото 2</label>
            <input value={photo1} onChange={e=>setPhoto1(e.target.value)} placeholder="URL второго изображения" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setPhoto1)} style={{flex:1}} />
              <button type="button" onClick={()=>setPhoto1('/images/products/drel.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
          </div>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Фото 3</label>
            <input value={photo2} onChange={e=>setPhoto2(e.target.value)} placeholder="URL третьего изображения" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setPhoto2)} style={{flex:1}} />
              <button type="button" onClick={()=>setPhoto2('/images/products/perforator-bosch-gbh.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
          </div>
          
          <div style={{marginBottom:0}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Фото 4</label>
            <input value={photo3} onChange={e=>setPhoto3(e.target.value)} placeholder="URL четвертого изображения" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setPhoto3)} style={{flex:1}} />
              <button type="button" onClick={()=>setPhoto3('/images/products/shurupovert-dewalt-18v.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
          </div>
        </div>

        {/* Описания */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:8,padding:16,marginBottom:20}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>📝 Описания</h4>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Краткое описание</label>
            <textarea value={shortDescription} onChange={e=>setShortDescription(e.target.value)} placeholder="Краткое описание товара (до 160 символов)" maxLength={160} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14,minHeight:60,resize:'vertical'}} />
            <small style={{color:'#6c757d',fontSize:12}}>Используется для карточек товаров</small>
          </div>
          
          <div style={{marginBottom:0}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Полное описание</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Подробное описание товара, его особенности и преимущества" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14,minHeight:80,resize:'vertical'}} />
          </div>
        </div>

        {/* Характеристики и комплектация */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:8,padding:16,marginBottom:20}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>⚙️ Характеристики и комплектация</h4>
          
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <label style={{fontWeight:500,color:'#333',fontSize:14}}>Технические характеристики</label>
              <button type="button" onClick={addCharacteristic} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>+ Добавить</button>
            </div>
            
            <div style={{maxHeight:300,overflowY:'auto',border:'1px solid #ced4da',borderRadius:6,padding:8,background:'#fff'}}>
              {characteristicFields.map((field, index) => (
                <div key={index} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                  <input
                    value={field.parameter}
                    onChange={(e) => updateCharacteristic(index, 'parameter', e.target.value)}
                    placeholder="Параметр (например: Код товара)"
                    style={{flex:1,padding:8,borderRadius:4,border:'1px solid #ced4da',fontSize:13}}
                  />
                  <input
                    value={field.value}
                    onChange={(e) => updateCharacteristic(index, 'value', e.target.value)}
                    placeholder="Значение (например: 119356208)"
                    style={{flex:1,padding:8,borderRadius:4,border:'1px solid #ced4da',fontSize:13}}
                  />
                  <button
                    type="button"
                    onClick={() => removeCharacteristic(index)}
                    style={{background:'#dc3545',color:'#fff',border:'none',borderRadius:4,padding:'6px 8px',fontSize:12,cursor:'pointer',minWidth:30}}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <small style={{color:'#6c757d',fontSize:12,marginTop:8,display:'block'}}>
              💡 Каждая характеристика будет отображаться как "Параметр: Значение". 
              Пустые поля автоматически исключаются.
            </small>
          </div>
          
          <div style={{marginBottom:0}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Комплектация</label>
            <textarea value={equipment} onChange={e=>setEquipment(e.target.value)} placeholder="• Основной инструмент&#10;• Защитный кожух&#10;• Ключ для замены диска&#10;• Инструкция по эксплуатации" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14,minHeight:80,resize:'vertical'}} />
            <small style={{color:'#6c757d',fontSize:12}}>Что входит в комплект поставки</small>
          </div>
        </div>

        {error && <div style={{color:'#dc3545',marginBottom:16,padding:12,background:'#f8d7da',border:'1px solid #f5c6cb',borderRadius:6}}>{error}</div>}
        
        <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
          <button type="button" onClick={onClose} style={{background:'#6c757d',color:'#fff',border:'none',borderRadius:6,padding:'10px 20px',fontWeight:500,cursor:'pointer',fontSize:14}}>Отмена</button>
          <button type="submit" disabled={loading} style={{background:'#FF6B00',color:'#fff',border:'none',borderRadius:6,padding:'10px 20px',fontWeight:600,cursor:'pointer',fontSize:14}}>{loading ? (isEdit ? 'Сохранение...' : 'Добавление...') : (isEdit ? 'Сохранить' : 'Добавить товар')}</button>
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();

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

  // Функции для работы с галочками
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(products.map(product => product._id));
      setSelectAll(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для удаления');
      return;
    }

    const confirmMessage = selectedProducts.length === 1 
      ? `Удалить выбранный товар?` 
      : `Удалить ${selectedProducts.length} выбранных товаров?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const deletePromises = selectedProducts.map(productId => 
        fetch(`${API_URL}/${productId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
      alert(`Успешно удалено ${selectedProducts.length} товаров`);
    } catch (e) {
      alert('Ошибка при удалении товаров');
    }
  };

  // Сброс выбора при изменении списка товаров
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [products]);

  return (
    <div className="admin-container" style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
      <div style={{maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
          <h2 className="admin-header" style={{fontWeight: 700, fontSize: 24, color: '#1a2236', margin: 0}}>Товары</h2>
          <div>
            <button onClick={()=>{setShowForm(true);setEditProduct(null);}} style={{background: '#FF6B00', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>+ Добавить товар</button>
            {selectedProducts.length > 0 && (
              <button 
                onClick={handleDeleteSelected} 
                style={{
                  background: '#dc3545', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: 15, 
                  border: 'none', 
                  borderRadius: 7, 
                  padding: '8px 18px', 
                  marginRight: 12, 
                  cursor: 'pointer'
                }}
              >
                🗑️ Удалить выбранные ({selectedProducts.length})
              </button>
            )}
            <button onClick={() => navigate('/admin/settings')} style={{background: '#1e88e5', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>⚙️ Настройки</button>
            <button onClick={() => navigate('/admin/pickup-points')} style={{background: '#28a745', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>🏬 Пункты самовывоза</button>
            <button onClick={onLogout} style={{background: '#e53935', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer'}}>Выйти</button>
          </div>
        </div>
        
        {/* Информация о выбранных товарах */}
        {selectedProducts.length > 0 && (
          <div style={{
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '6px', 
            padding: '12px 16px', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{color: '#1976d2', fontWeight: 500}}>
              Выбрано товаров: {selectedProducts.length} из {products.length}
            </span>
            <button 
              onClick={() => {setSelectedProducts([]); setSelectAll(false);}}
              style={{
                background: 'none',
                border: '1px solid #2196f3',
                color: '#2196f3',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Снять выделение
            </button>
          </div>
        )}
        
      {loading ? (
          <div style={{padding: 32, textAlign: 'center'}}>Загрузка...</div>
      ) : error ? (
          <div style={{color: '#e53935', padding: 32, textAlign: 'center'}}>{error}</div>
      ) : (
          <table className="admin-table" style={{width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
                <th style={{padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#222', width: '40px'}}>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{width: '16px', height: '16px', cursor: 'pointer'}}
                  />
                </th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Фото</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Название</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Цена</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Категория</th>
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Краткое описание</th>
                <th style={{padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#222'}}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
                <tr key={product._id} style={{
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: selectedProducts.includes(product._id) ? '#f8f9fa' : 'transparent'
                }}>
                  <td style={{padding: '6px 6px', textAlign: 'center'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      style={{width: '16px', height: '16px', cursor: 'pointer'}}
                    />
                  </td>
                  <td style={{padding: '6px 6px'}}>
                    <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 44, height: 44, objectFit: 'contain', borderRadius: 5, background: '#f5f7fa', border: '1px solid #e0e0e0'}} />
                  </td>
                  <td style={{padding: '6px 6px', fontWeight: 500, color: '#1a2236'}}>{product.name}</td>
                  <td style={{padding: '6px 6px', color: '#FFB300', fontWeight: 700}}>{product.price ? String(product.price).replace('.', ',') + ' ₸' : ''}</td>
                  <td style={{padding: '6px 6px', color: '#222'}}>{product.category || '-'}</td>
                  <td style={{padding: '6px 6px', color: '#888', fontSize: 13}}>{product['Short description'] || ''}</td>
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