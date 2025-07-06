import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import ImageModal from '../components/ImageModal';
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

// Категории для хлебных крошек
const categories = [
  { id: 'grinders', name: 'Болгарки' },
  { id: 'screwdrivers', name: 'Шуруповёрты' },
  { id: 'hammers', name: 'Перфораторы' },
  { id: 'drills', name: 'Дрели' },
  { id: 'jigsaws', name: 'Лобзики' },
  { id: 'levels', name: 'Лазерные уровни' },
  { id: 'generators', name: 'Генераторы' },
  { id: 'measuring', name: 'Измерители' }
];

const Product = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="product">
        <Header />
        <main className="product-main">
          <div className="container" style={{padding: '48px 0', textAlign: 'center'}}>
            <h1>Товар не найден</h1>
            <p>Проверьте правильность ссылки или вернитесь в <a href="/catalog">каталог</a>.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Найти категорию для хлебных крошек
  const categoryObj = categories.find(cat => cat.id === product.category);
  const categoryName = categoryObj ? categoryObj.name : '';

  // Преимущества — если есть в product, иначе дефолтные
  const productAdvantages = product.advantages || [
    'Высокий крутящий момент и мощность',
    'Долговечный литий-ионный аккумулятор',
    'Компактный и лёгкий корпус для работы одной рукой'
  ];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = (formData) => {
    console.log('Заявка на товар:', { ...formData, product: product.name });
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  // Модалка фото
  const handleImageClick = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  return (
    <div className="product">
      <Header />
      <main className="product-main">
        <nav className="product-breadcrumbs">
          <a href="/">Главная</a>
          <span className="breadcrumbs-sep">&gt;</span>
          <a href="/catalog">Каталог</a>
          {categoryName && <><span className="breadcrumbs-sep">&gt;</span><a href={`/catalog?category=${product.category}`}>{categoryName}</a></>}
          <span className="breadcrumbs-sep">&gt;</span>
          <span>{product.name}</span>
        </nav>
        <div className="container product-maket-container">
          <div className="product-maket-content">
            <div className="product-maket-left">
              <img
                className="product-maket-image"
                src={product.images[activeImage]}
                alt={product.name}
                onClick={handleImageClick}
                style={{ cursor: 'zoom-in' }}
              />
              <div className="product-thumbnails">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`product-thumbnail${activeImage === idx ? ' active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={product.name + ' миниатюра ' + (idx+1)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="product-maket-right">
              <h1 className="maket-title">{product.name}</h1>
              <div className="maket-rating">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="rating-value">5.0</span>
              </div>
              <div className="maket-subtitle">{product.subtitle}</div>
              <div className="maket-text">{product.description}</div>
              <ul className="maket-advantages">
                {productAdvantages.map((adv, idx) => (
                  <li key={idx} className="maket-adv-item">
                    <span className="maket-arrow">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9H15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/><path d="M11 5L15 9L11 13" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
              <button className="maket-btn" onClick={handleOpenModal}>Оставить заявку</button>
            </div>
          </div>
        </div>

        {/* Характеристики */}
        {product.specifications && (
        <div className="product-specifications-container">
          <div className="product-specifications-content">
            <h2 className="specifications-title">Характеристики</h2>
            <div className="specifications-grid">
            {product.specifications.map((spec, index) => (
                <div key={index} className="specification-item">
                  <span className="specification-name">{spec.name}</span>
                  <span className="specification-value">{spec.value}</span>
              </div>
            ))}
          </div>
          </div>
      </div>
      )}
    </main>
    <Footer />
    <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} />
    {showImageModal && (
      <ImageModal
        images={product.images}
        activeIndex={activeImage}
        onClose={handleCloseImageModal}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
    />
    )}
  </div>
);
};

export default Product; 