import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import DeliveryInfo from '../components/DeliveryInfo';
import '../styles/Product.css';
import '../styles/ProductVariations.css';

const categories = [
  { id: 'grinders', name: 'Болгарки' },
  { id: 'screwdrivers', name: 'Шуруповёрты' },
  { id: 'hammers', name: 'Перфораторы' },
  { id: 'drills', name: 'Дрели' },
  { id: 'jigsaws', name: 'Лобзики' },
  { id: 'levels', name: 'Лазерные уровни' },
  { id: 'generators', name: 'Генераторы' },
  { id: 'measuring', name: 'Измерители' }
];

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [miniProducts, setMiniProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    city: 'Алматы',
    deliveryInfo: {
      freeDelivery: 'Бесплатная доставка по городу',
      freeDeliveryNote: 'Сегодня — БЕСПЛАТНО',
      pickupAddress: 'ул. Толе би 216Б',
      pickupInfo: 'Сегодня с 9:00 до 18:00 — больше 5',
      deliveryNote: 'Срок доставки рассчитывается менеджером после оформления заказа'
    }
  });
  
  const [selectedCity, setSelectedCity] = useState(() => {
    const savedCity = localStorage.getItem('selectedCity');
    return savedCity || 'Алматы';
  });
  
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCityChanging, setIsCityChanging] = useState(false);
  
  // Состояние для вариаций товара
  const [productGroup, setProductGroup] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState({});
  

  
  const [detectingCity, setDetectingCity] = useState(false);
  
  // Функция для автоматического определения города
  const detectUserCity = () => {
    if (navigator.geolocation) {
      setDetectingCity(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Используем обратное геокодирование для определения города
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              if (data.address && data.address.city) {
                const detectedCity = data.address.city;
                // Проверяем, есть ли этот город в нашем списке
                if (cities.includes(detectedCity)) {
                  setSelectedCity(detectedCity);
                  localStorage.setItem('selectedCity', detectedCity);
                }
              }
              setDetectingCity(false);
            })
            .catch(error => {
              console.log('Ошибка определения города:', error);
              setDetectingCity(false);
            });
        },
        (error) => {
          console.log('Ошибка получения геолокации:', error);
          setDetectingCity(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 минут
        }
      );
    }
  };
  
  // Список городов Казахстана
  const cities = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Актобе',
    'Караганда',
    'Тараз',
    'Павлодар',
    'Семей',
    'Усть-Каменогорск',
    'Уральск',
    'Кызылорда',
    'Костанай',
    'Петропавловск',
    'Атырау',
    'Актау',
    'Темиртау',
    'Туркестан',
    'Кокшетау',
    'Талдыкорган',
    'Экибастуз',
    'Рудный',
    'Жанаозен',
    'Жезказган',
    'Балхаш',
    'Кентау',
    'Сатпаев',
    'Капчагай',
    'Риддер',
    'Степногорск',
    'Аральск',
    'Аркалык',
    'Житикара',
    'Кандыагаш',
    'Лисаковск',
    'Шахтинск',
    'Абай',
    'Аягоз',
    'Зайсан',
    'Курчатов',
    'Приозерск',
    'Серебрянск',
    'Текели',
    'Уштобе',
    'Чарск',
    'Шемонаиха',
    'Щучинск'
  ];
  
  // Объединяем все изображения из разных полей
  const getAllImages = () => {
    const currentProduct = getCurrentProduct();
    const images = [];
    
    // Добавляем основное изображение из поля image (если есть)
    if (currentProduct?.image) {
      images.push(currentProduct.image);
    }
    
    // Добавляем изображения из поля images
    if (Array.isArray(currentProduct?.images)) {
      images.push(...currentProduct.images);
    }
    
    // Добавляем изображения из поля images2
    if (Array.isArray(currentProduct?.images2)) {
      images.push(...currentProduct.images2);
    }
    
    // Добавляем изображения из поля images3
    if (Array.isArray(currentProduct?.images3)) {
      images.push(...currentProduct.images3);
    }
    
    // Если нет изображений, добавляем placeholder
    if (images.length === 0) {
      images.push('/images/products/placeholder.png');
    }
    
    return images;
  };
  
  const navigate = useNavigate();

  const API_URL = 'https://electro-a8bl.onrender.com/api/products';

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchProductAndGroup = async () => {
      try {
        // Загружаем товар
        const productRes = await fetch(`${API_URL}/${id}`);
        const productData = await productRes.json();
        
        if (productData.error) {
          setError(productData.error);
          setProduct(null);
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        
        // Загружаем группу вариаций для этого товара
        try {
          const groupRes = await fetch(`https://electro-a8bl.onrender.com/api/product-groups/by-product/${id}`);
          if (groupRes.ok) {
            const groupData = await groupRes.json();
            setProductGroup(groupData);
            
            // Если это базовый товар группы, устанавливаем его как выбранную вариацию
            if (groupData.baseProductId?._id === id) {
              setSelectedVariant({
                productId: groupData.baseProductId,
                parameters: {},
                price: productData.price
              });
            }
          }
        } catch (groupError) {
          console.log('Группа вариаций не найдена для товара:', groupError);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Ошибка загрузки товара');
        setLoading(false);
      }
    };
    
    fetchProductAndGroup();
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}?limit=4`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMiniProducts(data);
      });
  }, []);

  // Загружаем информацию сайта
  useEffect(() => {
    fetch('https://electro-a8bl.onrender.com/api/information')
      .then(res => res.json())
      .then(data => {
        if (data.information) {
          setSiteSettings(data.information);
        }
      })
      .catch(error => {
        console.log('Ошибка загрузки информации, используются значения по умолчанию:', error);
      });
  }, []);
  
  // Инициализируем выбранный город из localStorage и автоматически определяем город
  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    
    // Если есть сохраненный город, используем его
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      // Если нет сохраненного города, пытаемся определить автоматически
      detectUserCity();
    }
  }, []);

  // Сбрасываем активное изображение при смене товара
  useEffect(() => {
    setActiveImage(0);
  }, [selectedVariant]);

  if (loading) {
    return <div style={{padding: 48, textAlign: 'center'}}>Загрузка...</div>;
  }
  if (error || !product) {
    return (
      <div className="product">
        <Header />
        <main className="product-main">
          <div className="container" style={{padding: '48px 0', textAlign: 'center'}}>
            <h1>Товар не найден</h1>
            <p>Проверьте правильность ссылки или вернитесь в <a href="/catalog">каталог</a>.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Найти категорию для хлебных крошек
  const categoryObj = categories.find(cat => cat.id === product.category);
  const categoryName = categoryObj ? categoryObj.name : '';

  // Преимущества — если есть в product, иначе дефолтные
  const productAdvantages = product.advantages || [
    'Высокий крутящий момент и мощность',
    'Долговечный литий-ионный аккумулятор',
    'Компактный и лёгкий корпус для работы одной рукой'
  ];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = (formData) => {
    console.log('Заявка на товар:', { ...formData, product: getCurrentProduct().name });
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  const handleBuy = () => {
    const currentProduct = getCurrentProduct();
    const currentPrice = getCurrentPrice();
    
    navigate('/checkout', { 
      state: { 
        product: currentProduct,
        selectedVariant,
        selectedParameters,
        originalPrice: product.price,
        currentPrice
      } 
    });
  };

  // Функции для работы с вариациями
  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...selectedParameters, [paramName]: value };
    setSelectedParameters(newParameters);
    
    // Находим подходящую вариацию
    if (productGroup) {
      // Удаляем параметр из поиска, если значение пустое или false
      const filteredParameters = {};
      Object.entries(newParameters).forEach(([key, val]) => {
        if (val && val !== 'false') {
          filteredParameters[key] = val;
        }
      });
      
      // Если нет выбранных параметров, сбрасываем на базовый товар
      if (Object.keys(filteredParameters).length === 0) {
        setSelectedVariant(null);
        return;
      }
      
      // Ищем вариацию с точным совпадением всех параметров
      let matchingVariant = productGroup.variants.find(variant => {
        if (!variant.isActive) return false;
        
        // Проверяем, что все выбранные параметры совпадают
        return Object.entries(filteredParameters).every(([key, val]) => {
          return variant.parameters[key] === val;
        });
      });
      
      // Если точного совпадения нет, ищем вариацию с частичным совпадением
      if (!matchingVariant && Object.keys(filteredParameters).length > 0) {
        matchingVariant = productGroup.variants.find(variant => {
          if (!variant.isActive) return false;
          
          // Проверяем, что хотя бы один параметр совпадает
          return Object.entries(filteredParameters).some(([key, val]) => {
            return variant.parameters[key] === val;
          });
        });
      }
      
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      } else {
        // Если совпадения нет, сбрасываем на базовый товар
        setSelectedVariant(null);
      }
    }
  };

  // Получаем текущий товар для отображения (с учетом выбранной вариации)
  const getCurrentProduct = () => {
    if (selectedVariant && selectedVariant.productId) {
      // Убеждаемся, что у нас есть полная информация о товаре
      return selectedVariant.productId;
    }
    return product;
  };

  // Получаем текущую цену
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.productId) {
      return selectedVariant.productId.price;
    }
    return product?.price;
  };

  // Проверяем, есть ли вариации с определенным параметром
  const hasVariationsWithParameter = (paramName) => {
    if (!productGroup) return false;
    return productGroup.variants.some(variant => 
      variant.isActive && variant.parameters[paramName]
    );
  };

  // Получаем доступные значения для параметра
  const getAvailableValuesForParameter = (paramName) => {
    if (!productGroup) return [];
    const values = new Set();
    productGroup.variants.forEach(variant => {
      if (variant.isActive && variant.parameters[paramName]) {
        values.add(variant.parameters[paramName]);
      }
    });
    return Array.from(values);
  };

  // Модалка фото
  const handleImageClick = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    const images = getAllImages();
    setActiveImage((prev) => {
      const newIndex = (prev - 1 + images.length) % images.length;
      return newIndex >= 0 && newIndex < images.length ? newIndex : 0;
    });
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    const images = getAllImages();
    setActiveImage((prev) => {
      const newIndex = (prev + 1) % images.length;
      return newIndex >= 0 && newIndex < images.length ? newIndex : 0;
    });
  };
  
  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setIsCityChanging(true);
    setSelectedCity(newCity);
    localStorage.setItem('selectedCity', newCity);
    // Сбрасываем выбранную доставку при смене города
    setSelectedDelivery(null);
    // Загружаем информацию о доставке для нового города
    fetchDeliveryInfo(newCity);
    
    // Убираем анимацию через 500мс
    setTimeout(() => {
      setIsCityChanging(false);
    }, 500);
  };

  const fetchDeliveryInfo = async (cityName) => {
    try {
      const response = await fetch(`https://electro-a8bl.onrender.com/api/pickup-points/delivery/${encodeURIComponent(cityName)}`);
      if (response.ok) {
        const data = await response.json();
        setDeliveryInfo(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о доставке:', error);
    }
  };
  


  const shortDesc = getCurrentProduct()['Short description'] || 'краткое описание';

  // Функция для получения оптимального размера изображения
  const getOptimalImage = (product, preferredSize = 'medium') => {
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  return (
    <div className="product-page">
      <Header />
      <main className="product-main">
        <div className="product-container">
          <nav className="breadcrumbs" style={{paddingBottom: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
            <a href="/">Главная</a>
            <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
            <a href="/catalog">Каталог</a>
            {categoryName && (
              <>
                <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
                <a href={`/catalog?category=${product.category}`}>{categoryName}</a>
              </>
            )}
            <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
            <span style={{color:'#1a2236', fontWeight:500}}>{product.name}</span>
          </nav>
          <div className="product-flex">
            {/* Фото и миниатюры */}
            <div className="product-gallery">
              <div className="product-gallery-inner">
                <div className="product-image-main" onClick={handleImageClick} style={{cursor:'zoom-in'}}>
                  <img 
                    src={product.image || getAllImages()[activeImage]} 
                    alt={product.name} 
                    loading="lazy"
                    width="400"
                    height="400"
                    style={{width: '100%', height: 'auto', maxWidth: '400px'}}
                  />
                </div>
                {getAllImages().length > 1 && (
                  <>
                    <div className="product-thumbs">
                      {getAllImages().map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={product.name + idx} 
                          className={activeImage === idx ? "active" : ""} 
                          onClick={() => setActiveImage(idx)} 
                          loading="lazy"
                          width="80"
                          height="80"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Инфо и цена справа */}
            <div className="product-info-block">
              <>
                <h1 className="product-title" style={{fontWeight: 700, fontSize: '1.4rem', maxWidth: 320, marginBottom: 6, wordBreak: 'break-word', marginTop: 28, lineHeight: 1.2}}>{getCurrentProduct().name}</h1>
                <div className="product-short-desc" style={{fontSize: '1rem', color: '#222', marginBottom: 8, fontWeight: 500, marginTop: 0, lineHeight: 1.3}}>{shortDesc}</div>
                <div className="product-subtitle" style={{width: '100%', maxWidth: 'none'}}>{getCurrentProduct().subtitle}</div>
                <div className="product-divider"></div>
                {/* Компонент выбора вариаций */}
                {productGroup && productGroup.parameters.length > 0 && (
                  <div className="product-variations" style={{
                    marginBottom: '20px'
                  }}>
                    {productGroup.parameters.map((param, index) => {
                      // Для чекбоксов проверяем, есть ли вариации с этим параметром
                      if (param.type === 'checkbox' && !hasVariationsWithParameter(param.name)) {
                        return null; // Не показываем чекбокс, если нет вариаций с этим параметром
                      }
                      
                      // Для select и radio используем только доступные значения
                      const availableValues = param.type === 'select' || param.type === 'radio' 
                        ? getAvailableValuesForParameter(param.name)
                        : param.values;
                      
                      // Если нет доступных значений, не показываем параметр
                      if (availableValues.length === 0) {
                        return null;
                      }
                      
                      return (
                        <div key={index} style={{ marginBottom: '15px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500',
                            color: '#333'
                          }}>
                            {param.name}
                            {param.required && <span style={{ color: '#e74c3c' }}> *</span>}
                          </label>
                          
                          {param.type === 'select' && (
                            <select
                              value={selectedParameters[param.name] || ''}
                              onChange={(e) => handleParameterChange(param.name, e.target.value)}
                              required={param.required}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                background: 'transparent'
                              }}
                            >
                              <option value="">Выберите {param.name.toLowerCase()}</option>
                              {availableValues.map((value, valueIndex) => (
                                <option key={valueIndex} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {param.type === 'radio' && (
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                              {availableValues.map((value, valueIndex) => (
                                <label key={valueIndex} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}>
                                  <input
                                    type="radio"
                                    name={param.name}
                                    value={value}
                                    checked={selectedParameters[param.name] === value}
                                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                    required={param.required}
                                    style={{ marginRight: '6px' }}
                                  />
                                  {value}
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {param.type === 'checkbox' && (
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}>
                              <input
                                type="checkbox"
                                checked={selectedParameters[param.name] === 'true'}
                                onChange={(e) => handleParameterChange(param.name, e.target.checked ? 'true' : 'false')}
                                style={{ marginRight: '6px' }}
                              />
                              {param.name}
                            </label>
                          )}
                        </div>
                      );
                    })}
                    

                  </div>
                )}

                <div className="product-buy-row">
                  <div className="product-price-block">
                    <div className="product-price-label-value">
                      <div className="product-price-label">Цена</div>
                      <div className="product-price-value">
                        {Number(getCurrentPrice()).toFixed(3).replace(/\.?0+$/, '')}
                        <span className="product-currency">₸</span>
                      </div>
                    </div>

                    {getCurrentProduct().article && (
                      <div style={{
                        fontSize: '0.85rem', 
                        color: '#666', 
                        marginTop: 6, 
                        textAlign: 'left',
                        wordBreak: 'break-word',
                        width: '140px',
                        minWidth: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}>
                        <span style={{fontWeight: 500, color: '#495057'}}>Артикул</span>
                        <span style={{marginTop: 2}}>{getCurrentProduct().article}</span>
                      </div>
                    )}
                  </div>
                  <span className="product-price-divider"></span>
                  <div className="product-buy-btns">
                    <button className="product-btn-ask" onClick={handleOpenModal}>Задать вопрос</button>
                    <div className="product-btns-divider"></div>
                    <button className="product-btn-buy" onClick={handleBuy}>Купить</button>
                  </div>
                </div>
                <div className="product-divider"></div>
                <div style={{
                  marginTop: 14, 
                  background: '#f5f7fa', 
                  borderRadius: 10, 
                  padding: '10px 12px 8px 12px', 
                  fontSize: '0.98rem', 
                  color: '#222', 
                  boxShadow: 'none', 
                  maxWidth: 320,
                  transition: 'all 0.3s ease',
                  transform: isCityChanging ? 'scale(0.98)' : 'scale(1)',
                  opacity: isCityChanging ? 0.8 : 1
                }}>
                  <div style={{fontWeight: 600, color: '#1e88e5', marginBottom: 8, fontSize: '1.01rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {detectingCity ? (
                      <span style={{color: '#666', fontSize: '0.9rem'}}>📍 Определяем...</span>
                    ) : (
                      <select 
                        value={selectedCity} 
                        onChange={handleCityChange}
                        className="city-select"
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {/* Показываем выбор доставки только для городов кроме Алматы */}
                  {selectedCity !== 'Алматы' && (
                    <DeliveryInfo 
                      city={selectedCity} 
                      onDeliverySelect={setSelectedDelivery}
                      compact={true}
                      selectedDelivery={selectedDelivery}
                    />
                  )}
                  
                  <div style={{background:'#f0f1f4', borderRadius:7, padding:'7px 10px', marginTop:8, color:'#222', fontSize:'0.93rem', display:'flex', alignItems:'center', gap:6}}>
                    <span style={{fontSize:15, color:'#888'}}>ⓘ</span>
                    <span>
                      {selectedCity === 'Алматы' 
                        ? 'Срок доставки рассчитывается менеджером после оформления заказа'
                        : selectedDelivery 
                          ? `Доставка в ${selectedCity} через ${selectedDelivery.name.toLowerCase()}. ${selectedDelivery.type === 'pickup' ? 'Самовывоз из наших пунктов' : selectedDelivery.type === 'indriver' ? 'В течение дня' : selectedDelivery.type === 'yandex' ? '1-2 дня' : selectedDelivery.type === 'kazpost' ? '3-5 дней' : selectedDelivery.type === 'cdek' ? '1-2 дня' : selectedDelivery.type === 'air' ? '1-3 дня' : '1-3 дня'}.`
                          : `Доставка в ${selectedCity} осуществляется через курьерские службы. Срок доставки 1-3 дня.`
                      }
                    </span>
                  </div>
                </div>
              </>
            </div>
          </div>
          {/* Вкладки снизу */}
          <div className="product-tabs-wrap">
            <Tabs product={getCurrentProduct()} />
                </div>
            </div>
      </main>
      {/* Мини-каталог популярных товаров */}
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Популярные товары</h2>
        </div>
        <div className="mini-catalog-slider-wrapper">
          <div className="mini-catalog-slider">
            {/* Первый набор карточек */}
            {miniProducts.map(product => (
              <div
                key={`first-${product._id}`}
                className="product-card catalog-mini-product-card"
                onClick={() => window.location.href = `/product/${product._id}`}
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', minWidth: 200, maxWidth: 220, margin: '0 4px', border: '1px solid #e3e6ea', borderRadius: 0 }}
              >
                <div className="product-image" style={{height: '120px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <picture style={{width: '100%', height: '100%'}}>
                    <source 
                      srcSet={getOptimalImage(product, 'thumb')} 
                      type="image/webp"
                    />
                    <img 
                      src={getOptimalImage(product, 'thumb')} 
                      alt={product.name} 
                      style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} 
                      loading="lazy"
                      width="200"
                      height="120"
                    />
                  </picture>
                </div>
                <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'200px',borderTop:'1px solid #bdbdbd',margin:'0 auto 2px auto', alignSelf:'center'}}></div>
                <div className="product-info" style={{padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:60}}>
                  <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '32px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                  <div style={{width:'100%', textAlign:'left', margin:'0 0 1px 0'}}>
                    <span style={{color:'#888', fontSize:'0.8rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:1, justifyContent:'flex-start', width:'100%'}}>
                    <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1rem',letterSpacing:0.3}}>{product.price ? Number(product.price).toFixed(3).replace(/\.?0+$/, '') + ' ₸' : ''}</span>
                    <span style={{height:'2em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 5px',verticalAlign:'middle'}}></span>
                  </div>
                </div>
              </div>
            ))}
            {/* Дублированный набор карточек для бесконечной прокрутки */}
            {miniProducts.map(product => (
              <div
                key={`second-${product._id}`}
                className="product-card catalog-mini-product-card"
                onClick={() => window.location.href = `/product/${product._id}`}
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', minWidth: 200, maxWidth: 220, margin: '0 4px', border: '1px solid #e3e6ea', borderRadius: 0 }}
              >
                <div className="product-image" style={{height: '120px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <picture style={{width: '100%', height: '100%'}}>
                    <source 
                      srcSet={getOptimalImage(product, 'thumb')} 
                      type="image/webp"
                    />
                    <img 
                      src={getOptimalImage(product, 'thumb')} 
                      alt={product.name} 
                      style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} 
                      loading="lazy"
                      width="200"
                      height="120"
                    />
                  </picture>
                </div>
                <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'200px',borderTop:'1px solid #bdbdbd',margin:'0 auto 2px auto', alignSelf:'center'}}></div>
                <div className="product-info" style={{padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:60}}>
                  <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '32px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                  <div style={{width:'100%', textAlign:'left', margin:'0 0 1px 0'}}>
                    <span style={{color:'#888', fontSize:'0.8rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:1, justifyContent:'flex-start', width:'100%'}}>
                    <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1rem',letterSpacing:0.3}}>{product.price ? Number(product.price).toFixed(3).replace(/\.?0+$/, '') + ' ₸' : ''}</span>
                    <span style={{height:'2em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 5px',verticalAlign:'middle'}}></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} product={getCurrentProduct().name} />
    {/* Модальное окно для увеличенного фото */}
    {showImageModal && (
      <div className="image-modal-overlay" onClick={handleCloseImageModal} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="image-modal-content" style={{background:'#fff',padding:0,borderRadius:'8px',boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative',maxWidth:'90vw',maxHeight:'90vh',display:'flex',flexDirection:'column',alignItems:'center'}} onClick={e=>e.stopPropagation()}>
          <img src={getAllImages()[activeImage]} alt={getCurrentProduct().name} style={{maxWidth:'80vw',maxHeight:'80vh',objectFit:'contain',background:'#fff'}} width="800" height="600" />
          {getAllImages().length > 1 && (
            <>
              <button 
                onClick={handlePrevImage} 
                style={{
                  position: 'absolute',
                  left: -25,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  fontSize: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 10,
                  color: '#222'
                }}
              >
                ‹
              </button>
              <button 
                onClick={handleNextImage} 
                style={{
                  position: 'absolute',
                  right: -25,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  fontSize: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 10,
                  color: '#222'
                }}
              >
                ›
              </button>
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:12}}>
                <span style={{color:'#666', fontSize:'14px'}}>{activeImage + 1} из {getAllImages().length}</span>
              </div>
            </>
          )}
          <button onClick={handleCloseImageModal} style={{position:'absolute',top:8,right:12,fontSize:32,background:'none',border:'none',color:'#222',cursor:'pointer',lineHeight:1}}>&times;</button>
        </div>
      </div>
    )}
    </div>
  );
};

function Tabs({product}) {
  const [tab,setTab]=React.useState('desc');
  
  // Функция для парсинга характеристик из строки
  const parseCharacteristics = (characteristicsStr) => {
    if (!characteristicsStr) return [];
    
    try {
      // Пытаемся распарсить как JSON
      return JSON.parse(characteristicsStr);
    } catch {
      // Если не JSON, разбиваем по строкам
      return characteristicsStr.split('\n').filter(line => line.trim()).map(line => {
        const [name, value] = line.split(':').map(s => s.trim());
        return { name, value };
      });
    }
  };
  
  // Функция для парсинга комплектации из строки
  const parseEquipment = (equipmentStr) => {
    if (!equipmentStr) return [];
    
    try {
      // Пытаемся распарсить как JSON
      return JSON.parse(equipmentStr);
    } catch {
      // Если не JSON, разбиваем по строкам или запятым
      return equipmentStr.split(/[\n,]/).filter(item => item.trim()).map(item => item.trim());
    }
  };
  
  const characteristics = parseCharacteristics(product.characteristics);
  const equipment = parseEquipment(product.equipment);
  return (
    <div className="product-tabs">
      <div className="product-tabs-header">
        <button className={tab==='desc'?'active':''} onClick={()=>setTab('desc')}>Описание</button>
        <button className={tab==='specs'?'active':''} onClick={()=>setTab('specs')}>Характеристики</button>
        <button className={tab==='equip'?'active':''} onClick={()=>setTab('equip')}>Комплектация</button>
      </div>
      <div className="product-tabs-content">
        {tab==='desc' && (
          <div className="product-desc-kaspi-block">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
            ) : (
              <div style={{color: '#888', fontStyle: 'italic'}}>Описание товара отсутствует</div>
            )}
          </div>
        )}
        {tab==='specs' && (
          <div className="product-specs-kaspi-block">
            <h2 className="product-specs-title">Характеристики {product.name}</h2>
            {characteristics.length > 0 ? (
              <div className="product-specs-group">
                <div className="product-specs-flex-table">
                  {characteristics.map((spec, i) => (
                    <div className={"product-specs-flex-row" + (!spec.value ? " no-value" : "")} key={i}>
                      <span className="product-specs-flex-name">{spec.name}</span>
                      <span className="product-specs-flex-dots"></span>
                      {spec.value && <span className="product-specs-flex-value">{spec.value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{color: '#888', fontStyle: 'italic', padding: '20px 0'}}>Характеристики товара отсутствуют</div>
            )}
          </div>
        )}
        {tab==='equip' && (
          <div className="product-desc-kaspi-block">
            {equipment.length > 0 ? (
              <ul style={{margin: 0, paddingLeft: 20}}>
                {equipment.map((item, idx) => (
                  <li key={idx} style={{marginBottom: 8, lineHeight: 1.5}}>{item}</li>
                ))}
              </ul>
            ) : (
              <div style={{color: '#888', fontStyle: 'italic'}}>Информация о комплектации отсутствует</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product; 