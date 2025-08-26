import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatTenge } from '../utils/price';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { trackPageView } from '../utils/analytics';
import { fetchWithCache } from '../utils/cache';
import '../styles/Catalog.css';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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

  // Функция для преобразования кириллического названия категории в латинский ID
  const categoryToId = (categoryName) => {
    const categoryMap = {
      'дрели': 'drills',
      'болгарки': 'grinders',
      'шуруповёрты': 'screwdrivers',
      'перфораторы': 'hammers',
      'лобзики': 'jigsaws',
      'лазерные уровни': 'levels',
      'генераторы': 'generators',
      'измерители': 'measuring',
      'дрель': 'drills',
      'болгарка': 'grinders',
      'шуруповёрт': 'screwdrivers',
      'перфоратор': 'hammers',
      'лобзик': 'jigsaws',
      'лазерный уровень': 'levels',
      'генератор': 'generators',
      'измеритель': 'measuring'
    };
    
    // Нормализуем название: убираем лишние пробелы, приводим к нижнему регистру
    const normalizedName = categoryName.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Сначала ищем точное совпадение
    if (categoryMap[normalizedName]) {
      return categoryMap[normalizedName];
    }
    
    // Если точного совпадения нет, ищем по частичному совпадению
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }
    
    // Если ничего не найдено, создаем ID из названия
    return normalizedName.replace(/[^a-z0-9]/g, '-');
  };

  // Функция для получения названия категории по ID
  const idToCategory = (categoryId) => {
    const idMap = {
      'drills': 'Дрели',
      'grinders': 'Болгарки',
      'screwdrivers': 'Шуруповёрты',
      'hammers': 'Перфораторы',
      'jigsaws': 'Лобзики',
      'levels': 'Лазерные уровни',
      'генераторы': 'Генераторы',
      'measuring': 'Измерители'
    };
    
    // Если есть точное совпадение в маппинге, возвращаем его
    if (idMap[categoryId]) {
      return idMap[categoryId];
    }
    
    // Если нет точного совпадения, ищем по частичному совпадению
    const foundCategory = categories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      return foundCategory.name;
    }
    
    // Если ничего не найдено, возвращаем ID как есть
    return categoryId;
  };

  // Статические категории для fallback
  const staticCategories = [
    { id: 'drills', name: 'Дрели' },
    { id: 'grinders', name: 'Болгарки' },
    { id: 'screwdrivers', name: 'Шуруповёрты' },
    { id: 'hammers', name: 'Перфораторы' },
    { id: 'jigsaws', name: 'Лобзики' },
    { id: 'levels', name: 'Лазерные уровни' },
    { id: 'generators', name: 'Генераторы' },
    { id: 'measuring', name: 'Измерители' }
  ];

  const API_URL = 'https://electro-1-vjdu.onrender.com/api/products';

  // Загрузка товаров с кэшированием
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchWithCache(API_URL, {}, 10 * 60 * 1000) // Кэш на 10 минут
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  }, []);

  // Отслеживаем просмотр страницы категории
  useEffect(() => {
    trackPageView(`category_${category}`);
  }, [category]);

  // Извлечение категорий из товаров
  useEffect(() => {
    if (products.length > 0) {
      setCategoriesLoading(true);
      
      // Извлекаем уникальные категории из товаров, нормализуем и сортируем их
      const categoryMap = new Map();
      
      products.forEach(product => {
        if (product.category) {
          // Нормализуем название категории: убираем лишние пробелы и приводим к нижнему регистру
          const normalizedCategory = product.category.trim().toLowerCase().replace(/\s+/g, ' ');
          const originalCategory = product.category.trim();
          
          // Если такой нормализованной категории еще нет, добавляем её
          if (!categoryMap.has(normalizedCategory)) {
            categoryMap.set(normalizedCategory, originalCategory);
          }
        }
      });
      
      const uniqueCategories = Array.from(categoryMap.values()).sort();
      
      if (uniqueCategories.length > 0) {
        const realCategories = uniqueCategories.map(category => ({
          id: categoryToId(category),
          name: category
        }));
        setCategories(realCategories);
      } else {
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

  // Фильтруем товары по категории
  const filteredProducts = products.filter(product => {
    if (!product.category) return false;
    const productCategoryId = categoryToId(product.category.trim());
    return productCategoryId === category;
  });

  // Пагинация
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Сброс на первую страницу при смене категории
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Получаем название категории для отображения
  const getCategoryDisplayName = () => {
    return idToCategory(category);
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
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link
                      to={`/catalog/${cat.id}`}
                      className={`sidebar-category-btn${cat.id === category ? ' active' : ''}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <div className="catalog-content">
            <h1 className="catalog-title" style={{textAlign: 'left', marginLeft: 0}}>
              {categoriesLoading 
                ? 'Каталог товаров' 
                : getCategoryDisplayName()
              }
            </h1>
            {loading ? (
              <div style={{padding: 32}}>Загрузка...</div>
            ) : error ? (
              <div style={{color: 'red', padding: 32}}>{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{padding: 32, textAlign: 'center', color: '#666'}}>
                <h2>Товары не найдены</h2>
                <p>В данной категории пока нет товаров.</p>
                <Link to="/catalog" style={{ color: '#007bff', textDecoration: 'none' }}>
                  ← Вернуться в каталог
                </Link>
          </div>
            ) : (
              <div className="catalog-products-grid" style={{gap: 0}}>
                {currentProducts.map(product => (
                  <Link
                    to={`/product/${product._id}`}
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
                      <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 8px auto', alignSelf:'center'}}></div>
                      <div className="product-info" style={{padding: '6px 8px 3px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: '80px'}}>
                        <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '20px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                        <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                          <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                        <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                          <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{product.price ? formatTenge(product.price) + ' ₸' : ''}</span>
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category; 