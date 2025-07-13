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

  useEffect(() => {
    setSelectedCategory(getCategoryFromQuery());
  }, [location.search]);

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

  const products = [
    { id: 1, name: 'Болгарка Makita 125мм', category: 'grinders', image: '/images/products/bolgarka-makita-125.jpg', price: '45 000 ₸', description: 'Профессиональная угловая шлифмашина' },
    { id: 2, name: 'Шуруповёрт DeWalt 18V', category: 'screwdrivers', image: '/images/products/shurupovert-dewalt-18v.jpg', price: '85 000 ₸', description: 'Беспроводной шуруповёрт с литий-ионным аккумулятором' },
    { id: 3, name: 'Перфоратор Bosch GBH 2-26', category: 'hammers', image: '/images/products/perforator-bosch-gbh.jpg', price: '120 000 ₸', description: 'Мощный перфоратор для строительных работ' },
    { id: 4, name: 'Дрель Интерскол ДУ-13/780', category: 'drills', image: 'https://via.placeholder.com/300x200?text=Дрель+Интерскол', price: '25 000 ₸', description: 'Универсальная дрель для сверления' },
    { id: 5, name: 'Лобзик Makita 4329', category: 'jigsaws', image: 'https://via.placeholder.com/300x200?text=Лобзик+Makita', price: '35 000 ₸', description: 'Электролобзик для точной резки' },
    { id: 6, name: 'Лазерный уровень BOSCH GLL 2-10', category: 'levels', image: 'https://via.placeholder.com/300x200?text=Лазерный+уровень', price: '55 000 ₸', description: 'Точный лазерный уровень для разметки' },
    { id: 7, name: 'Генератор Huter DY3000L', category: 'generators', image: 'https://via.placeholder.com/300x200?text=Генератор+Huter', price: '180 000 ₸', description: 'Бензиновый генератор 3 кВт' },
    { id: 8, name: 'Мультиметр Fluke 117', category: 'measuring', image: 'https://via.placeholder.com/300x200?text=Мультиметр+Fluke', price: '95 000 ₸', description: 'Профессиональный измерительный прибор' }
  ];

  // miniProducts всегда первые 4 товара, не зависит от фильтрации
  const miniProducts = products.slice(0, 4);
  const filteredProducts = selectedCategory === 'all' ? products : products.filter(product => product.category === selectedCategory);

  return (
    <div className="catalog">
      <Header />
      <main className="catalog-main">
        <div className="container">
          <section className="mini-catalog-section">
            <div className="mini-catalog-header">
              <h2>Популярные товары</h2>
              <a href="/catalog" className="mini-catalog-link">Смотреть все</a>
            </div>
            <div className="catalog-mini-catalog-grid">
              {miniProducts.map(product => (
                <div
                  key={product.id}
                  className="product-card catalog-mini-product-card"
                  onClick={() => window.location.href = `/product/${product.id}`}
                  style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff' }}
                >
                  <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                  </div>
                  <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                  <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                    <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                    <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                      <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                      <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{parseInt(product.price.replace(/\D/g, '')).toLocaleString('ru-RU')} ₸</span>
                      <span style={{height:'2.7em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 7px',verticalAlign:'middle'}}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <h1 className="catalog-title">Каталог товаров</h1>
          <div className="category-filter category-filter-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
          <div className="products-grid" style={{gap: 0}}>
            {filteredProducts.map(product => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="product-card kaspi-style mini-product-card"
                  style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff' }}
                >
                  <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                  </div>
                  <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                  <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                    <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                    <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                      <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                      <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{parseInt(product.price.replace(/\D/g, '')).toLocaleString('ru-RU')} ₸</span>
                      <span style={{height:'2.7em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 7px',verticalAlign:'middle'}}></span>
                    </div>
                </div>
                </div>
              </Link>
            ))}
          </div>
          <section className="seo-description">
            <h2>Электроинструменты: качество и надёжность</h2>
            <p>Мы предлагаем широкий ассортимент профессиональных электроинструментов от ведущих мировых производителей. В нашем каталоге вы найдёте дрели, шуруповёрты, болгарки, перфораторы и многое другое. Вся продукция сертифицирована и имеет гарантию от производителя.</p>
            <p>Работаем как с розничными, так и с оптовыми клиентами. Предоставляем техническую поддержку и консультации по выбору инструмента. Доставка по Алматы и области.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog; 