import React, { useState, useEffect } from 'react';
import { formatTenge } from '../utils/price';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { trackPageView } from '../utils/analytics';
import { fetchWithCache } from '../utils/cache';
import '../styles/Catalog.css';
import { Link, useLocation } from 'react-router-dom';

// fetchWithRetry не используется — удалено для тишины линтера

const Catalog = () => {
  // Функция для получения оптимального размера изображения
  const getOptimalImage = (product, preferredSize = 'medium') => {
    // Сначала проверяем обложку вариации, если товар является базовым для группы
    if (product.productGroup && product.productGroup.coverImage) {
      return product.productGroup.coverImage;
    }
    
    // Затем проверяем coverPhoto или обычное фото
    const mainImage = product.coverPhoto || product.image;
    
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return mainImage || '/images/products/placeholder.png';
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
      'генераторы для дома': 'generators',
      'дизельные генераторы': 'diesel-generators',
      'дизельные генератор': 'diesel-generators',
      'дизельный генератор': 'diesel-generators',
      'аргонно-дуговая сварка': 'argon-arc-welding',
      'бензиновый триммер': 'gasoline-trimmer',
      'глубинный насос': 'deep-pump',
      'отбойный молоток': 'jackhammer',
      'плазморезы': 'plasma-cutter',
      'редукционный клапан': 'reduction-valve',
      'сварочный аппарат': 'welding',
      'сварочный аппараты': 'welding',
      'струйный насос': 'jet-pump',
      'струйный самовсасывающий насос': 'jet-pump',
      'точильный станок': 'bench-grinder',
      'ударная дрель': 'impact-drill',
      'фекальный насос': 'fecal-pump',
      'периферийные насосы': 'peripheral-pump',
      'периферийный насос': 'peripheral-pump',
      'центробежные насосы': 'centrifugal-pump',
      'центробежный насос': 'centrifugal-pump',
      'измерители': 'measuring',
      'дрель': 'drills',
      'болгарка': 'grinders',
      'шуруповёрт': 'screwdrivers',
      'перфоратор': 'hammers',
      'лобзик': 'jigsaws',
      'лазерный уровень': 'levels',
      'генератор': 'generators',
      'измеритель': 'measuring',
      // Новые категории
      'гайковерт ударный': 'impact-wrench',
      'кусторезы': 'hedge-trimmers',
      'миксеры': 'mixers',
      'наборный электроинструмент': 'power-tool-sets',
      'ножовки': 'hacksaws',
      'пила': 'saws',
      'пила цепная': 'chainsaws',
      'полировальные машины': 'polishing-machines',
      'пчёлки': 'bees',
      'сабельная пила': 'reciprocating-saws',
      'секаторы': 'pruners',
      'фрезер': 'routers',
      'электрорубанок': 'electric-planers'
    };
    
    // Нормализуем название: убираем лишние пробелы, приводим к нижнему регистру
    const normalizedName = categoryName.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Сначала ищем точное совпадение
    if (categoryMap[normalizedName]) {
      return categoryMap[normalizedName];
    }
    
    // Спец-правило: любые варианты с "дизель" + "генератор"
    if (normalizedName.includes('дизель') && normalizedName.includes('генератор')) {
      return 'diesel-generators';
    }
    // Если точного совпадения нет, ищем по частичному совпадению, 
    // предпочитая более длинные (более специфичные) ключи
    const entriesByLength = Object.entries(categoryMap).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of entriesByLength) {
      if (normalizedName.includes(key)) {
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
      'generators': 'Генераторы',
      'diesel-generators': 'Дизельные генераторы',
      'argon-arc-welding': 'Аргонно-дуговая сварка',
      'gasoline-trimmer': 'Бензиновый триммер',
      'deep-pump': 'Глубинный насос',
      'jackhammer': 'Отбойный молоток',
      'plasma-cutter': 'Плазморезы',
      'reduction-valve': 'Редукционный клапан',
      'welding': 'Сварочные аппараты',
      'jet-pump': 'Струйный насос',
      'bench-grinder': 'Точильный станок',
      'impact-drill': 'Ударная дрель',
      'fecal-pump': 'Фекальный насос',
      'peripheral-pump': 'Периферийный насос',
      'centrifugal-pump': 'Центробежный насос',
      'measuring': 'Измерители',
      // Новые категории
      'impact-wrench': 'Гайковерт ударный',
      'hedge-trimmers': 'Кусторезы',
      'mixers': 'Миксеры',
      'power-tool-sets': 'Наборный электроинструмент',
      'hacksaws': 'Ножовки',
      'saws': 'Пила',
      'chainsaws': 'Пила цепная',
      'polishing-machines': 'Полировальные машины',
      'bees': 'Пчёлки',
      'reciprocating-saws': 'Сабельная пила',
      'pruners': 'Секаторы',
      'routers': 'Фрезер',
      'electric-planers': 'Электрорубанок'
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

  // Статические категории для fallback (без "Все товары")
  const staticCategories = [
    { id: 'drills', name: 'Дрели' },
    { id: 'grinders', name: 'Болгарки' },
    { id: 'screwdrivers', name: 'Шуруповёрты' },
    { id: 'hammers', name: 'Перфораторы' },
    { id: 'jigsaws', name: 'Лобзики' },
    { id: 'levels', name: 'Лазерные уровни' },
    { id: 'generators', name: 'Генераторы' },
    { id: 'diesel-generators', name: 'Дизельные генераторы' },
    { id: 'peripheral-pump', name: 'Периферийный насос' },
    { id: 'centrifugal-pump', name: 'Центробежный насос' },
    { id: 'measuring', name: 'Измерители' },
    // Новые категории
    { id: 'impact-wrench', name: 'Гайковерт ударный' },
    { id: 'hedge-trimmers', name: 'Кусторезы' },
    { id: 'mixers', name: 'Миксеры' },
    { id: 'power-tool-sets', name: 'Наборный электроинструмент' },
    { id: 'hacksaws', name: 'Ножовки' },
    { id: 'saws', name: 'Пила' },
    { id: 'chainsaws', name: 'Пила цепная' },
    { id: 'polishing-machines', name: 'Полировальные машины' },
    { id: 'bees', name: 'Пчёлки' },
    { id: 'reciprocating-saws', name: 'Сабельная пила' },
    { id: 'pruners', name: 'Секаторы' },
    { id: 'routers', name: 'Фрезер' },
    { id: 'electric-planers', name: 'Электрорубанок' }
  ];

  const location = useLocation();
  // На мобильных при переходе иногда сохраняется старая позиция — принудительно поднимаем наверх
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  const getCategoryFromQuery = () => {
    // Извлекаем категорию из URL пути
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'catalog') {
      return pathParts[2]; // Возвращаем название категории из URL
    }
    return null; // По умолчанию не выбрана категория - показываем все
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

  // Отслеживаем изменения URL для определения активной категории
  useEffect(() => {
    const categoryFromUrl = getCategoryFromQuery();
    setSelectedCategory(categoryFromUrl);
  }, [location.search, location.pathname]);

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

  // Отслеживаем просмотр страницы каталога
  useEffect(() => {
    trackPageView('catalog');
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
        // Убираем "Все товары" - показываем только реальные категории
        const realCategories = uniqueCategories.map(category => ({
          id: categoryToId(category),
          name: category
        }));
        setCategories(realCategories);
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

  // При загрузке /catalog показываем все товары, при выборе категории - фильтруем
  const filteredProducts = selectedCategory
    ? products.filter(product => {
        if (!product.category) return false;
        const productCategoryId = categoryToId(product.category.trim());
        return productCategoryId === selectedCategory;
      })
    : products;

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

  // Определяем целевую ссылку для карточки товара в каталоге
  const getCardLink = (product) => {
    // Ведём на категорию товара (как в мини-каталоге на главной)
    const catId = product && product.category ? categoryToId(String(product.category).trim()) : '';
    if (catId) return `/catalog/${catId}`;
    return `/catalog`; // Если категории нет, ведём в общий каталог
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
                    <Link
                      to={`/catalog/${category.id}`}
                      className={`sidebar-category-btn${selectedCategory === category.id ? ' active' : ''}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                    >
                      {category.name}
                    </Link>
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
                      : location.pathname === '/catalog'
                        ? 'Каталог товаров'
                        : selectedCategory 
                          ? idToCategory(selectedCategory) || 'Каталог товаров'
                          : 'Каталог товаров'
                    }
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isDropdownOpen && !categoriesLoading && (
                  <div className="category-dropdown-menu">
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/catalog/${category.id}`}
                        className={`category-dropdown-item${selectedCategory === category.id ? ' active' : ''}`}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Хлебные крошки как на странице продукта */}
            <nav className="breadcrumbs" style={{paddingBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
              <a href="/">Главная</a>
              <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
              <a href="/catalog">Каталог</a>
              {selectedCategory && (
                <>
                  <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
                  <span style={{color:'#1a2236', fontWeight:500}}>{idToCategory(selectedCategory)}</span>
                </>
              )}
            </nav>
            <h1 className="catalog-title" style={{textAlign: 'left', marginLeft: 0}}>
              {categoriesLoading 
                ? 'Каталог товаров' 
                : location.pathname === '/catalog'
                  ? 'Каталог товаров'
                  : selectedCategory 
                    ? idToCategory(selectedCategory) || 'Каталог товаров'
                    : 'Каталог товаров'
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
                  to={getCardLink(product)}
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
                    <div style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 12px auto', alignSelf:'center'}}></div>
                    <div className="product-info" style={{padding: '6px 8px 3px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: '80px'}}>
                      <span style={{fontSize: '0.9rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '20px', lineHeight: 1.2, marginBottom: 4, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                      <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                        <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                        <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{product.price ? formatTenge(product.price) + ' ₸' : ''}</span>
                        <span style={{display:'inline-block', margin:'0 10px', borderLeft:'2px solid #bdbdbd', height:'1.6em'}}></span>
                        <span style={{marginLeft:28, background:'#f5f7fa', color:'#222', border:'1px solid #e3e6ea', fontWeight:700, fontSize:'0.85rem', padding:'4px 12px', borderRadius:12, lineHeight:1, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>В наличии</span>
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

export default Catalog; 