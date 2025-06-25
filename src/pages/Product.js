import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Product.css';

const Product = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Данные товара (в реальном проекте будут из API)
  const product = {
    id: 1,
    name: 'Болгарка Makita 125мм',
    subtitle: 'Профессиональный инструмент для точной и безопасной работы',
    description: 'Болгарка Makita предназначена для резки и шлифовки металла, плитки, кирпича. Лёгкий корпус, мощный мотор, защита от перегрева — всё для удобства и безопасности.',
    price: '45 000 ₸',
    images: [
      '/images/products/bolgarka-makita-125.jpg',
      'https://via.placeholder.com/600x400?text=Болгарка+Makita+2',
      'https://via.placeholder.com/600x400?text=Болгарка+Makita+3'
    ],
    specifications: [
      { name: 'Мощность', value: '1200 Вт' },
      { name: 'Диаметр диска', value: '125 мм' },
      { name: 'Обороты', value: 'до 11 000 об/мин' },
      { name: 'Вес', value: '2.3 кг' },
      { name: 'Длина кабеля', value: '2.5 м' },
      { name: 'Потребляемая мощность', value: '1200 Вт' },
      { name: 'Частота вращения', value: '11000 об/мин' },
      { name: 'Диаметр посадочного отверстия', value: '22.23 мм' }
    ],
    equipment: [
      'Болгарка',
      'Защитный кожух',
      'Ключ',
      'Руководство пользователя',
      'Гарантийный талон'
    ],
    applications: [
      'Металлообработка',
      'Строительство',
      'Ремонтные работы',
      'Промышленное использование',
      'Резка металлических труб',
      'Шлифовка сварных швов'
    ]
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitForm = (formData) => {
    // Здесь будет логика отправки в Telegram
    console.log('Заявка на товар:', { ...formData, product: product.name });
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  return (
    <div className="product">
      <Header />
      
      <main className="product-main">
        <div className="container">
          {/* Хлебные крошки */}
          <nav className="breadcrumbs">
            <a href="/">Главная</a> &gt;
            <a href="/catalog">Каталог</a> &gt;
            <a href="/category">Болгарки</a> &gt;
            <span>{product.name}</span>
          </nav>

          <div className="product-content">
            {/* Галерея изображений */}
            <div className="product-gallery">
              <div className="main-image">
                <img src={product.images[activeImage]} alt={product.name} />
              </div>
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Информация о товаре */}
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              <h3 className="product-subtitle">{product.subtitle}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-price">{product.price}</div>
              
              <button className="btn-order" onClick={handleOpenModal}>
                Оставить заявку
              </button>
            </div>
          </div>

          {/* Характеристики */}
          <section className="product-specifications">
            <h2>Характеристики</h2>
            <div className="specs-grid">
              {product.specifications.map((spec, index) => (
                <div key={index} className="spec-item">
                  <span className="spec-name">{spec.name}:</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Комплектация */}
          <section className="product-equipment">
            <h2>Комплектация</h2>
            <ul className="equipment-list">
              {product.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Область применения */}
          <section className="product-applications">
            <h2>Область применения</h2>
            <div className="applications-grid">
              {product.applications.map((app, index) => (
                <div key={index} className="application-item">
                  <span className="application-icon">🔧</span>
                  <span className="application-text">{app}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Дополнительная форма заявки */}
          <section className="product-order">
            <h2>Заказать {product.name}</h2>
            <p>Оставьте заявку, и наш менеджер свяжется с вами для уточнения деталей заказа.</p>
            <button className="btn-order-large" onClick={handleOpenModal}>
              Оставить заявку на покупку
            </button>
          </section>
        </div>
      </main>

      <Footer />
      
      <Modal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Product; 