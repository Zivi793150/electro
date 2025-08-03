import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AdminLogin from './Login';
import AdminProductList from './ProductList';
import SiteSettings from './SiteSettings';
import { isAdminAuthenticated, setAdminToken, removeAdminToken } from '../utils/auth';
import { testAdminSecurity } from '../utils/securityTest';

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
    <Routes>
      <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
      <Route path="/products" element={isAuth ? <AdminProductList onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/settings" element={isAuth ? <SiteSettings onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/" element={isAuth ? <Navigate to="/products" /> : <Navigate to="/login" />} />
      <Route path="*" element={isAuth ? <Navigate to="/products" /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AdminApp; 