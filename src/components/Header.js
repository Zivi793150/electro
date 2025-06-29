import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import { FiInstagram } from 'react-icons/fi';
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

const SocialIcon = ({children, href, label}) => (
  <a href={href} className="top-bar-link social-circle" aria-label={label} target="_blank" rel="noopener noreferrer">{children}</a>
);

const Header = () => {
  return (
    <>
      {/* Мини-шапка */}
      <div className="top-bar" style={{fontFamily: 'Advaken Sans, Arial, sans-serif'}}>
        <div className="container top-bar-container">
        <div className="top-bar-left">
            <span className="top-bar-icon">📞</span>
            <span className="top-bar-text">+7 (777) 777-77-77</span>
            <span className="top-bar-divider" />
            <span className="top-bar-icon">📍</span>
            <span className="top-bar-text">Алматы</span>
            <span className="top-bar-divider" />
            <span className="top-bar-icon">✉️</span>
            <span className="top-bar-text">info@tankertools.kz</span>
        </div>
        <div className="top-bar-right">
            <SocialIcon href="#" label="Instagram"><FiInstagram size={20} /></SocialIcon>
            <SocialIcon href="#" label="WhatsApp"><FaWhatsapp size={20} /></SocialIcon>
            <SocialIcon href="#" label="Telegram"><FaTelegramPlane size={20} /></SocialIcon>
          </div>
        </div>
      </div>

      {/* Основная шапка */}
      <header className="header" style={{fontFamily: 'Advaken Sans, Arial, sans-serif'}}>
        <div className="container header-container">
        <div className="logo">
          <Link to="/">
              <span className="logo-icon">🛠️</span>
              <span className="logo-text"><strong>TANKER</strong></span>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
          <Link to="/cooperation">Сотрудничество</Link>
          <Link to="/about">О компании</Link>
          <Link to="/contacts">Контакты</Link>
        </nav>
        </div>
      </header>
    </>
  );
};

export default Header; 