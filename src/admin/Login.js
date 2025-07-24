import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Примитивная проверка (логин: admin, пароль: 1234)
    if (login === 'admin' && password === '1234') {
      localStorage.setItem('admin_token', 'admin');
      navigate('/admin/products');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div style={{maxWidth: 340, margin: '80px auto', background: '#fff', border: '1.5px solid #bdbdbd', borderRadius: 10, padding: 32, boxShadow: '0 4px 18px rgba(30,40,90,0.06)'}}>
      <h2 style={{textAlign: 'center', marginBottom: 24}}>Вход в админ-панель</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: 18}}>
          <input type="text" placeholder="Логин" value={login} onChange={e=>setLogin(e.target.value)} style={{width: '100%', padding: 10, border: '1px solid #bdbdbd', borderRadius: 6, fontSize: 16}} />
        </div>
        <div style={{marginBottom: 18}}>
          <input type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} style={{width: '100%', padding: 10, border: '1px solid #bdbdbd', borderRadius: 6, fontSize: 16}} />
        </div>
        {error && <div style={{color: 'red', marginBottom: 12, textAlign: 'center'}}>{error}</div>}
        <button type="submit" style={{width: '100%', background: '#FF6B00', color: '#fff', fontSize: 18, fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 0', cursor: 'pointer'}}>Войти</button>
      </form>
    </div>
  );
};

export default AdminLogin; 