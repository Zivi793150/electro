import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Catalog.css';
import { Link, useLocation } from 'react-router-dom';

const Catalog = () => {
  const location = useLocation();
  const getCategoryFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';
  };
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromQuery());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(getCategoryFromQuery());
  }, [location.search]);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

          const API_URL = '/api/products';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  }, []);

  // Принудительное применение стилей для карточек
  useEffect(() => {
    const forceStyles = () => {
      const grid = document.querySelector('.catalog-products-grid');
      const cards = document.querySelectorAll('.product-card');
      const images = document.querySelectorAll('.product-image');
      const infos = document.querySelectorAll('.product-info');
      
      if (grid) {
        grid.style.display = 'grid';
        grid.style.gap = '0';
        grid.style.margin = '0';
        grid.style.padding = '0';
        grid.style.borderCollapse = 'collapse';
        grid.style.borderSpacing = '0';
      }
      
      cards.forEach(card => {
        card.style.margin = '-1px';
        card.style.border = '1px solid #e3e6ea';
        card.style.borderRadius = '0';
        card.style.padding = '0';
        card.style.background = '#fff';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.height = '100%';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.style.boxSizing = 'border-box';
        card.style.minHeight = 'auto';
      });
      
      images.forEach(img => {
        img.style.height = '160px';
        img.style.padding = '0';
        img.style.margin = '0';
      });
      
      infos.forEach(info => {
        info.style.padding = '6px';
        info.style.minHeight = '80px';
      });
    };

    // Применяем стили сразу и после загрузки
    forceStyles();
    setTimeout(forceStyles, 50);
    setTimeout(forceStyles, 100);
    setTimeout(forceStyles, 200);
    setTimeout(forceStyles, 500);
    setTimeout(forceStyles, 1000);

    // Применяем стили при изменении размера окна
    const handleResize = () => {
      setTimeout(forceStyles, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [products]);

  const categories = [
    { id: 'all', name: 'Все товары', icon: '🔧' },
    { id: 'drills', name: 'Дрели', icon: '🛠' },
    { id: 'grinders', name: 'Болгарки', icon: '🪚' },
    { id: 'screwdrivers', name: 'Шуруповёрты', icon: '🔧' },
    { id: 'hammers', name: 'Перфораторы', icon: '🔌' },
    { id: 'jigsaws', name: 'Лобзики', icon: '🧰' },
    { id: 'levels', name: 'Лазерные уровни', icon: '🔦' },
    { id: 'generators', name: 'Генераторы', icon: '🧲' },
    { id: 'measuring', name: 'Измерители', icon: '📏' }
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="catalog">
      <Header />
      <main className="catalog-main">
        <div className="container catalog-layout">
          <aside className="catalog-sidebar desktop-sidebar">
            <h3 className="sidebar-title">Категории</h3>
            <ul className="sidebar-categories">
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    className={`sidebar-category-btn${selectedCategory === category.id ? ' active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="catalog-content">
            <div className="category-dropdown-container mobile-dropdown">
              <div className={`category-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <button 
                  className="category-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{categories.find(cat => cat.id === selectedCategory)?.name || 'Все товары'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isDropdownOpen && (
                  <div className="category-dropdown-menu">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`category-dropdown-item${selectedCategory === category.id ? ' active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <h1 className="catalog-title" style={{textAlign: 'left', marginLeft: 0}}>
              Каталог товаров
            </h1>
            {loading ? (
              <div style={{padding: 32}}>Загрузка...</div>
            ) : error ? (
              <div style={{color: 'red', padding: 32}}>{error}</div>
            ) : (
            <div className="catalog-products-grid" style={{gap: 0}}>
              {filteredProducts.map(product => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="product-card kaspi-style mini-product-card"
                    style={{ cursor: 'pointer', minHeight: 'auto', position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', border: '1px solid #e3e6ea', margin: '-1px' }}
                  >
                    <div className="product-image" style={{height: '160px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                    </div>
                    <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                    <div className="product-info" style={{padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: '80px'}}>
                      <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '20px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                      <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                        <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                        <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{product.price ? product.price + ' ₸' : ''}</span>
                        <span style={{height:'2.7em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 7px',verticalAlign:'middle'}}></span>
                      </div>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
            <section className="seo-description">
              <h2>Электроинструменты: качество и надёжность</h2>
              <p>Мы предлагаем широкий ассортимент профессиональных электроинструментов от ведущих мировых производителей. В нашем каталоге вы найдёте дрели, шуруповёрты, болгарки, перфораторы и многое другое. Вся продукция сертифицирована и имеет гарантию от производителя.</p>
              <p>Работаем как с розничными, так и с оптовыми клиентами. Предоставляем техническую поддержку и консультации по выбору инструмента. Доставка по Алматы и области.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog; 