import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Home.css';

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
          <h1>Профессиональные электроинструменты</h1>
          <h3>Качество и надёжность для ваших проектов</h3>
          <p>
            Мы предлагаем широкий ассортимент электроинструментов от ведущих мировых производителей. 
            Дрели, шуруповёрты, болгарки, перфораторы и многое другое для профессионалов и любителей.
          </p>
          <p>
            Вся продукция сертифицирована и имеет гарантию от производителя. 
            Работаем как с розничными, так и с оптовыми клиентами.
          </p>
          <button className="btn-primary" onClick={handleOpenModal}>
            Оставить заявку
          </button>
        </div>
      </section>

      {/* Каталог товаров (превью) */}
      <section className="catalog-preview">
        <div className="container">
          <h2>Популярные товары</h2>
          <div className="products-preview">
            <div className="product-preview">
              <img src="/images/products/bolgarka-makita-125.jpg" alt="Болгарка Makita" />
              <h3>Болгарка Makita 125мм</h3>
              <p>45 000 ₸</p>
            </div>
            <div className="product-preview">
              <img src="/images/products/shurupovert-dewalt-18v.jpg" alt="Шуруповёрт DeWalt" />
              <h3>Шуруповёрт DeWalt 18V</h3>
              <p>85 000 ₸</p>
            </div>
            <div className="product-preview">
              <img src="/images/products/perforator-bosch-gbh.jpg" alt="Перфоратор Bosch" />
              <h3>Перфоратор Bosch GBH 2-26</h3>
              <p>120 000 ₸</p>
            </div>
          </div>
          <div className="catalog-link">
            <Link to="/catalog" className="btn-secondary">Смотреть весь каталог</Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="advantages">
        <div className="container">
          <h2>Почему выбирают нас</h2>
          <div className="advantages-grid">
            <div className="advantage-item">
              <div className="advantage-icon">🏭</div>
              <h3>Прямые поставки</h3>
              <p>Работаем напрямую с производителями</p>
            </div>
            <div className="advantage-item">
              <div className="advantage-icon">✅</div>
              <h3>Гарантия качества</h3>
              <p>Вся продукция сертифицирована</p>
            </div>
            <div className="advantage-item">
              <div className="advantage-icon">🚚</div>
              <h3>Быстрая доставка</h3>
              <p>По Алматы в день заказа</p>
            </div>
            <div className="advantage-item">
              <div className="advantage-icon">🔧</div>
              <h3>Техподдержка</h3>
              <p>Консультации по выбору инструмента</p>
            </div>
          </div>
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