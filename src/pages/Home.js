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
    },
    {
      id: 5,
      name: 'Лобзик Makita 4329',
      image: 'https://via.placeholder.com/300x200?text=Лобзик+Makita',
      price: '35 000 ₸',
      description: 'Электролобзик для точной резки'
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
      description: 'Бензиновый генератор 3 кВт'
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
          {miniProducts.slice(0, 8).map(product => (
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