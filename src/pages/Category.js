import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Category.css';

const Category = () => {
  const categoryData = {
    name: 'Болгарки',
    description: 'Угловые шлифмашины для резки и шлифовки металла, плитки, кирпича',
    image: 'https://via.placeholder.com/800x300?text=Болгарки',
    products: [
      { id: 1, name: 'Болгарка Makita 125мм', image: 'https://via.placeholder.com/300x200?text=Болгарка+Makita+125', price: '45 000 ₸', power: '1200 Вт', discSize: '125 мм' },
      { id: 2, name: 'Болгарка DeWalt 230мм', image: 'https://via.placeholder.com/300x200?text=Болгарка+DeWalt+230', price: '85 000 ₸', power: '2000 Вт', discSize: '230 мм' },
      { id: 3, name: 'Болгарка Интерскол 115мм', image: 'https://via.placeholder.com/300x200?text=Болгарка+Интерскол+115', price: '25 000 ₸', power: '900 Вт', discSize: '115 мм' },
      { id: 4, name: 'Болгарка Bosch GWS 7-125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Bosch+GWS', price: '55 000 ₸', power: '720 Вт', discSize: '125 мм' },
      { id: 5, name: 'Болгарка Metabo W 8-115', image: 'https://via.placeholder.com/300x200?text=Болгарка+Metabo+W8', price: '65 000 ₸', power: '800 Вт', discSize: '115 мм' },
      { id: 6, name: 'Болгарка Hitachi G13SS', image: 'https://via.placeholder.com/300x200?text=Болгарка+Hitachi+G13', price: '35 000 ₸', power: '1300 Вт', discSize: '125 мм' },
      { id: 7, name: 'Болгарка AEG WS 6-125', image: 'https://via.placeholder.com/300x200?text=Болгарка+AEG+WS6', price: '75 000 ₸', power: '600 Вт', discSize: '125 мм' },
      { id: 8, name: 'Болгарка Milwaukee M18', image: 'https://via.placeholder.com/300x200?text=Болгарка+Milwaukee+M18', price: '120 000 ₸', power: 'Беспроводная', discSize: '125 мм' },
      { id: 9, name: 'Болгарка Ryobi ONE+', image: 'https://via.placeholder.com/300x200?text=Болгарка+Ryobi+ONE', price: '95 000 ₸', power: 'Беспроводная', discSize: '115 мм' },
      { id: 10, name: 'Болгарка Black+Decker KG115', image: 'https://via.placeholder.com/300x200?text=Болгарка+Black+Decker', price: '30 000 ₸', power: '850 Вт', discSize: '115 мм' },
      { id: 11, name: 'Болгарка Einhell TE-AG 125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Einhell+TE', price: '40 000 ₸', power: '1100 Вт', discSize: '125 мм' },
      { id: 12, name: 'Болгарка Sparky BOSCH 125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Sparky+BOSCH', price: '50 000 ₸', power: '1200 Вт', discSize: '125 мм' },
      { id: 13, name: 'Болгарка Зубр ЗУБР-125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Зубр+ЗУБР', price: '28 000 ₸', power: '1100 Вт', discSize: '125 мм' },
      { id: 14, name: 'Болгарка Калибр ЭУ-125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Калибр+ЭУ', price: '22 000 ₸', power: '1000 Вт', discSize: '125 мм' },
      { id: 15, name: 'Болгарка Patriot AG 125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Patriot+AG', price: '32 000 ₸', power: '1200 Вт', discSize: '125 мм' },
      { id: 16, name: 'Болгарка Вихрь УШМ-125', image: 'https://via.placeholder.com/300x200?text=Болгарка+Вихрь+УШМ', price: '26 000 ₸', power: '1100 Вт', discSize: '125 мм' }
    ]
  };

  return (
    <div className="category">
      <Header />
      <main className="category-main">
        <div className="container">
          <div className="category-header">
            <h1 className="category-title">{categoryData.name}</h1>
            <p className="category-subtitle">{categoryData.description}</p>
          </div>
          <div className="category-preview">
            <img src={categoryData.image} alt={categoryData.name} loading="lazy" />
          </div>
          <div className="category-products">
            <h2>Товары в категории "{categoryData.name}"</h2>
            <div className="products-grid">
              {categoryData.products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-specs">
                      <span className="spec">Мощность: {product.power}</span>
                      <span className="spec">Диск: {product.discSize}</span>
                    </div>
                    <div className="product-price">{product.price}</div>
                    <button className="btn-details">Подробнее</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <section className="seo-description">
            <h2>Болгарки: обзор и особенности</h2>
            <p>Болгарки (угловые шлифмашины) — универсальный инструмент, используемый в строительстве, ремонте, металлообработке. Мы предлагаем модели от мировых брендов и отечественных производителей по выгодным ценам. Вся продукция сертифицирована и имеет гарантию от 12 месяцев.</p>
            <p>В нашем каталоге представлены болгарки различной мощности (от 600 до 2000 Вт) и диаметра диска (115, 125, 230 мм). Есть как сетевые, так и аккумуляторные модели. Все инструменты оснащены защитными кожухами и системой защиты от перегрузки.</p>
            <p>При выборе болгарки учитывайте характер работ: для мелких работ подойдут модели 115-125 мм, для резки толстого металла — 230 мм. Мощность влияет на производительность и время работы без перегрева.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category; 