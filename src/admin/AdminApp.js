import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated, setAdminToken, removeAdminToken } from '../utils/auth';
import { testAdminSecurity } from '../utils/securityTest';
import '../styles/Admin.css';

// Lazy loading для админских компонентов
const AdminLogin = lazy(() => import('./Login'));
const AdminProductList = lazy(() => import('./ProductList'));
const SiteSettings = lazy(() => import('./SiteSettings'));
const PickupPoints = lazy(() => import('./PickupPoints'));
const ProductGroups = lazy(() => import('./ProductGroups'));

const AdminApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = isAdminAuthenticated();

  // Дополнительная защита - редирект на логин если не авторизован
  useEffect(() => {
    if (!isAuth && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [isAuth, location.pathname, navigate]);

  // Тестирование безопасности (удалить в продакшене)
  useEffect(() => {
    testAdminSecurity();
  }, []);

  const handleLogin = () => {
    setAdminToken('admin');
    navigate('/admin/products');
  };

  const handleLogout = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка админки...</div>}>
      <Routes>
        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route path="/products" element={isAuth ? <AdminProductList onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuth ? <SiteSettings onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/pickup-points" element={isAuth ? <PickupPoints onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/product-groups" element={isAuth ? <ProductGroups onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuth ? <Navigate to="/products" /> : <Navigate to="/login" />} />
        <Route path="*" element={isAuth ? <Navigate to="/products" /> : <Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AdminApp; 