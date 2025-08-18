import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AboutCompanySection from '../components/AboutCompanySection';
import '../styles/Home.css';

// Надёжный fetch с повторами и таймаутом
const fetchWithRetry = async (url, options = {}, retries = 2, backoffMs = 800, timeoutMs = 12000) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Accept': 'application/json', ...(options.headers || {}) },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === retries) throw error;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
    }
  }
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [miniProducts, setMiniProducts] = useState([]);
  const navigate = useNavigate();

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

  const API_URL = 'https://electro-1-vjdu.onrender.com/api/products';

  useEffect(() => {
    fetchWithRetry(`${API_URL}?limit=8`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMiniProducts(data);
      });
  }, []);



  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = () => {
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };
  
  // Функция для перехода в каталог с фильтром по категории
  const handleProductClick = (product) => {
    if (product.category) {
      // Переходим в каталог с фильтром по категории товара
      navigate(`/catalog?category=${encodeURIComponent(product.category.trim())}`);
    } else {
      // Если категории нет, переходим в общий каталог
      navigate('/catalog');
    }
  };

  const advantages = [
    'Работаем с розничными и оптовыми клиентами (B2B)',
    'Полный пакет документов для тендеров и госзакупок',
    'Гарантийное и постгарантийное обслуживание',
    'Быстрая доставка по всему Казахстану'
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
            <h1 className="main-maket-title">Электроинструменты Tanker</h1>
            <div className="main-maket-subtitle">Продажа и доставка оригинального электроинструмента Tanker по выгодным ценам.</div>
            <div className="main-maket-text">Официальная продукция с гарантией 12 месяцев, консультации, поддержка, гибкие условия для оптовиков и компаний. Предлагаем полный спектр электроинструмента и аксессуаров, востребованных в строительстве, ремонте и производстве. Поставляем электроинструмент для частных клиентов, строительных организаций, снабженцев и тендерных закупок.</div>
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
          <div className="home-products-grid" style={{gap: 0}}>
            {miniProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <div
                  className="product-card kaspi-style mini-product-card"
                  style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff' }}
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
                  <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                    <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
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