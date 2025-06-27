import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Home.css';
import '../styles/Catalog.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitForm = (formData) => {
    // Здесь будет логика отправки в Telegram
    console.log('Форма отправлена:', formData);
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  const miniProducts = [
    {
      id: 1,
      name: 'Болгарка Makita 125мм',
      image: '/images/products/bolgarka-makita-125.jpg',
      price: '45 000 ₸',
      description: 'Профессиональная угловая шлифмашина'
    },
    {
      id: 2,
      name: 'Шуруповёрт DeWalt 18V',
      image: '/images/products/shurupovert-dewalt-18v.jpg',
      price: '85 000 ₸',
      description: 'Беспроводной шуруповёрт с литий-ионным аккумулятором'
    },
    {
      id: 3,
      name: 'Перфоратор Bosch GBH 2-26',
      image: '/images/products/perforator-bosch-gbh.jpg',
      price: '120 000 ₸',
      description: 'Мощный перфоратор для строительных работ'
    },
    {
      id: 4,
      name: 'Дрель Интерскол ДУ-13/780',
      image: 'https://via.placeholder.com/300x200?text=Дрель+Интерскол',
      price: '25 000 ₸',
      description: 'Универсальная дрель для сверления'
    }
  ];

  return (
    <div className="home">
      <Header />
      
      {/* Главная секция */}
      <section className="hero">
        <div className="hero-left">
          <img 
            src="/images/hero/hero-main.jpg" 
            alt="Электроинструменты Танкер" 
            className="hero-image"
          />
        </div>
        <div className="hero-right">
          <h1>
            Профессиональные <span className="accent">электроинструменты</span>
          </h1>
          <div className="hero-text-container">
          <h3>Качество и надёжность для ваших проектов</h3>
          <p>
            Мы предлагаем широкий ассортимент электроинструментов от ведущих мировых производителей. 
            Дрели, шуруповёрты, болгарки, перфораторы и многое другое для профессионалов и любителей.
          </p>
          <p>
            Вся продукция сертифицирована и имеет гарантию от производителя. 
            Работаем как с розничными, так и с оптовыми клиентами.
          </p>
          </div>
          
          {/* Преимущества (4 штуки) */}
          <div className="advantages-list">
            <div className="advantage-item">
              <span className="advantage-icon">🏭</span>
              <span>Прямые поставки от производителя</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">✅</span>
              <span>Гарантия качества 12 месяцев</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">🚚</span>
              <span>Быстрая доставка по Алматы</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">🔧</span>
              <span>Техническая поддержка</span>
            </div>
          </div>
          
          <button className="btn-primary" onClick={handleOpenModal}>
            Оставить заявку
          </button>
        </div>
      </section>

      {/* Мини-каталог товаров */}
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Популярные товары</h2>
          <a href="/catalog" className="mini-catalog-link">Смотреть все</a>
        </div>
        <div className="mini-catalog-grid">
          {miniProducts.map(product => (
            <div
              key={product.id}
              className="product-card mini-product-card"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{product.price}</div>
              </div>
            </div>
          ))}
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