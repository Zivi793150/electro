import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-united-bar">
        <nav className="main-nav" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400 }}>
          <Link to="/">Главная</Link>
          <span className="nav-sep" />
          <Link to="/catalog">Каталог</Link>
          <span className="nav-sep" />
          <Link to="/cooperation">Сотрудничество</Link>
          <span className="nav-sep" />
          <Link to="/about">О компании</Link>
          <span className="nav-sep" />
          <Link to="/contacts">Контакты</Link>
        </nav>
        <div className="header-right-blocks">
          <div className="header-right-col">
            <div className="top-bar-address">Алматы</div>
            <div className="top-bar-email">info@tankertools.kz</div>
          </div>
          <div className="header-right-col">
            <div className="top-bar-socials">
              <a href="#" className="top-bar-social" title="Instagram" target="_blank" rel="noopener noreferrer">
                <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} style={{display:'block'}} />
              </a>
              <a href="#" className="top-bar-social" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                <img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} style={{display:'block'}} />
              </a>
              <a href="#" className="top-bar-social" title="Telegram" target="_blank" rel="noopener noreferrer">
                <img src="/icons/telegram.svg" alt="Telegram" width={24} height={24} style={{display:'block'}} />
              </a>
              <a href="#" className="top-bar-social" title="TikTok" target="_blank" rel="noopener noreferrer">
                <img src="/icons/tictok.svg" alt="TikTok" width={24} height={24} style={{display:'block'}} />
              </a>
            </div>
            <div className="top-bar-phone">+7 (777) 777-77-77</div>
          </div>
        </div>
        </div>
      </header>
  );
};

export default Header; 