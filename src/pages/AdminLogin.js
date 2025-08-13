import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Простая проверка (в реальном проекте здесь должен быть API)
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Неверные учетные данные');
      }
    } catch (err) {
      setError('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const goToAnalytics = () => {
    navigate('/analytics');
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Админ-панель</h1>
          <p>Войдите для доступа к управлению</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Введите логин"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Введите пароль"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="quick-access">
            <h3>Быстрый доступ</h3>
            <button 
              onClick={goToAnalytics}
              className="analytics-btn"
            >
              📊 Открыть аналитику
            </button>
            <p className="note">
              Для просмотра аналитики не требуется авторизация
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
