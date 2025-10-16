import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

  const API_URL = 'https://electro-1-vjdu.onrender.com/api/admin/products'; // Используем админский endpoint для получения всех товаров
  const PRODUCTS_API_URL = 'https://electro-1-vjdu.onrender.com/api/products'; // Для создания/обновления/удаления товаров

function ProductForm({ onClose, onSuccess, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [priceUSD, setPriceUSD] = useState(initialData?.priceUSD !== undefined ? String(initialData.priceUSD) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [article, setArticle] = useState(initialData?.article || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [coverPhoto, setCoverPhoto] = useState(initialData?.coverPhoto || '');
  
  // Динамические поля для фото
  const [additionalPhotos, setAdditionalPhotos] = useState(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      return initialData.images.map((photo, index) => ({
        id: index,
        url: photo || ''
      }));
    }
    // Начальные поля
    return [
      { id: 0, url: '' },
      { id: 1, url: '' },
      { id: 2, url: '' }
    ];
  });
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.['Short description'] || '');
  const [characteristics, setCharacteristics] = useState(initialData?.characteristics || '');
  const [equipment, setEquipment] = useState(initialData?.equipment || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Подсказка для итоговой цены в тенге для админа
  const AdminPriceHint = ({ usd }) => {
    const [rate, setRate] = useState(null);
    const [markupPercentage, setMarkupPercentage] = useState(20);
    
    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          // Получаем курс валют
          const r = await fetch('https://electro-1-vjdu.onrender.com/api/rate/usd-kzt');
          const j = await r.json();
          if (mounted && j && j.rate) setRate(j.rate);
          
          // Получаем процент наценки
          const infoResponse = await fetch('https://electro-1-vjdu.onrender.com/api/information');
          const infoData = await infoResponse.json();
          if (mounted && infoData.information && infoData.information.markupPercentage !== undefined) {
            setMarkupPercentage(infoData.information.markupPercentage);
          }
        } catch (_) {
          const fallback = parseFloat(process.env.REACT_APP_USD_KZT_RATE || '480');
          if (mounted) setRate(fallback);
        }
      })();
      return () => { mounted = false; };
    }, []);
    
    const val = parseFloat(String(usd || '').replace(',', '.'));
    if (isNaN(val) || !rate) return null;
    const markupMultiplier = 1 + (markupPercentage / 100);
    const kzt = Math.round(val * rate * markupMultiplier);
    return (
      <div style={{marginTop:6,fontSize:13,color:'#666'}}>
        Итог для пользователя: ≈ {kzt.toLocaleString('ru-RU')} ₸ (курс {rate}, +{markupPercentage}%)
      </div>
    );
  };
  
  // Функции для управления дополнительными фото
  const addPhotoField = () => {
    const newId = Math.max(...additionalPhotos.map(p => p.id), -1) + 1;
    setAdditionalPhotos([...additionalPhotos, { id: newId, url: '' }]);
  };

  const removePhotoField = (id) => {
    setAdditionalPhotos(additionalPhotos.filter(photo => photo.id !== id));
  };

  const updatePhotoField = (id, url) => {
    setAdditionalPhotos(additionalPhotos.map(photo => 
      photo.id === id ? { ...photo, url } : photo
    ));
  };
  
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
  
  // Функция для загрузки одного файла с WebP конвертацией
  const handleFileUpload = async (event, setField) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', files[0]); // Изменили 'file' на 'image'
      
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
        setField(result.webp.path);
        
        // Сохраняем варианты изображений для оптимизации
        const imageVariants = {
          original: result.original.path,
          webp: result.webp.path,
          thumb: result.variants?.thumb?.url || result.webp.path,
          medium: result.variants?.medium?.url || result.webp.path,
          large: result.variants?.large?.url || result.webp.path
        };
        
        // Сохраняем варианты в localStorage для использования при сохранении продукта
        localStorage.setItem('lastUploadedImageVariants', JSON.stringify(imageVariants));
        
        setTimeout(() => {
          alert(`✅ Изображение успешно загружено и оптимизировано!\n\n` +
                `📁 Оригинал: ${result.original.filename}\n` +
                `🎨 WebP: ${result.webp.filename}\n` +
                `📏 Размер: ${Math.round(result.original.size / 1024)} KB\n` +
                `🚀 Экономия: ~60-70% размера\n` +
                `📱 Варианты: thumb, medium, large\n\n` +
                `WebP URL автоматически добавлен в поле.`);
        }, 100);
      } else {
        // Fallback на оригинальный файл
        setField(result.original.path);
        setTimeout(() => {
          alert(`✅ Файл успешно загружен!\n\nURL: ${result.original.path}`);
        }, 100);
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
  // Генерация slug из строки
  const transliterate = (str) => {
    const map = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    return String(str || '')
      .toLowerCase()
      .replace(/[а-яё]/g, ch => map[ch] ?? ch)
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g,'-')
      .replace(/^-+|-+$/g,'');
  };

  const generateSlugs = () => {
    const genSlug = transliterate(name);
    const genCat = transliterate(category);
    if (!slug) setSlug(genSlug);
    if (!categorySlug) setCategorySlug(genCat);
  };
  const formatCharacteristics = () => {
    return characteristicFields
      .filter(field => field.parameter.trim() && field.value.trim())
      .map(field => `${field.parameter}: ${field.value}`)
      .join('\n');
  };

  // Копирование характеристик в буфер обмена
  const copyCharacteristicsToClipboard = async () => {
    try {
      const textToCopy = formatCharacteristics();
      if (!textToCopy) {
        alert('Нет заполненных характеристик для копирования');
        return;
      }
      await navigator.clipboard.writeText(textToCopy);
      alert('Характеристики скопированы в буфер обмена');
    } catch (err) {
      try {
        // Фолбэк через временное textarea
        const temp = document.createElement('textarea');
        temp.value = formatCharacteristics();
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        alert('Характеристики скопированы в буфер обмена');
      } catch (_) {
        alert('Не удалось скопировать характеристики');
      }
    }
  };

  // Вставка характеристик из буфера обмена с парсингом
  const pasteCharacteristicsFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert('Буфер обмена пуст');
        return;
      }
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        alert('Не найдено строк для вставки');
        return;
      }
      const parsed = lines.map(line => {
        const idx = line.indexOf(':');
        if (idx === -1) return { parameter: line, value: '' };
        const parameter = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        return { parameter, value };
      });
      setCharacteristicFields(parsed);
      alert('Характеристики вставлены из буфера обмена');
    } catch (err) {
      alert('Не удалось прочитать данные из буфера обмена');
    }
  };

  const isEdit = Boolean(initialData && initialData._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Проверяем корректность цены, но сохраняем как строку
    let parsedUSD = String(priceUSD).replace(',', '.');
    if (parsedUSD === '' || isNaN(Number(parsedUSD))) {
      setError('Введите цену в USD (например: 199.99 или 199,99)');
      setLoading(false);
      return;
    }
    parsedUSD = String(parsedUSD);
    
    // Собираем все фото в массив
    const allPhotos = additionalPhotos.map(photo => photo.url).filter(url => url.trim() !== '');
    
    // Получаем варианты изображений из localStorage
    const imageVariants = localStorage.getItem('lastUploadedImageVariants');
    const parsedVariants = imageVariants ? JSON.parse(imageVariants) : null;
    
    try {
      let payload = { 
        name, 
        priceUSD: parsedUSD, 
        category, 
        image, 
        images: allPhotos,
        images2: [],
        images3: [],
        coverPhoto,
        description, 
        'Short description': shortDescription, 
        characteristics: formatCharacteristics(), 
        equipment, 
        article,
        slug: slug || transliterate(name),
        categorySlug: categorySlug || transliterate(category)
      };
      
      // Добавляем варианты изображений, если они есть
      if (parsedVariants) {
        payload.imageVariants = parsedVariants;
        // Очищаем localStorage после использования
        localStorage.removeItem('lastUploadedImageVariants');
      }
      
      const res = await fetch(isEdit ? `${PRODUCTS_API_URL}/${initialData._id}` : PRODUCTS_API_URL, {
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
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.22)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'12px'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:12,padding:28,minWidth:820,maxWidth:1200,width:'100%',boxShadow:'0 4px 20px rgba(30,40,90,0.14)',maxHeight:'92vh',overflowY:'auto',position:'relative'}}>
        <button 
          type="button" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#666',
            cursor: 'pointer',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.color = '#333';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#666';
          }}
        >
          ✕
        </button>
        <h3 style={{marginTop:0,marginBottom:20,fontWeight:700,fontSize:24,color:'#333',paddingRight:40}}>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h3>
        
        {/* Основная информация */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:10,padding:16,marginBottom:16}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>📋 Основная информация</h4>
          
          <div style={{marginBottom:10}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Название товара *</label>
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Введите название товара" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          
          <div style={{marginBottom:10}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Цена (USD) *</label>
            <input required type="text" value={priceUSD} onChange={e=>setPriceUSD(e.target.value)} placeholder="Например: 199.99" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <AdminPriceHint usd={priceUSD} />
          </div>
          
          <div style={{marginBottom:10}}>
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
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:10,padding:16,marginBottom:16}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>📸 Изображения</h4>
          
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Главное фото *</label>
            <input required value={image} onChange={e=>setImage(e.target.value)} placeholder="URL главного изображения" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setImage)} style={{flex:1}} />
              <button type="button" onClick={()=>setImage('/images/products/bolgarka-makita-125.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
          </div>
          
          {/* Динамические дополнительные фото */}
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <label style={{fontWeight:500,color:'#333',fontSize:14}}>Дополнительные фото</label>
              <button type="button" onClick={addPhotoField} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>+ Добавить фото</button>
          </div>
          
            {additionalPhotos.map((photo, index) => (
              <div key={photo.id} style={{marginBottom:12,position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <label style={{fontWeight:500,color:'#333',fontSize:14}}>Фото {index + 2}</label>
                  <button 
                    type="button" 
                    onClick={() => removePhotoField(photo.id)}
                    style={{
                      background:'#dc3545',
                      color:'#fff',
                      border:'none',
                      borderRadius:4,
                      padding:'4px 8px',
                      fontSize:12,
                      cursor:'pointer',
                      minWidth:30
                    }}
                  >
                    ✕
                  </button>
                </div>
                <input 
                  value={photo.url} 
                  onChange={e => updatePhotoField(photo.id, e.target.value)} 
                  placeholder={`URL ${index + 2}-го изображения`} 
                  style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} 
                />
            <div style={{display:'flex',gap:8,marginTop:6}}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const setField = (url) => updatePhotoField(photo.id, url);
                      handleFileUpload(e, setField);
                    }} 
                    style={{flex:1}} 
                  />
                  <button 
                    type="button" 
                    onClick={() => updatePhotoField(photo.id, `/images/products/example-${index + 2}.jpg`)} 
                    style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}
                  >
                    Пример
                  </button>
            </div>
              </div>
            ))}
          </div>
          
          <div style={{marginBottom:0}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Фото на обложку каталога</label>
            <input value={coverPhoto} onChange={e=>setCoverPhoto(e.target.value)} placeholder="URL фото для обложки в каталоге" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, setCoverPhoto)} style={{flex:1}} />
              <button type="button" onClick={()=>setCoverPhoto('/images/products/cover-example.jpg')} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Пример</button>
            </div>
            <small style={{color:'#6c757d',fontSize:12,marginTop:4,display:'block'}}>
              💡 Это фото будет показываться в каталоге для мастер-товара. Если не указано, используется главное фото.
            </small>
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
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:8}}>
              <label style={{fontWeight:500,color:'#333',fontSize:14}}>Технические характеристики</label>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={copyCharacteristicsToClipboard} title="Скопировать характеристики" style={{background:'#fff',color:'#495057',border:'1px solid #ced4da',borderRadius:4,padding:'6px 10px',fontSize:12,cursor:'pointer'}}>📋 Скопировать</button>
                <button type="button" onClick={pasteCharacteristicsFromClipboard} title="Вставить из буфера обмена" style={{background:'#fff',color:'#495057',border:'1px solid #ced4da',borderRadius:4,padding:'6px 10px',fontSize:12,cursor:'pointer'}}>📥 Вставить</button>
                <button type="button" onClick={addCharacteristic} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:4,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>+ Добавить</button>
              </div>
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

        {/* SEO ссылки */}
        <div style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:8,padding:16,marginBottom:20}}>
          <h4 style={{margin:'0 0 12px 0',fontSize:16,fontWeight:600,color:'#495057'}}>🔗 SEO ссылки</h4>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end'}}>
            <div>
              <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>ЧПУ (slug)</label>
              <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="uglovaya-shlifmashina-tanker-tk12011-125mm" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>ЧПУ категории (categorySlug)</label>
              <input value={categorySlug} onChange={e=>setCategorySlug(e.target.value)} placeholder="grinders" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
            </div>
            <div>
              <button type="button" onClick={generateSlugs} style={{background:'#1e88e5',color:'#fff',border:'none',borderRadius:6,padding:'10px 14px',fontWeight:600,cursor:'pointer'}}>Сгенерировать</button>
            </div>
          </div>
          <small style={{color:'#6c757d',fontSize:12,display:'block',marginTop:8}}>Итоговая ссылка: /catalog/{categorySlug || 'category'}/{slug || 'slug'}</small>
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

