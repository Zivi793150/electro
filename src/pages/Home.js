import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Home.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = () => {
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  const advantages = [
    'Только оригинальный инструмент от ведущих брендов',
    'Гарантия и сервисное обслуживание',
    'Быстрая доставка по всему Казахстану'
  ];

  const miniProducts = [
    { id: 1, name: 'Болгарка Makita 125мм', image: '/images/products/bolgarka-makita-125.jpg', category: 'grinders' },
    { id: 2, name: 'Шуруповёрт DeWalt 18V', image: '/images/products/shurupovert-dewalt-18v.jpg', category: 'screwdrivers' },
    { id: 3, name: 'Перфоратор Bosch GBH 2-26', image: '/images/products/perforator-bosch-gbh.jpg', category: 'hammers' },
    { id: 4, name: 'Дрель Интерскол ДУ-13/780', image: '/images/products/drel.jpg', category: 'drills' },
    { id: 5, name: 'Лобзик Makita 4329', image: 'https://via.placeholder.com/300x200?text=Лобзик+Makita', category: 'jigsaws' },
    { id: 6, name: 'Лазерный уровень BOSCH GLL 2-10', image: 'https://via.placeholder.com/300x200?text=Лазерный+уровень', category: 'levels' },
    { id: 7, name: 'Генератор Huter DY3000L', image: 'https://via.placeholder.com/300x200?text=Генератор+Huter', category: 'generators' },
    { id: 8, name: 'Мультиметр Fluke 117', image: 'https://via.placeholder.com/300x200?text=Мультиметр+Fluke', category: 'measuring' }
  ];

  return (
    <div className="home">
      <Header />
      <section className="main-maket-section">
        <div className="main-maket-container">
          <div className="main-maket-left">
            <img src="/images/hero/hero-main.jpg" alt="Электроинструменты для профессионалов" className="main-maket-image" loading="lazy" />
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
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Каталог товаров</h2>
          <a href="/catalog" className="mini-catalog-link">Смотреть все</a>
        </div>
        <div className="mini-catalog-grid">
          {miniProducts.map((product) => (
            <a
              href={`/catalog?category=${product.category}`}
              key={product.id}
              className="mini-product-link"
            >
              <div className="product-card mini-product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="mini-product-divider"></div>
                <div className="product-info">
                  <span className="mini-product-name">{product.name}</span>
                </div>
              </div>
            </a>
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