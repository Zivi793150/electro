import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <>
      {/* Мини-шапка */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span>📞 +7 (777) 777-77-77</span>
          <span>📍 Алматы</span>
          <span>✉ info@tankertools.kz</span>
        </div>
        <div className="top-bar-right">
          <span>🔗 Instagram</span>
          <span>WhatsApp</span>
          <span>Telegram</span>
        </div>
      </div>

      {/* Основная шапка с навигацией */}
      <header className="header">
        <div className="logo">
          <Link to="/">
            <strong>ТАНКЕР</strong>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
          <Link to="/about">О компании</Link>
          <Link to="/contacts">Контакты</Link>
          <Link to="/policy">Политика</Link>
        </nav>
      </header>
    </>
  );
};

export default Header; 