function DuplicateProductModal({ product, onClose, onSuccess }) {
  const [name, setName] = useState(product?.name || '');
  const [priceUSD, setPriceUSD] = useState(
    product?.priceUSD !== undefined
      ? String(product.priceUSD)
      : ''
  );
  const [category, setCategory] = useState(product?.category || '');
  const [article, setArticle] = useState(product?.article || '');
  const [shortDescription, setShortDescription] = useState(product?.['Short description'] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let parsedUSD = String(priceUSD).replace(',', '.');
    if (parsedUSD === '' || isNaN(Number(parsedUSD))) {
      setError('Введите цену в USD (например: 199.99 или 199,99)');
      setLoading(false);
      return;
    }
    parsedUSD = String(parsedUSD);

    try {
      const payload = { ...product };
      delete payload._id;
      delete payload.__v;
      payload.name = name; // без добавления "копия"
      delete payload.price; // цену в тенге бэкенд посчитает сам
      payload.priceUSD = parsedUSD;
      payload.category = category;
      payload.article = article;
      payload['Short description'] = shortDescription;

      const res = await fetch(PRODUCTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Ошибка при дублировании товара');

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.22)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'12px'}}>
      <form onSubmit={handleCreate} style={{background:'#fff',borderRadius:12,padding:24,minWidth:720,maxWidth:1100,width:'100%',boxShadow:'0 4px 20px rgba(30,40,90,0.14)',maxHeight:'92vh',overflowY:'auto',position:'relative'}}>
        <button type="button" onClick={onClose} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,color:'#666',cursor:'pointer'}}>✕</button>
        <h3 style={{margin:'0 0 16px 0',fontWeight:700,fontSize:20,color:'#333'}}>Дублировать товар</h3>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Название</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          <div>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Цена (USD) *</label>
            <input required value={priceUSD} onChange={e=>setPriceUSD(e.target.value)} placeholder="Напр.: 199.99" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          <div>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Категория</label>
            <input value={category} onChange={e=>setCategory(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          <div>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Артикул</label>
            <input value={article} onChange={e=>setArticle(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
          <div style={{gridColumn:'1 / span 2'}}>
            <label style={{display:'block',marginBottom:4,fontWeight:500,color:'#333',fontSize:14}}>Краткое описание</label>
            <textarea value={shortDescription} onChange={e=>setShortDescription(e.target.value)} rows={3} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ced4da',fontSize:14}} />
          </div>
        </div>

        {error && <div style={{marginTop:12,color:'#d32f2f',fontSize:14}}>{error}</div>}
        <div style={{marginTop:16,display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button type="button" onClick={onClose} style={{background:'#f1f3f5',color:'#333',border:'1px solid #dee2e6',borderRadius:6,padding:'8px 14px',cursor:'pointer'}}>Отмена</button>
          <button type="submit" disabled={loading} style={{background:'#28a745',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontWeight:600}}>{loading ? 'Создание…' : 'Создать дубль'}</button>
        </div>
      </form>
    </div>
  );
}

const ProductList = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [productGroups, setProductGroups] = useState([]); // Добавляем состояние для групп вариаций
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Состояния для сортировки и фильтрации
  const [sortBy, setSortBy] = useState('name'); // name, category, price, article
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVariation, setFilterVariation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const fetchProducts = () => {
    setLoading(true);
    Promise.all([
      fetch(API_URL),
       fetch('https://electro-1-vjdu.onrender.com/api/product-groups')
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([productsData, groupsData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setProductGroups(Array.isArray(groupsData) ? groupsData : []);
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
      const res = await fetch(`${PRODUCTS_API_URL}/${product._id}`, { method: 'DELETE' });
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
      setSelectedProducts(products.filter(product => product && product._id).map(product => product._id));
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
        fetch(`${PRODUCTS_API_URL}/${productId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (e) {
      alert('Ошибка при удалении товаров');
    }
  };

  // Функции для фильтрации и сортировки
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Фильтрация по поиску
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтрация по категории
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Фильтрация по вариациям
    if (filterVariation !== 'all') {
      if (filterVariation === 'variants') {
        filtered = filtered.filter(product => isProductVariant(product._id));
      } else if (filterVariation === 'masters') {
        filtered = filtered.filter(product => !isProductVariant(product._id));
      }
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      // Для числовых значений
      if (sortBy === 'price' || sortBy === 'priceUSD') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Для текстовых значений
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Получаем уникальные категории
  const getUniqueCategories = () => {
    const categories = products.map(p => p.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  // Функция для определения, является ли товар вариацией
  const isProductVariant = (productId) => {
    if (!productId || !Array.isArray(productGroups)) return false;
    return productGroups.some(group => 
      Array.isArray(group.variants) && group.variants.some(variant => {
        if (!variant.productId) return false;
        if (typeof variant.productId === 'string') {
          return variant.productId === productId;
        }
        if (variant.productId && variant.productId._id) {
          return variant.productId._id === productId;
        }
        return false;
      })
    );
  };

  // Функция для получения информации о группе вариаций
  const getVariantGroupInfo = (productId) => {
    if (!productId || !Array.isArray(productGroups)) return null;
    const group = productGroups.find(group => 
      Array.isArray(group.variants) && group.variants.some(variant => {
        if (!variant.productId) return false;
        if (typeof variant.productId === 'string') {
          return variant.productId === productId;
        }
        if (variant.productId && variant.productId._id) {
          return variant.productId._id === productId;
        }
        return false;
      })
    );
    return group;
  };

  const [duplicateProduct, setDuplicateProduct] = useState(null);
  const handleDuplicate = (product) => {
    setDuplicateProduct(product);
  };

  const handleDuplicateFull = (product) => {
    // Открываем полную форму добавления, предварительно заполнив данными товара
    const clone = { ...product };
    delete clone._id;
    delete clone.__v;
    setEditProduct(clone); // передадим как initialData
    setShowForm(true);     // форма откроется в режиме создания (isEdit === false)
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
          <div className="admin-nav">
            <button onClick={()=>{setShowForm(true);setEditProduct(null);}} className="nav-btn" style={{background: '#FF6B00'}}>+ Добавить товар</button>
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
            <button onClick={() => navigate('/admin/variations')} className="nav-btn nav-variations">🔄 Вариации</button>
            <button onClick={() => navigate('/admin/orders')} className="nav-btn" style={{background:'#1e88e5'}}>🧾 Заказы</button>
            <button onClick={() => navigate('/admin/settings')} className="nav-btn nav-settings">⚙️ Настройки</button>
            <button onClick={() => navigate('/admin/analytics')} className="nav-btn nav-analytics">📊 Аналитика</button>
            <button onClick={() => navigate('/admin/pickup-points')} className="nav-btn nav-pickup">🏬 Пункты самовывоза</button>
            <button onClick={onLogout} className="nav-btn nav-logout">Выйти</button>
          </div>
        </div>
        
        {/* Элементы управления сортировкой и фильтрацией */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {/* Поиск */}
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#495057'}}>
              🔍 Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Название, артикул, категория..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Фильтр по категории */}
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#495057'}}>
              📂 Категория
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Все категории</option>
              {getUniqueCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Фильтр по вариациям */}
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#495057'}}>
              🔄 Тип товара
            </label>
            <select
              value={filterVariation}
              onChange={(e) => setFilterVariation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Все товары</option>
              <option value="masters">Мастер-товары</option>
              <option value="variants">Вариации</option>
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#495057'}}>
              📊 Сортировка
            </label>
            <div style={{display: 'flex', gap: '4px'}}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: '1',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="name">По названию</option>
                <option value="category">По категории</option>
                <option value="price">По цене (₸)</option>
                <option value="priceUSD">По цене ($)</option>
                <option value="article">По артикулу</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
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
              Выбрано товаров: {selectedProducts.length} из {getFilteredAndSortedProducts().length}
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
                <th style={{padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#222'}}>Артикул</th>
                <th style={{padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#222'}}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAndSortedProducts().filter(product => product && product._id).map(product => (
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
                  <td style={{padding: '6px 6px', fontWeight: 500, color: '#1a2236'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {product.name}
                      {isProductVariant(product._id) && (
                        <span style={{
                          background: '#FF6B00',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontWeight: '600'
                        }}>
                          🔄 Вариация
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{padding: '6px 6px', color: '#FFB300', fontWeight: 700}}>{product.price ? String(product.price).replace('.', ',') + ' ₸' : ''}</td>
                  <td style={{padding: '6px 6px', color: '#222'}}>{product.category || '-'}</td>
                  <td style={{padding: '6px 6px', color: '#555', fontSize: 13}}>{product.article || '-'}</td>
                  <td style={{padding: '6px 6px', textAlign: 'center'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                      <button onClick={()=>handleEdit(product)} style={{background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer', width: '100%'}}>Редактировать</button>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                        <button onClick={()=>handleDuplicate(product)} style={{background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontWeight: 500, cursor: 'pointer', width: '100%'}}>Дублир. (коротко)</button>
                        <button onClick={()=>handleDuplicateFull(product)} style={{background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontWeight: 500, cursor: 'pointer', width: '100%'}}>Дублир. (полная)</button>
                      </div>
                      <button onClick={()=>handleDelete(product)} style={{background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer', width: '100%'}}>Удалить</button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
      {showForm && <ProductForm onClose={handleFormClose} onSuccess={fetchProducts} initialData={editProduct} />}
      {duplicateProduct && (
        <DuplicateProductModal
          product={duplicateProduct}
          onClose={() => setDuplicateProduct(null)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductList; 