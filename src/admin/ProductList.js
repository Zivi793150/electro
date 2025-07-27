import React, { useEffect, useState } from 'react';

  const API_URL = '/api/products';

function ProductForm({ onClose, onSuccess, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [images, setImages] = useState(initialData?.images ? JSON.stringify(initialData.images) : '');
  const [images2, setImages2] = useState(initialData?.images2 ? JSON.stringify(initialData.images2) : '');
  const [images3, setImages3] = useState(initialData?.images3 ? JSON.stringify(initialData.images3) : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.['Short description'] || '');
  const [characteristics, setCharacteristics] = useState(initialData?.characteristics || '');
  const [equipment, setEquipment] = useState(initialData?.equipment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Функция для парсинга JSON строки в массив
  const parseImagesArray = (imagesStr) => {
    if (!imagesStr) return [];
    try {
      return JSON.parse(imagesStr);
    } catch {
      // Если не JSON, разбиваем по запятым
      return imagesStr.split(',').map(url => url.trim()).filter(url => url);
    }
  };
  
  // Функция для загрузки одного файла (для основного изображения)
  const handleSingleFileUpload = async (event, setField) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }
      
      const result = await response.json();
      
      if (result.success && result.files.length > 0) {
        // Заменяем URL основного изображения
        const newUrl = result.files[0];
        console.log('Загруженный URL для основного изображения:', newUrl);
        setField(newUrl);
        
        alert(`✅ Файл успешно загружен!\n\nЗагруженный файл:\n${newUrl}\n\nURL автоматически добавлен в поле.`);
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

  // Функция для загрузки файлов
  const handleFileUpload = async (event, setField) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('file', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файлов');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Добавляем новые URL к существующим используя функциональное обновление
        setField(prevValue => {
          const currentUrls = parseImagesArray(prevValue);
          const newUrls = [...currentUrls, ...result.files];
          const newJsonString = JSON.stringify(newUrls);
          console.log('Текущие URL:', currentUrls);
          console.log('Новые URL:', result.files);
          console.log('Объединенные URL:', newUrls);
          console.log('JSON строка:', newJsonString);
          return newJsonString;
        });
        
        // Показываем успешное сообщение с информацией о загруженных файлах
        const fileList = result.files.join('\n');
        alert(`✅ Успешно загружено ${result.files.length} файлов!\n\nЗагруженные файлы:\n${fileList}\n\nURL автоматически добавлены в поле.`);
      } else {
        setError('Ошибка загрузки файлов');
      }
    } catch (err) {
      setError('Ошибка загрузки файлов: ' + err.message);
    } finally {
      setLoading(false);
      // Очищаем input файла
      event.target.value = '';
    }
  };

  const isEdit = Boolean(initialData && initialData._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Преобразуем цену к числу с плавающей точкой, поддерживаем запятую и точку
    let parsedPrice = String(price).replace(',', '.');
    if (parsedPrice === '' || isNaN(Number(parsedPrice))) {
      setError('Введите корректную цену (например: 19.65 или 19,65)');
      setLoading(false);
      return;
    }
    parsedPrice = Number(parsedPrice);
    try {
      let payload = { 
        name, 
        price: parsedPrice, 
        category, 
        image, 
        images: parseImagesArray(images),
        images2: parseImagesArray(images2),
        images3: parseImagesArray(images3),
        description, 
        'Short description': shortDescription, 
        characteristics, 
        equipment 
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
      <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:10,padding:28,minWidth:340,maxWidth:500,boxShadow:'0 2px 16px rgba(30,40,90,0.10)',maxHeight:'90vh',overflowY:'auto'}}>
        <h3 style={{marginTop:0,marginBottom:18,fontWeight:700,fontSize:20}}>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h3>
        
        <div style={{background:'#e3f2fd',border:'1px solid #2196f3',borderRadius:6,padding:12,marginBottom:16}}>
          <div style={{fontWeight:600,color:'#1976d2',marginBottom:6}}>📸 Работа с изображениями:</div>
          <div style={{fontSize:12,color:'#1565c0',lineHeight:1.4}}>
            • <strong>Основное изображение</strong> - главное фото товара<br/>
            • <strong>Галерея (images)</strong> - дополнительные фото<br/>
            • <strong>Images2/3</strong> - еще больше фото<br/>
            • Используйте кнопки "Добавить примеры" для быстрого заполнения<br/>
            • <strong>Загрузка файлов:</strong> выберите файлы → они автоматически загрузятся на сервер
          </div>
        </div>
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
          <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333'}}>Основное изображение:</label>
          <input value={image} onChange={e=>setImage(e.target.value)} placeholder="URL основного изображения" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15}} />
          <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
            <input type="file" accept="image/*" onChange={(e)=>handleSingleFileUpload(e, setImage)} style={{flex:1,minWidth:200}} />
            <button type="button" onClick={()=>setImage('/images/products/bolgarka-makita-125.jpg')} style={{background:'#4CAF50',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>Добавить пример</button>
            <small style={{color:'#666',fontSize:11}}>💡 Главное фото товара (текущее: {image})</small>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333'}}>Галерея изображений (images):</label>
          <textarea value={images} onChange={e=>setImages(e.target.value)} placeholder='["/images/products/photo1.jpg", "/images/products/photo2.jpg"]' style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
          <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
            <input type="file" multiple accept="image/*" onChange={(e)=>handleFileUpload(e, setImages)} style={{flex:1,minWidth:200}} />
            <button type="button" onClick={()=>setImages('["/images/products/bolgarka-makita-125.jpg", "/images/products/drel.jpg"]')} style={{background:'#4CAF50',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>Добавить примеры</button>
            <small style={{color:'#666',fontSize:11,width:'100%',marginTop:4}}>💡 JSON массив или список URL через запятую. Файлы автоматически загружаются на сервер (текущее: {images})</small>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333'}}>Дополнительные изображения (images2):</label>
          <textarea value={images2} onChange={e=>setImages2(e.target.value)} placeholder='["/images/products/photo3.jpg", "/images/products/photo4.jpg"]' style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
          <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
            <input type="file" multiple accept="image/*" onChange={(e)=>handleFileUpload(e, setImages2)} style={{flex:1,minWidth:200}} />
            <button type="button" onClick={()=>setImages2('["/images/products/perforator-bosch-gbh.jpg", "/images/products/shurupovert-dewalt-18v.jpg"]')} style={{background:'#4CAF50',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>Добавить примеры</button>
            <small style={{color:'#666',fontSize:11,width:'100%',marginTop:4}}>💡 Дополнительные фото для галереи товара</small>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333'}}>Дополнительные изображения (images3):</label>
          <textarea value={images3} onChange={e=>setImages3(e.target.value)} placeholder='["/images/products/photo5.jpg", "/images/products/photo6.jpg"]' style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
          <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
            <input type="file" multiple accept="image/*" onChange={(e)=>handleFileUpload(e, setImages3)} style={{flex:1,minWidth:200}} />
            <button type="button" onClick={()=>setImages3('["/images/products/bolgarka-makita-125.jpg"]')} style={{background:'#4CAF50',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>Добавить примеры</button>
            <small style={{color:'#666',fontSize:11,width:'100%',marginTop:4}}>💡 Еще дополнительные фото (например, детали, упаковка)</small>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <textarea value={shortDescription} onChange={e=>setShortDescription(e.target.value)} placeholder="Краткое описание (до 160 символов)" maxLength={160} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:38}} />
        </div>
        <div style={{marginBottom:12}}>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Описание" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
        </div>
        <div style={{marginBottom:12}}>
          <textarea value={characteristics} onChange={e=>setCharacteristics(e.target.value)} placeholder="Характеристики" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
        </div>
        <div style={{marginBottom:16}}>
          <textarea value={equipment} onChange={e=>setEquipment(e.target.value)} placeholder="Комплектация" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e0e0e0',fontSize:15,minHeight:54}} />
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
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Краткое описание</th>
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