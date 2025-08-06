import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Catalog.css';
import { Link, useLocation } from 'react-router-dom';

const Catalog = () => {
  // Функция для получения оптимального размера изображения
  const getOptimalImage = (product, preferredSize = 'medium') => {
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  // Статические категории для fallback
  const staticCategories = [
    { id: 'all', name: 'Все товары' },
    { id: 'drills', name: 'Дрели' },
    { id: 'grinders', name: 'Болгарки' },
    { id: 'screwdrivers', name: 'Шуруповёрты' },
    { id: 'hammers', name: 'Перфораторы' },
    { id: 'jigsaws', name: 'Лобзики' },
    { id: 'levels', name: 'Лазерные уровни' },
    { id: 'generators', name: 'Генераторы' },
    { id: 'measuring', name: 'Измерители' }
  ];

  const location = useLocation();
  const getCategoryFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';
  };
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromQuery());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(getCategoryFromQuery());
  }, [location.search]);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

          const API_URL = 'https://electro-a8bl.onrender.com/api/products';

  // Загрузка товаров
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('https://electro-a8bl.onrender.com/api/products-unified')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки объединенных товаров, пробуем обычные:', err);
        // Fallback к обычным товарам
        fetch(API_URL)
          .then(res => res.json())
          .then(data => {
            setProducts(data);
            setLoading(false);
          })
          .catch(err => {
            setError('Ошибка загрузки товаров');
            setLoading(false);
          });
      });
  }, []);

  // Извлечение категорий из товаров
  useEffect(() => {
    if (products.length > 0) {
      setCategoriesLoading(true);
      
      // Извлекаем уникальные категории из товаров, нормализуем и сортируем их
      const categoryMap = new Map();
      
      products.forEach(product => {
        if (product.category) {
          // Нормализуем название категории: убираем лишние пробелы и приводим к нижнему регистру
          const normalizedCategory = product.category.trim().toLowerCase();
          const originalCategory = product.category.trim();
          
          // Если такой нормализованной категории еще нет, добавляем её
          if (!categoryMap.has(normalizedCategory)) {
            categoryMap.set(normalizedCategory, originalCategory);
          }
        }
      });
      
      const uniqueCategories = Array.from(categoryMap.values()).sort();
      
      if (uniqueCategories.length > 0) {
        // Добавляем категорию "Все товары" в начало
        const allCategories = [
          { id: 'all', name: 'Все товары' },
          ...uniqueCategories.map(category => ({
            id: category,
            name: category
          }))
        ];
        setCategories(allCategories);
      } else {
        // Если нет категорий в товарах, используем статические
        setCategories(staticCategories);
      }
      setCategoriesLoading(false);
    }
  }, [products]);

  // Принудительное применение стилей для карточек
  useEffect(() => {
    const forceStyles = () => {
      const grid = document.querySelector('.catalog-products-grid');
      const cards = document.querySelectorAll('.product-card');
      const images = document.querySelectorAll('.product-image');
      const infos = document.querySelectorAll('.product-info');
      
      if (grid) {
        grid.style.display = 'grid';
        grid.style.gap = '0';
        grid.style.margin = '0';
        grid.style.padding = '0';
        grid.style.borderCollapse = 'collapse';
        grid.style.borderSpacing = '0';
      }
      
      cards.forEach(card => {
        card.style.margin = '-1px';
        card.style.border = '1px solid #e3e6ea';
        card.style.borderRadius = '0';
        card.style.padding = '0';
        card.style.background = '#fff';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.height = '100%';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.style.boxSizing = 'border-box';
        card.style.minHeight = 'auto';
      });
      
      images.forEach(img => {
        img.style.height = '160px';
        img.style.padding = '0';
        img.style.margin = '0';
      });
      
      infos.forEach(info => {
        info.style.padding = '6px';
        info.style.minHeight = '80px';
      });
    };

    // Применяем стили сразу и после загрузки
    forceStyles();
    setTimeout(forceStyles, 50);
    setTimeout(forceStyles, 100);
    setTimeout(forceStyles, 200);
    setTimeout(forceStyles, 500);
    setTimeout(forceStyles, 1000);

    // Применяем стили при изменении размера окна
    const handleResize = () => {
      setTimeout(forceStyles, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [products]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category && product.category.trim() === selectedCategory);

  // Пагинация
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Сброс на первую страницу при смене категории
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog">
      <Header />
      <main className="catalog-main">
        <div className="container catalog-layout">
          <aside className="catalog-sidebar desktop-sidebar">
            <h3 className="sidebar-title">Категории</h3>
            {categoriesLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Загрузка категорий...
              </div>
            ) : (
              <ul className="sidebar-categories">
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      className={`sidebar-category-btn${selectedCategory === category.id ? ' active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <div className="catalog-content">
            <div className="category-dropdown-container mobile-dropdown">
              <div className={`category-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <button 
                  className="category-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={categoriesLoading}
                >
                  <span>
                    {categoriesLoading 
                      ? 'Загрузка...' 
                      : categories.find(cat => cat.id === selectedCategory)?.name || 'Все товары'
                    }
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isDropdownOpen && !categoriesLoading && (
                  <div className="category-dropdown-menu">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`category-dropdown-item${selectedCategory === category.id ? ' active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <h1 className="catalog-title" style={{textAlign: 'left', marginLeft: 0}}>
              {categoriesLoading 
                ? 'Каталог товаров' 
                : selectedCategory === 'all' 
                  ? 'Каталог товаров' 
                  : categories.find(cat => cat.id === selectedCategory)?.name || 'Каталог товаров'
              }
            </h1>
            {loading ? (
              <div style={{padding: 32}}>Загрузка...</div>
            ) : error ? (
              <div style={{color: 'red', padding: 32}}>{error}</div>
            ) : (
            <div className="catalog-products-grid" style={{gap: 0}}>
              {currentProducts.map(product => (
                <Link
                  to={product.isGroup ? `/product-group/${encodeURIComponent(product.baseName)}` : `/product/${product._id}`}
                  key={product._id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="product-card kaspi-style mini-product-card"
                    style={{ cursor: 'pointer', minHeight: 'auto', position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', border: '1px solid #e3e6ea', margin: '-1px' }}
                  >
                    <div className="product-image" style={{height: '160px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <picture style={{width: '100%', height: '100%'}}>
                        <source 
                          srcSet={getOptimalImage(product, 'webp')} 
                          type="image/webp"
                        />
                        <img 
                          src={getOptimalImage(product, 'medium')} 
                          alt={product.name} 
                          style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} 
                          loading="lazy"
                          width="260"
                          height="160"
                        />
                      </picture>
                    </div>
                    <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                    <div className="product-info" style={{padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: '80px'}}>
                      <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '20px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>
                        {product.name}
                        {product.isGroup && product.voltages && (
                          <div style={{fontSize: '0.75rem', color: '#666', marginTop: '2px', fontWeight: 400}}>
                            {product.voltages.join(', ')} В
                          </div>
                        )}
                      </span>
                      <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                        <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                        <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{product.price ? product.price + ' ₸' : ''}</span>
                        <span style={{height:'2.7em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 7px',verticalAlign:'middle'}}></span>
                      </div>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '40px',
                marginBottom: '20px',
                gap: '8px'
              }}>
                {/* Кнопка "Предыдущая" */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e3e6ea',
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    color: currentPage === 1 ? '#999' : '#333',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ← Назад
                </button>
                
                {/* Номера страниц */}
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => {
                  // Показываем только первые 5 страниц, последние 5 и текущую с соседними
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #e3e6ea',
                          background: currentPage === pageNumber ? '#e86c0a' : '#fff',
                          color: currentPage === pageNumber ? '#fff' : '#333',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: '500',
                          minWidth: '40px'
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        style={{
                          padding: '8px 4px',
                          color: '#999',
                          fontSize: '14px'
                        }}
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                {/* Кнопка "Следующая" */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e3e6ea',
                    background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                    color: currentPage === totalPages ? '#999' : '#333',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Вперед →
                </button>
              </div>
            )}
            
            <section className="seo-description">
              <h2>Электроинструменты: качество и надёжность</h2>
              <p>Мы предлагаем широкий ассортимент профессиональных электроинструментов от ведущих мировых производителей. В нашем каталоге вы найдёте дрели, шуруповёрты, болгарки, перфораторы и многое другое. Вся продукция сертифицирована и имеет гарантию от производителя.</p>
              <p>Работаем как с розничными, так и с оптовыми клиентами. Предоставляем техническую поддержку и консультации по выбору инструмента. Доставка по Алматы и области.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog; 