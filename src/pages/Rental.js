import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatTenge } from '../utils/price';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RentalConsentModal from '../components/RentalConsentModal';
import Modal from '../components/Modal';
import { trackPageView } from '../utils/analytics';
import { fetchWithCache } from '../utils/cache';
import '../styles/Catalog.css';
import '../styles/Rental.css';

const Rental = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getOptimalImage = (product, preferredSize = 'medium') => {
    if (product.productGroup && product.productGroup.coverImage) {
      return product.productGroup.coverImage;
    }
    if (product.imageVariants && product.imageVariants[preferredSize]) {
      return product.imageVariants[preferredSize];
    }
    if (product.imageVariants && product.imageVariants.webp) {
      return product.imageVariants.webp;
    }
    return product.image || '/images/products/placeholder.png';
  };

  const categoryToId = (categoryName) => {
    const categoryMap = {
      'дрели': 'drills',
      'болгарки': 'bolgarki',
      'шуруповёрты': 'screwdrivers',
      'перфораторы': 'hammers',
      'лобзики': 'jigsaws',
      'лазерные уровни': 'levels',
      'генераторы': 'generators',
      'насосы': 'nasosy',
      'измерители': 'measuring',
    };
    const normalizedName = categoryName.toLowerCase().trim().replace(/\\s+/g, ' ');
    return categoryMap[normalizedName] || normalizedName.replace(/[^a-z0-9]/g, '-');
  };

  const idToCategory = (categoryId) => {
    const idMap = {
      'drills': 'Дрели',
      'bolgarki': 'Болгарки',
      'screwdrivers': 'Шуруповёрты',
      'hammers': 'Перфораторы',
      'jigsaws': 'Лобзики',
      'levels': 'Лазерные уровни',
      'generators': 'Генераторы',
      'nasosy': 'Насосы',
      'measuring': 'Измерители',
    };
    if (idMap[categoryId]) {
      return idMap[categoryId];
    }
    const foundCategory = categories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      return foundCategory.name;
    }
    return categoryId;
  };

  const staticCategories = [
    { id: 'drills', name: 'Дрели' },
    { id: 'bolgarki', name: 'Болгарки' },
    { id: 'screwdrivers', name: 'Шуруповёрты' },
    { id: 'hammers', name: 'Перфораторы' },
    { id: 'jigsaws', name: 'Лобзики' },
    { id: 'levels', name: 'Лазерные уровни' },
    { id: 'generators', name: 'Генераторы' },
    { id: 'nasosy', name: 'Насосы' },
    { id: 'measuring', name: 'Измерители' },
  ];

  const API_URL = 'https://electro-1-vjdu.onrender.com/api/products';

  const filteredProducts = category 
    ? products.filter(product => {
        // Фильтруем только товары, доступные для аренды
        if (!product.rentalAvailable) return false;
        
        if (product.categorySlug) {
          return product.categorySlug === category;
        }
        if (!product.category) return false;
        const productCategoryId = categoryToId(product.category.trim());
        return productCategoryId === category;
      })
    : products.filter(product => product.rentalAvailable);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchWithCache(API_URL, {}, 10 * 60 * 1000)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    trackPageView('rental');
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setCategoriesLoading(true);
      const categoryMap = new Map();
      
      // Фильтруем только товары, доступные для аренды
      const rentalProducts = products.filter(p => p.rentalAvailable);
      
      rentalProducts.forEach(product => {
        if (product.categorySlug && product.category) {
          const categorySlug = product.categorySlug.trim();
          const originalCategory = product.category.trim();
          if (!categoryMap.has(categorySlug)) {
            categoryMap.set(categorySlug, originalCategory);
          }
        }
      });
      
      const uniqueCategories = Array.from(categoryMap.entries()).map(([slug, name]) => ({
        id: slug,
        name: name
      })).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      
      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      } else {
        // Если нет категорий с арендой, показываем пустой список
        setCategories([]);
      }
      setCategoriesLoading(false);
    }
  }, [products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductDisplayName = (product) => {
    if (product.productGroup && product.productGroup.name) {
      return product.productGroup.name;
    }
    if (product.category) {
      return product.category;
    }
    return product.name;
  };

  const getCategoryDisplayName = () => {
    const foundCategory = categories.find(cat => cat.id === category);
    if (foundCategory) {
      return foundCategory.name;
    }
    return idToCategory(category);
  };

  const handleRentClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setIsConsentModalOpen(true);
  };

  const handleConsentAccept = () => {
    setIsConsentModalOpen(false);
    setIsContactModalOpen(true);
  };

  const handleContactModalClose = () => {
    setIsContactModalOpen(false);
    setSelectedProduct(null);
  };

  const handleContactModalSubmit = (formData) => {
    console.log('Rental request:', formData, selectedProduct);
  };

  return (
    <div className="catalog rental-page">
      <Header />
      <main className="catalog-main">
        <div className="container">
          <div className="catalog-content" style={{ maxWidth: '100%', margin: '0 auto' }}>
            <h1 className="catalog-title" style={{ textAlign: 'center' }}>
              {category ? getCategoryDisplayName() : 'Аренда инструмента'}
            </h1>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: '#666' }}>
                Загрузка товаров...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: '#e74c3c' }}>
                {error}
              </div>
            ) : currentProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: '#666' }}>
                В данной категории пока нет товаров
              </div>
            ) : (
              <>
                <div className="catalog-products-grid">
                  {currentProducts.map(product => (
                    <div key={product._id} className="product-card rental-card">
                      <div className="product-image">
                        <picture>
                          <source
                            srcSet={getOptimalImage(product, 'medium')}
                            type="image/webp"
                          />
                          <img
                            src={getOptimalImage(product, 'medium')}
                            alt={getProductDisplayName(product)}
                            loading="lazy"
                          />
                        </picture>
                      </div>
                      <div className="product-info">
                        <div className="product-name">{getProductDisplayName(product)}</div>
                      </div>
                      <div className="rental-footer">
                        <div className="product-price">
                          {product.rentalPrice ? formatTenge(product.rentalPrice) + ' ₸/сутки' : 'Цена по запросу'}
                        </div>
                        <span className="rental-divider"></span>
                        <button 
                          className="rental-btn"
                          onClick={(e) => handleRentClick(e, product)}
                        >
                          Аренда
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-arrow"
                    >
                      ←
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} style={{ padding: '0 4px', color: '#999' }}>
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-arrow"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      <RentalConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAccept={handleConsentAccept}
      />
      
      <Modal
        isOpen={isContactModalOpen}
        onClose={handleContactModalClose}
        onSubmit={handleContactModalSubmit}
        product={selectedProduct ? { id: selectedProduct._id, name: getProductDisplayName(selectedProduct) } : null}
      />
    </div>
  );
};

export default Rental;
