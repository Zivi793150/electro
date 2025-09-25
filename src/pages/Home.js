import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AboutCompanySection from '../components/AboutCompanySection';
import { fetchWithCache } from '../utils/cache';
import '../styles/Home.css';

// Удалён неиспользуемый fetchWithRetry

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [miniProducts, setMiniProducts] = useState([]);
  const navigate = useNavigate();

  // Функция для получения оптимального размера изображения
  const getOptimalImage = (product, preferredSize = 'medium') => {
    // Сначала проверяем обложку вариации, если товар является базовым для группы
    if (product.productGroup && product.productGroup.coverImage) {
      return product.productGroup.coverImage;
    }
    
    // Затем проверяем обычные изображения товара
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  const API_URL = 'https://electro-1-vjdu.onrender.com/api/products';

  useEffect(() => {
    fetchWithCache(`${API_URL}?limit=8`, {}, 5 * 60 * 1000) // Кэш на 5 минут
      .then(data => {
        if (Array.isArray(data)) setMiniProducts(data);
      });
  }, []);



  const handleOpenModal = () => setIsModalOpen(true);
  // Функция для преобразования кириллического названия категории в латинский ID
  const categoryToId = (categoryName) => {
    const categoryMap = {
      'дрели': 'drills',
      'болгарки': 'grinders',
      'шуруповёрты': 'screwdrivers',
      'перфораторы': 'hammers',
      'лобзики': 'jigsaws',
      'лазерные уровни': 'levels',
      'генераторы': 'generators',
      'генераторы для дома': 'generators',
      'измерители': 'measuring',
      'дрель': 'drills',
      'болгарка': 'grinders',
      'шуруповёрт': 'screwdrivers',
      'перфоратор': 'hammers',
      'лобзик': 'jigsaws',
      'лазерный уровень': 'levels',
      'генератор': 'generators',
      'измеритель': 'measuring'
    };
    
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Сначала ищем точное совпадение
    if (categoryMap[normalizedName]) {
      return categoryMap[normalizedName];
    }
    
    // Если точного совпадения нет, ищем по частичному совпадению
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }
    
    return normalizedName.replace(/[^a-z0-9]/g, '-');
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = () => {};
  
  // Функция для перехода в каталог с фильтром по категории товара
  const handleProductClick = (product) => {
    if (product.category) {
      // Переходим на страницу конкретной категории с латинским ID
      const categoryId = categoryToId(product.category.trim());
      navigate(`/catalog/${categoryId}`);
    } else {
      // Если категории нет, переходим в общий каталог
      navigate('/catalog');
    }
  };

  const advantages = [
    'Только оригинальная продукция',
    'Гарантия 12 месяцев на весь ассортимент',
    'Консультация, сервис и постгарантийное обслуживание',
    'Быстрая доставка по всему Казахстану',
    'Работа с розничными и оптовыми клиентами'
  ];

  return (
    <div className="home">
      <Header />
      <section className="main-maket-section">
        <div className="main-maket-container">
          <div className="main-maket-left">
            <picture>
              <source 
                srcSet="/images/hero/hero-main.webp" 
                type="image/webp"
              />
              <img 
                src="/images/hero/hero-main.jpg" 
                alt="Электроинструменты для профессионалов" 
                className="main-maket-image" 
                fetchPriority="high"
                width="380"
                height="380"
                style={{width: '100%', height: 'auto', maxWidth: '380px'}}
              />
            </picture>
          </div>
          <div className="main-maket-right">
            <h1 className="main-maket-title">Электроинструменты и оборудование</h1>
            <div className="main-maket-subtitle">Официальный поставщик электроинструментов и оборудования в Казахстане</div>
            <div className="main-maket-text">Мы предлагаем полный спектр продукции, востребованной в строительстве, ремонте, производстве, а также для дома и фермерских хозяйств. Наш каталог охватывает всё: от электроинструментов и оборудования до кабельной и электротехнической продукции.</div>
            <ul className="main-maket-advantages">
              {advantages.map((adv, idx) => (
                <li key={idx} className="main-maket-adv-item">
                  <span className="main-maket-arrow">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9H15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/><path d="M11 5L15 9L11 13" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
            <button className="main-maket-btn" onClick={handleOpenModal}>Оставить заявку</button>
          </div>
        </div>
      </section>
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Каталог товаров</h2>
          <a href="/catalog" className="mini-catalog-link">Смотреть все</a>
        </div>
        <div style={{maxWidth: 1200, margin: '0 auto', width: '100%'}}>
          <div className="home-products-grid" style={{gap: 0, height: 'auto', minHeight: 'auto', maxHeight: 'none', alignItems: 'flex-start'}}>
            {miniProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', height: 'auto', minHeight: 'auto', maxHeight: 'none', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  className="product-card kaspi-style mini-product-card"
                  style={{ cursor: 'pointer', height: 'auto', minHeight: 'auto', maxHeight: 'none', position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', display: 'flex', flexDirection: 'column', flex: 'none', flexGrow: 0, flexShrink: 0 }}
                >
                  <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <picture style={{width: '100%', height: '100%'}}>
                      <source 
                        srcSet={getOptimalImage(product, 'medium')} 
                        type="image/webp"
                      />
                      <img 
                        src={getOptimalImage(product)} 
                        alt={product.name} 
                        style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} 
                        loading="lazy"
                        width="260"
                        height="170"
                      />
                    </picture>
                  </div>
                  <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                  <div className="product-info" style={{padding: '2px 8px 18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flex: 'none', height: '60px', minHeight: '60px', maxHeight: '60px', margin: 0, border: 'none', background: '#fff'}}>
                    <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: '8px 0 0 0', padding: 0, lineHeight: 1.18, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%', minHeight: 'auto', maxHeight: 'none'}}>{product.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <AboutCompanySection />
      <Footer />
      <Modal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Home; 