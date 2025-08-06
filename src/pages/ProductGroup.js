import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import DeliveryInfo from '../components/DeliveryInfo';
import '../styles/Product.css';

const ProductGroup = () => {
  const { baseName } = useParams();
  const [productGroup, setProductGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedVoltage, setSelectedVoltage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const [detectingCity, setDetectingCity] = useState(false);
  
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
    'Костанай',
    'Петропавловск',
    'Кызылорда',
    'Атырау',
    'Актау',
    'Талдыкорган',
    'Экибастуз',
    'Кокшетау',
    'Темиртау',
    'Туркестан'
  ];

  // Загрузка группы товаров
  useEffect(() => {
    const fetchProductGroup = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://electro-a8bl.onrender.com/api/product-groups/${encodeURIComponent(baseName)}`);
        if (!response.ok) {
          throw new Error('Группа товаров не найдена');
        }
        const data = await response.json();
        setProductGroup(data);
        
        // Устанавливаем первый товар как выбранный по умолчанию
        if (data.products && data.products.length > 0) {
          setSelectedProduct(data.products[0]);
          setSelectedVoltage(data.products[0].voltage);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductGroup();
  }, [baseName]);

  // Загрузка настроек сайта
  useEffect(() => {
    fetch('https://electro-a8bl.onrender.com/api/information')
      .then(res => res.json())
      .then(data => {
        if (data.information) {
          setSiteSettings(data.information);
        }
      })
      .catch(err => console.error('Ошибка загрузки настроек:', err));
  }, []);

  // Обработчик изменения вольтов
  const handleVoltageChange = (voltage) => {
    setSelectedVoltage(voltage);
    const product = productGroup.products.find(p => p.voltage === voltage);
    if (product) {
      setSelectedProduct(product);
    }
  };

  // Получение оптимального изображения
  const getOptimalImage = (product, preferredSize = 'medium') => {
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  // Получение всех изображений для выбранного товара
  const getAllImages = () => {
    if (!selectedProduct) return [];
    
    const images = [];
    if (selectedProduct.image) images.push(selectedProduct.image);
    if (selectedProduct.images && Array.isArray(selectedProduct.images)) {
      images.push(...selectedProduct.images);
    }
    return images.filter(img => img && img.trim() !== '');
  };

  // Обработчики модального окна
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = (formData) => {
    console.log('Форма отправлена:', formData);
    handleCloseModal();
  };
  const handleBuy = () => {
    handleOpenModal();
  };
  const handleImageClick = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImage(prev => prev > 0 ? prev - 1 : getAllImages().length - 1);
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImage(prev => prev < getAllImages().length - 1 ? prev + 1 : 0);
  };

  // Обработчик изменения города
  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    localStorage.setItem('selectedCity', newCity);
    setIsCityChanging(true);
    
    // Загружаем информацию о доставке для нового города
    fetchDeliveryInfo(newCity);
  };

  // Загрузка информации о доставке
  const fetchDeliveryInfo = async (cityName) => {
    try {
      const response = await fetch(`https://electro-a8bl.onrender.com/api/pickup-points/delivery/${encodeURIComponent(cityName)}`);
      if (response.ok) {
        const data = await response.json();
        setDeliveryInfo(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о доставке:', error);
    } finally {
      setIsCityChanging(false);
    }
  };

  // Автоматическое определение города
  const detectUserCity = () => {
    if (navigator.geolocation) {
      setDetectingCity(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              if (data.address && data.address.city) {
                const detectedCity = data.address.city;
                if (cities.includes(detectedCity)) {
                  setSelectedCity(detectedCity);
                  localStorage.setItem('selectedCity', detectedCity);
                  fetchDeliveryInfo(detectedCity);
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
          maximumAge: 300000
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="product-page">
        <Header />
        <main className="product-main" style={{minHeight: 500}}>
          <div style={{padding: 50, textAlign: 'center'}}>Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !productGroup) {
    return (
      <div className="product-page">
        <Header />
        <main className="product-main" style={{minHeight: 500}}>
          <div style={{padding: 50, textAlign: 'center', color: 'red'}}>
            {error || 'Товар не найден'}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = getAllImages();

  return (
    <div className="product-page">
      <Header />
      <main className="product-main" style={{minHeight: 500}}>
        <div className="product-container">
          {/* Изображения слева */}
          <div className="product-images">
            <div className="main-image-container" onClick={handleImageClick}>
              <picture>
                <source srcSet={getOptimalImage(selectedProduct, 'webp')} type="image/webp" />
                <img 
                  src={getOptimalImage(selectedProduct, 'large')} 
                  alt={selectedProduct.name} 
                  className="main-image"
                />
              </picture>
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-images">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <picture>
                      <source srcSet={getOptimalImage({imageVariants: {thumb: image}}, 'thumb')} type="image/webp" />
                      <img src={image} alt={`${selectedProduct.name} ${index + 1}`} />
                    </picture>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Инфо и цена справа */}
          <div className="product-info">
            <div className="product-price-block">
              <div className="product-price-label-value">
                <div className="product-price-label">Цена</div>
                <div className="product-price-value">
                  {selectedProduct && Number(selectedProduct.price).toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </div>

            <h1 className="product-title">{productGroup.baseName}</h1>
            
            {/* Селектор вольтов */}
            {productGroup.voltages && productGroup.voltages.length > 1 && (
              <div className="voltage-selector" style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #e3e6ea',
                borderRadius: '8px',
                background: '#f8f9fa'
              }}>
                <h3 style={{margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#333'}}>
                  Выберите напряжение:
                </h3>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  {productGroup.voltages.map(voltage => {
                    const product = productGroup.products.find(p => p.voltage === voltage);
                    return (
                      <button
                        key={voltage}
                        onClick={() => handleVoltageChange(voltage)}
                        style={{
                          padding: '10px 15px',
                          border: selectedVoltage === voltage ? '2px solid #e86c0a' : '1px solid #ddd',
                          borderRadius: '6px',
                          background: selectedVoltage === voltage ? '#fff' : '#f8f9fa',
                          color: selectedVoltage === voltage ? '#e86c0a' : '#333',
                          cursor: 'pointer',
                          fontWeight: selectedVoltage === voltage ? '600' : '400',
                          transition: 'all 0.2s',
                          minWidth: '80px',
                          textAlign: 'center'
                        }}
                        onMouseOver={(e) => {
                          if (selectedVoltage !== voltage) {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#e86c0a';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedVoltage !== voltage) {
                            e.target.style.background = '#f8f9fa';
                            e.target.style.borderColor = '#ddd';
                          }
                        }}
                      >
                        <div style={{fontSize: '14px', fontWeight: '600'}}>{voltage} В</div>
                        {product && (
                          <div style={{fontSize: '12px', color: '#666', marginTop: '2px'}}>
                            {Number(product.price).toLocaleString('ru-RU')} ₸
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Кнопки покупки */}
            <div className="product-actions">
              <button 
                onClick={handleBuy}
                className="buy-button"
                style={{
                  background: '#e86c0a',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#d55a00'}
                onMouseOut={(e) => e.target.style.background = '#e86c0a'}
              >
                Купить
              </button>
            </div>

            {/* Информация о доставке */}
            <DeliveryInfo 
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              cities={cities}
              siteSettings={siteSettings}
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              deliveryInfo={deliveryInfo}
              isCityChanging={isCityChanging}
              detectingCity={detectingCity}
              detectUserCity={detectUserCity}
            />
          </div>
        </div>

        {/* Характеристики и описание */}
        {selectedProduct && (
          <div className="product-details">
            <Tabs product={selectedProduct} />
          </div>
        )}
      </main>

      {/* Модальное окно для заказа */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSubmit={handleSubmitForm}
          product={selectedProduct}
          selectedCity={selectedCity}
          deliveryInfo={deliveryInfo}
        />
      )}

      {/* Модальное окно для изображений */}
      {showImageModal && images.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleCloseImageModal}
        >
          <button
            onClick={handlePrevImage}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              padding: '10px 15px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            ‹
          </button>
          
          <img 
            src={images[activeImage]} 
            alt={selectedProduct.name}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
          
          <button
            onClick={handleNextImage}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              padding: '10px 15px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            ›
          </button>
          
          <button
            onClick={handleCloseImageModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              padding: '10px 15px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Компонент вкладок для характеристик и описания
function Tabs({product}) {
  const [activeTab, setActiveTab] = useState('characteristics');

  const parseCharacteristics = (characteristicsStr) => {
    if (!characteristicsStr) return [];
    
    try {
      const parsed = JSON.parse(characteristicsStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Если не JSON, разбиваем по строкам
      const lines = characteristicsStr.split('\n').filter(line => line.trim());
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
    
    return [];
  };

  const parseEquipment = (equipmentStr) => {
    if (!equipmentStr) return [];
    return equipmentStr.split('\n').filter(item => item.trim());
  };

  const characteristics = parseCharacteristics(product.characteristics);
  const equipment = parseEquipment(product.equipment);

  return (
    <div className="product-tabs">
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'characteristics' ? 'active' : ''}`}
          onClick={() => setActiveTab('characteristics')}
        >
          Характеристики
        </button>
        <button
          className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Описание
        </button>
        {equipment.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Комплектация
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'characteristics' && (
          <div className="characteristics">
            {characteristics.length > 0 ? (
              <table className="characteristics-table">
                <tbody>
                  {characteristics.map((char, index) => (
                    <tr key={index}>
                      <td className="parameter">{char.parameter}</td>
                      <td className="value">{char.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Характеристики не указаны</p>
            )}
          </div>
        )}

        {activeTab === 'description' && (
          <div className="description">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>Описание не указано</p>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="equipment">
            {equipment.length > 0 ? (
              <ul>
                {equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Комплектация не указана</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGroup; 