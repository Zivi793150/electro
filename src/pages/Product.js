import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Product.css';

const products = [
  {
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
  },
  {
    id: 2,
    name: 'Шуруповёрт DeWalt 18V',
    subtitle: 'Беспроводной шуруповёрт с литий-ионным аккумулятором',
    description: 'Мощный и удобный шуруповёрт для профессионального и бытового использования.',
    price: '85 000 ₸',
    images: [
      '/images/products/shurupovert-dewalt-18v.jpg',
      'https://via.placeholder.com/600x400?text=Шуруповёрт+DeWalt+2',
      'https://via.placeholder.com/600x400?text=Шуруповёрт+DeWalt+3'
    ],
    specifications: [
      { name: 'Напряжение', value: '18 В' },
      { name: 'Тип аккумулятора', value: 'Li-Ion' },
      { name: 'Макс. крутящий момент', value: '70 Нм' },
      { name: 'Вес', value: '1.7 кг' }
    ],
    equipment: [
      'Шуруповёрт',
      'Аккумулятор',
      'Зарядное устройство',
      'Кейс',
      'Инструкция'
    ],
    applications: [
      'Сборка мебели',
      'Строительство',
      'Ремонт',
      'Монтажные работы'
    ]
  },
  {
    id: 3,
    name: 'Перфоратор Bosch GBH 2-26',
    subtitle: 'Мощный перфоратор для строительных работ',
    description: 'Перфоратор Bosch — надёжный инструмент для сверления и долбления бетона и кирпича.',
    price: '120 000 ₸',
    images: [
      '/images/products/perforator-bosch-gbh.jpg',
      'https://via.placeholder.com/600x400?text=Перфоратор+Bosch+2',
      'https://via.placeholder.com/600x400?text=Перфоратор+Bosch+3'
    ],
    specifications: [
      { name: 'Мощность', value: '800 Вт' },
      { name: 'Энергия удара', value: '2.7 Дж' },
      { name: 'Вес', value: '2.8 кг' }
    ],
    equipment: [
      'Перфоратор',
      'Бур',
      'Кейс',
      'Инструкция'
    ],
    applications: [
      'Сверление бетона',
      'Долбление',
      'Ремонт',
      'Строительство'
    ]
  }
];

const Product = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="product">
        <Header />
        <main className="product-main">
          <div className="container">
            <h1>Товар не найден</h1>
            <p>Проверьте правильность ссылки или вернитесь в <a href="/catalog">каталог</a>.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          {product.specifications && (
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
          )}

          {/* Комплектация */}
          {product.equipment && (
          <section className="product-equipment">
            <h2>Комплектация</h2>
            <ul className="equipment-list">
              {product.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          )}

          {/* Область применения */}
          {product.applications && (
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
          )}

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