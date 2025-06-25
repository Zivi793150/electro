import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Catalog.css';

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Данные категорий и товаров (в реальном проекте будут из API)
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
    {
      id: 1,
      name: 'Болгарка Makita 125мм',
      category: 'grinders',
      image: '/images/products/bolgarka-makita-125.jpg',
      price: '45 000 ₸',
      description: 'Профессиональная угловая шлифмашина'
    },
    {
      id: 2,
      name: 'Шуруповёрт DeWalt 18V',
      category: 'screwdrivers',
      image: '/images/products/shurupovert-dewalt-18v.jpg',
      price: '85 000 ₸',
      description: 'Беспроводной шуруповёрт с литий-ионным аккумулятором'
    },
    {
      id: 3,
      name: 'Перфоратор Bosch GBH 2-26',
      category: 'hammers',
      image: '/images/products/perforator-bosch-gbh.jpg',
      price: '120 000 ₸',
      description: 'Мощный перфоратор для строительных работ'
    },
    {
      id: 4,
      name: 'Дрель Интерскол ДУ-13/780',
      category: 'drills',
      image: 'https://via.placeholder.com/300x200?text=Дрель+Интерскол',
      price: '25 000 ₸',
      description: 'Универсальная дрель для сверления'
    },
    {
      id: 5,
      name: 'Лобзик Makita 4329',
      category: 'jigsaws',
      image: 'https://via.placeholder.com/300x200?text=Лобзик+Makita',
      price: '35 000 ₸',
      description: 'Электролобзик для точной резки'
    },
    {
      id: 6,
      name: 'Лазерный уровень BOSCH GLL 2-10',
      category: 'levels',
      image: 'https://via.placeholder.com/300x200?text=Лазерный+уровень',
      price: '55 000 ₸',
      description: 'Точный лазерный уровень для разметки'
    },
    {
      id: 7,
      name: 'Генератор Huter DY3000L',
      category: 'generators',
      image: 'https://via.placeholder.com/300x200?text=Генератор+Huter',
      price: '180 000 ₸',
      description: 'Бензиновый генератор 3 кВт'
    },
    {
      id: 8,
      name: 'Мультиметр Fluke 117',
      category: 'measuring',
      image: 'https://via.placeholder.com/300x200?text=Мультиметр+Fluke',
      price: '95 000 ₸',
      description: 'Профессиональный измерительный прибор'
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="catalog">
      <Header />
      
      <main className="catalog-main">
        <div className="container">
          <h1 className="catalog-title">Каталог товаров</h1>
          
          {/* Фильтр категорий */}
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Сетка товаров */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">{product.price}</div>
                  <button className="btn-details">Подробнее</button>
                </div>
              </div>
            ))}
          </div>

          {/* SEO-описание */}
          <section className="seo-description">
            <h2>Электроинструменты: качество и надёжность</h2>
            <p>
              Мы предлагаем широкий ассортимент профессиональных электроинструментов 
              от ведущих мировых производителей. В нашем каталоге вы найдёте дрели, 
              шуруповёрты, болгарки, перфораторы и многое другое. Вся продукция 
              сертифицирована и имеет гарантию от производителя.
            </p>
            <p>
              Работаем как с розничными, так и с оптовыми клиентами. Предоставляем 
              техническую поддержку и консультации по выбору инструмента. 
              Доставка по Алматы и области.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog; 