import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Product.css';

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
  
  // Объединяем все изображения из разных полей
  const getAllImages = () => {
    const images = [];
    
    // Добавляем изображения из поля images
    if (Array.isArray(product?.images)) {
      images.push(...product.images);
    }
    
    // Добавляем изображения из поля images2
    if (Array.isArray(product?.images2)) {
      images.push(...product.images2);
    }
    
    // Добавляем изображения из поля images3
    if (Array.isArray(product?.images3)) {
      images.push(...product.images3);
    }
    
    // Если нет изображений, добавляем placeholder
    if (images.length === 0) {
      images.push('/images/products/placeholder.png');
    }
    
    return images;
  };
  
  const allImages = getAllImages();
  const navigate = useNavigate();

  const API_URL = '/api/products';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки товара');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}?limit=4`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMiniProducts(data);
      });
  }, []);

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
    console.log('Заявка на товар:', { ...formData, product: product.name });
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  const handleBuy = () => {
    navigate('/checkout', { state: { product } });
  };

  // Модалка фото
  const handleImageClick = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % allImages.length);
  };

  const shortDesc = product['Short description'] || 'краткое описание';

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
                  <img src={allImages[activeImage]} alt={product.name} loading="lazy" />
                </div>
                {allImages.length > 1 && (
                  <>
                    <div className="product-thumbs">
                      {allImages.map((img, idx) => (
                        <img key={idx} src={img} alt={product.name + idx} className={activeImage === idx ? "active" : ""} onClick={() => setActiveImage(idx)} loading="lazy" />
                      ))}
                    </div>
                    <div style={{textAlign:'center', color:'#888', fontSize:'1.05rem', marginTop: 4, marginBottom: 12, border:'none'}}>
                      Чтобы увеличить, нажмите на картинку
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Инфо и цена справа */}
            <div className="product-info-block">
              <>
                <h1 className="product-title" style={{fontWeight: 700, maxWidth: 320, marginBottom: 6, wordBreak: 'break-word', marginTop: 18}}>{product.name}</h1>
                {product.article && (
                  <div style={{fontSize: '0.9rem', color: '#666', marginBottom: 8, padding: '4px 8px', background: '#f8f9fa', borderRadius: 4, display: 'inline-block', border: '1px solid #e9ecef'}}>
                    <span style={{fontWeight: 500, color: '#495057'}}>Артикул:</span> {product.article}
                  </div>
                )}
                <div className="product-short-desc" style={{fontSize: '1.18rem', color: '#222', marginBottom: 10, fontWeight: 500, marginTop: 0}}>{shortDesc}</div>
                <div className="product-subtitle">{product.subtitle}</div>
                <div className="product-divider"></div>
                <div className="product-buy-row">
                  <div className="product-price-block">
                    <div className="product-price-label-value">
                      <div className="product-price-label">Цена</div>
                      <div className="product-price-value">
                        {Number(product.price).toLocaleString('ru-RU')}
                        <span className="product-currency">₸</span>
                      </div>
                    </div>
                  </div>
                  <span className="product-price-divider"></span>
                  <div className="product-buy-btns">
                    <button className="product-btn-ask" onClick={handleOpenModal}>Задать вопрос</button>
                    <div className="product-btns-divider"></div>
                    <button className="product-btn-buy" onClick={handleBuy}>Купить</button>
                  </div>
                </div>
                <div className="product-divider"></div>
                <div style={{marginTop: 14, background: '#f5f7fa', borderRadius: 10, padding: '10px 12px 8px 12px', fontSize: '0.98rem', color: '#222', boxShadow: 'none', maxWidth: 320}}>
                  <div style={{fontWeight: 600, color: '#1e88e5', marginBottom: 8, fontSize: '1.01rem'}}>
                    Ваш город: <a href="#" style={{color:'#1e88e5', textDecoration:'underline', cursor:'pointer'}}>Алматы</a>
                  </div>
                  <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:6}}>
                    <span style={{fontSize:17, marginTop:2}}>🚚</span>
                    <div>
                      <div style={{fontWeight:500, color:'#222'}}>Бесплатная доставка по городу</div>
                      <div style={{color:'#1e88e5', fontWeight:600, fontSize:13}}>Сегодня — БЕСПЛАТНО</div>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:6}}>
                    <span style={{fontSize:17, marginTop:2}}>🏬</span>
                    <div>
                      <div style={{fontWeight:500, color:'#222'}}>Самовывоз из магазина <a href="#" style={{color:'#1e88e5'}}>ул. Толе би 216Б</a></div>
                      <div style={{color:'#222', fontSize:13}}>Сегодня с 9:00 до 18:00 — больше 5</div>
                    </div>
                  </div>
                  <div style={{background:'#f0f1f4', borderRadius:7, padding:'7px 10px', marginTop:8, color:'#222', fontSize:'0.93rem', display:'flex', alignItems:'center', gap:6}}>
                    <span style={{fontSize:15, color:'#888'}}>ⓘ</span>
                    <span>Срок доставки рассчитывается менеджером после оформления заказа</span>
                  </div>
                </div>
              </>
            </div>
          </div>
          {/* Вкладки снизу */}
          <div className="product-tabs-wrap">
            <Tabs product={product} />
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
            {miniProducts.map(product => (
              <div
                key={product._id}
                className="product-card catalog-mini-product-card"
                onClick={() => window.location.href = `/product/${product._id}`}
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', minWidth: 200, maxWidth: 220, margin: '0 4px', border: '1px solid #e3e6ea', borderRadius: 0 }}
              >
                <div className="product-image" style={{height: '120px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                </div>
                <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'200px',borderTop:'1px solid #bdbdbd',margin:'0 auto 2px auto', alignSelf:'center'}}></div>
                <div className="product-info" style={{padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:60}}>
                  <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '32px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                  <div style={{width:'100%', textAlign:'left', margin:'0 0 1px 0'}}>
                    <span style={{color:'#888', fontSize:'0.8rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:1, justifyContent:'flex-start', width:'100%'}}>
                    <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1rem',letterSpacing:0.3}}>{product.price ? product.price + ' ₸' : ''}</span>
                    <span style={{height:'2em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 5px',verticalAlign:'middle'}}></span>
            </div>
                </div>
            </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} />
    {/* Модальное окно для увеличенного фото */}
    {showImageModal && (
      <div className="image-modal-overlay" onClick={handleCloseImageModal} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="image-modal-content" style={{background:'#fff',padding:0,borderRadius:'8px',boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative',maxWidth:'90vw',maxHeight:'90vh',display:'flex',flexDirection:'column',alignItems:'center'}} onClick={e=>e.stopPropagation()}>
          <img src={allImages[activeImage]} alt={product.name} style={{maxWidth:'80vw',maxHeight:'80vh',objectFit:'contain',background:'#fff'}} />
          {allImages.length > 1 && (
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
                <span style={{color:'#666', fontSize:'14px'}}>{activeImage + 1} из {allImages.length}</span>
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