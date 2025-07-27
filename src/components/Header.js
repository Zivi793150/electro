import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Блокируем скролл при открытом меню
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <header className="header">
      <div className="header-united-bar">
        {/* Desktop Logo */}
        <div className="header-logo desktop-logo">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">Tanker Tools</div>
          </div>
        </div>
        
        {/* Mobile Title */}
        <div className="mobile-title">
          <div className="mobile-title-text">Tanker Tools</div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="main-nav desktop-nav" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400 }}>
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

        {/* Desktop Contact Info */}
        <div className="header-right-blocks desktop-contacts">
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

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="mobile-title">
              <div className="mobile-title-text">Tanker Tools</div>
            </div>
            <button className="mobile-menu-close" onClick={closeMenu}>×</button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            <Link to="/" onClick={closeMenu}>Главная</Link>
            <Link to="/catalog" onClick={closeMenu}>Каталог</Link>
            <Link to="/cooperation" onClick={closeMenu}>Сотрудничество</Link>
            <Link to="/about" onClick={closeMenu}>О компании</Link>
            <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
          </nav>

          {/* Mobile Contact Info */}
          <div className="mobile-contacts">
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Город:</div>
              <div className="mobile-contact-value">Алматы</div>
            </div>
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Email:</div>
              <div className="mobile-contact-value">info@tankertools.kz</div>
            </div>
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Телефон:</div>
              <div className="mobile-contact-value">+7 (777) 777-77-77</div>
            </div>
            <div className="mobile-socials">
              <a href="#" className="mobile-social" title="Instagram" target="_blank" rel="noopener noreferrer">
                <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
              </a>
              <a href="#" className="mobile-social" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                <img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} />
              </a>
              <a href="#" className="mobile-social" title="Telegram" target="_blank" rel="noopener noreferrer">
                <img src="/icons/telegram.svg" alt="Telegram" width={24} height={24} />
              </a>
              <a href="#" className="mobile-social" title="TikTok" target="_blank" rel="noopener noreferrer">
                <img src="/icons/tictok.svg" alt="TikTok" width={24} height={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 