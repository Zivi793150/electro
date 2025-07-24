import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './Login';
import AdminProductList from './ProductList';

const AdminApp = () => {
  const isAuth = !!localStorage.getItem('admin_token');
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/products" element={isAuth ? <AdminProductList /> : <Navigate to="/admin/login" />} />
      <Route path="*" element={<Navigate to="/admin/products" />} />
    </Routes>
  );
};

export default AdminApp; 