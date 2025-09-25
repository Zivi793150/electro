import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Checkout from './pages/Checkout';
import AdminApp from './admin/AdminApp';
import FloatingButtons from './components/FloatingButtons';
import { initPageTracking } from './utils/analytics';

// Lazy loading для всех страниц
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const About = lazy(() => import('./pages/About'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Thanks = lazy(() => import('./pages/Thanks'));
const Policy = lazy(() => import('./pages/Policy'));
const Cooperation = lazy(() => import('./pages/Cooperation'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fallback компонент для загрузки
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Загрузка...
  </div>
);

function App() {
  useEffect(() => {
    // Инициализируем отслеживание аналитики
    initPageTracking();
  }, []);

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:category" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/cooperation" element={<Cooperation />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <FloatingButtons />
      </div>
    </Router>
  );
}

export default App;
