import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import { FiInstagram } from 'react-icons/fi';
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const SocialIcon = ({children, href, label}) => (
  <a href={href} className="top-bar-link social-circle" aria-label={label} target="_blank" rel="noopener noreferrer">{children}</a>
);

const Header = () => {
  return (
    <header className="header">
      <div className="header-united-bar">
        <div className="header-logo">
          <Link to="/">
            <span className="logo-icon" style={{fontSize:'2.7rem', marginRight:8}}>🛠️</span>
            <span className="logo-text">TANKER</span>
          </Link>
        </div>
        <nav className="main-nav">
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
                <FiInstagram size={18} />
              </a>
              <a href="#" className="top-bar-social" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={18} />
              </a>
              <a href="#" className="top-bar-social" title="Telegram" target="_blank" rel="noopener noreferrer">
                <FaTelegramPlane size={18} />
              </a>
              <a href="#" className="top-bar-social" title="TikTok" target="_blank" rel="noopener noreferrer">
                <SiTiktok size={18} />
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