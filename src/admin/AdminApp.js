import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './Login';
import AdminProductList from './ProductList';
import SiteSettings from './SiteSettings';

const AdminApp = () => {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem('admin_token');

  const handleLogin = () => {
    localStorage.setItem('admin_token', 'admin');
    navigate('/admin/products');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
      <Route path="/products" element={isAuth ? <AdminProductList onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/settings" element={isAuth ? <SiteSettings onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/products" />} />
      <Route path="*" element={<Navigate to="/products" />} />
    </Routes>
  );
};

export default AdminApp; 