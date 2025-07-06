import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Home.css';
import '../styles/Catalog.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = (formData) => {
    console.log('Форма отправлена:', formData);
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  const advantages = [
    'Только оригинальный инструмент от ведущих брендов',
    'Гарантия и сервисное обслуживание',
    'Быстрая доставка по всему Казахстану'
  ];

  const miniProducts = [
    {
      id: 1,
      name: 'Болгарка Makita 125мм',
      image: '/images/products/bolgarka-makita-125.jpg',
      price: '45 000 ₸',
      description: 'Профессиональная угловая шлифмашина',
      discount: 10
    },
    {
      id: 2,
      name: 'Шуруповёрт DeWalt 18V',
      image: '/images/products/shurupovert-dewalt-18v.jpg',
      price: '85 000 ₸',
      description: 'Беспроводной шуруповёрт с литий-ионным аккумулятором',
      discount: 17
    },
    {
      id: 3,
      name: 'Перфоратор Bosch GBH 2-26',
      image: '/images/products/perforator-bosch-gbh.jpg',
      price: '120 000 ₸',
      description: 'Мощный перфоратор для строительных работ',
      discount: 8
    },
    {
      id: 4,
      name: 'Дрель Интерскол ДУ-13/780',
      image: '/images/products/drel.jpg',
      price: '25 000 ₸',
      description: 'Универсальная дрель для сверления'
    },
    {
      id: 5,
      name: 'Лобзик Makita 4329',
      image: 'https://via.placeholder.com/300x200?text=Лобзик+Makita',
      price: '35 000 ₸',
      description: 'Электролобзик для точной резки',
      discount: 5
    },
    {
      id: 6,
      name: 'Лазерный уровень BOSCH GLL 2-10',
      image: 'https://via.placeholder.com/300x200?text=Лазерный+уровень',
      price: '55 000 ₸',
      description: 'Точный лазерный уровень для разметки'
    },
    {
      id: 7,
      name: 'Генератор Huter DY3000L',
      image: 'https://via.placeholder.com/300x200?text=Генератор+Huter',
      price: '180 000 ₸',
      description: 'Бензиновый генератор 3 кВт',
      discount: 15
    },
    {
      id: 8,
      name: 'Мультиметр Fluke 117',
      image: 'https://via.placeholder.com/300x200?text=Мультиметр+Fluke',
      price: '95 000 ₸',
      description: 'Профессиональный измерительный прибор'
    }
  ];

  // Пример категорий с эмодзи
  const categories = [
    { id: 1, name: 'Дрели', icon: '🛠️' },
    { id: 2, name: 'Шуруповёрты', icon: '🔩' },
    { id: 3, name: 'Болгарки', icon: '⚙️' },
    { id: 4, name: 'Перфораторы', icon: '🧱' },
    { id: 5, name: 'Пилы', icon: '🪚' },
    { id: 6, name: 'Измерительные', icon: '📏' },
    { id: 7, name: 'Генераторы', icon: '⚡' },
    { id: 8, name: 'Аксессуары', icon: '🎒' },
  ];

  return (
    <div className="home">
      <Header />
      <section className="main-maket-section">
        <div className="main-maket-container">
          <div className="main-maket-left">
            <img src="/images/hero/hero-main.jpg" alt="Электроинструменты для профессионалов" className="main-maket-image" />
          </div>
          <div className="main-maket-right">
            <h1 className="main-maket-title">Электроинструменты<br/>для профессионалов и дома</h1>
            <div className="main-maket-subtitle">Продажа и доставка оригинального электроинструмента по лучшим ценам. Официальная гарантия, большой выбор, консультации и поддержка.</div>
            <div className="main-maket-text">В нашем магазине вы найдёте дрели, шуруповёрты, перфораторы, болгарки, пилы, измерительные приборы и аксессуары от топовых производителей: DeWalt, Makita, Bosch, Интерскол и других. Работаем с частными и корпоративными клиентами. Поможем подобрать инструмент под ваши задачи!</div>
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
      {/* Мини-каталог товаров (теперь вместо ленты-каталога) */}
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Каталог товаров</h2>
          <a href="/catalog" className="mini-catalog-link">Смотреть все</a>
        </div>
        <div className="mini-catalog-grid">
          {miniProducts.slice(0, 8).map((product, idx) => {
            const priceNum = parseInt(product.price.replace(/\D/g, ''));
            const hasDiscount = !!product.discount;
            const newPrice = hasDiscount ? Math.round(priceNum * (1 - product.discount/100)) : priceNum;
            const installment = Math.round(newPrice / 12).toLocaleString('ru-RU') + ' ₸';
            const bonus = Math.round(newPrice * 0.05).toLocaleString('ru-RU') + ' Б';
            const rating = (4 + Math.random() * 1).toFixed(1);
            const reviews = 500 + idx * 300;
            return (
              <div
                key={product.id}
                className="product-card kaspi-style mini-product-card"
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff' }}
              >
                {/* Картинка */}
                <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} />
                </div>
                <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                  {/* Название */}
                  <a href="#" style={{fontSize: '1.05rem', fontWeight: 500, color: '#1976d2', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</a>
                  {/* Горизонтальный разделитель только под текстом */}
                  <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #e0e0e0',margin:'0 0 10px 0', alignSelf:'center'}}></div>
                  {/* Цена и разделитель */}
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 0, marginBottom:2, justifyContent:'center', width:'100%'}}>
                    {hasDiscount && (
                      <>
                        <span style={{color:'#888',fontSize:'1.05rem',textDecoration:'line-through',marginRight:0, fontWeight: 400}}>
                          {priceNum.toLocaleString('ru-RU') + ' ₸'}
                        </span>
                        <span style={{height:'2.0em',width:'1px',background:'#e0e0e0',display:'inline-block',margin:'0 7px',verticalAlign:'middle'}}></span>
                      </>
                    )}
                    <span className="product-price" style={{color:'#222',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{newPrice.toLocaleString('ru-RU')} ₸</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
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