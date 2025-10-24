import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackSocialClick, trackPhoneClick } from '../utils/analytics';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Загружаем данные из localStorage или используем значения по умолчанию
  const getInitialSettings = () => {
    const cached = localStorage.getItem('siteSettings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Ошибка парсинга сохраненных настроек:', e);
      }
    }
    return {
      contactInfo: {
        phone: '+7 747 477 79 89',
        email: 'info@eltok.kz',
        address: 'Аймусина 1в'
      },
      city: 'Алматы'
    };
  };
  
  const [siteSettings, setSiteSettings] = useState(getInitialSettings);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Загружаем информацию сайта при монтировании компонента
  useEffect(() => {
    fetch('https://electro-1-vjdu.onrender.com/api/information')
      .then(res => res.json())
      .then(data => {
        if (data.information) {
          console.log('Header: Загруженные данные из БД:', data.information);
          setSiteSettings(data.information);
          // Сохраняем в localStorage для быстрого доступа при следующих загрузках
          localStorage.setItem('siteSettings', JSON.stringify(data.information));
        }
      })
      .catch(error => {
        console.log('Ошибка загрузки информации в Header, используются значения по умолчанию:', error);
      });
  }, []);

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
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Tanker Tools" className="logo-image" />
            </picture>
          </div>
        </div>
        
        {/* Mobile Title */}
        <div className="mobile-title">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img src="/logo.png" alt="Tanker Tools" className="mobile-logo-image" />
          </picture>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="main-nav desktop-nav">
          <Link to="/">Главная</Link>
          <span className="nav-sep" />
          <Link to="/catalog">Каталог</Link>
          <span className="nav-sep" />
          <Link to="/rental">Аренда</Link>
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
            <div className="top-bar-address">
              {siteSettings.contactInfo?.address || 'Аймусина 1в'}
            </div>
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteSettings.contactInfo.email}`} className="top-bar-email" target="_blank" rel="noopener noreferrer">
              {siteSettings.contactInfo.email}
            </a>
          </div>
          <div className="header-right-col">
            <div className="top-bar-socials">
              <a 
                href={`https://web.whatsapp.com/send?phone=${siteSettings.contactInfo.phone.replace(/\s/g, '')}`} 
                className="top-bar-social" 
                title="WhatsApp" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('WhatsApp', 'header_desktop', `https://web.whatsapp.com/send?phone=${siteSettings.contactInfo.phone.replace(/\s/g, '')}`)}
              >
                <img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} style={{display:'block'}} />
              </a>
              <a 
                href="https://www.instagram.com/eltok.kz_official" 
                className="top-bar-social" 
                title="Instagram" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('Instagram', 'header_desktop', 'https://www.instagram.com/eltok.kz_official')}
              >
                <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} style={{display:'block'}} />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61580230661013" 
                className="top-bar-social" 
                title="Facebook" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('Facebook', 'header_desktop', 'https://www.facebook.com/profile.php?id=61580230661013')}
              >
                <img src="/icons/facebook.svg" alt="Facebook" width={24} height={24} style={{display:'block'}} />
              </a>
              <a 
                href="https://www.tiktok.com/@eltok.kz" 
                className="top-bar-social" 
                title="TikTok" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('TikTok', 'header_desktop', 'https://www.tiktok.com/@eltok.kz')}
              >
                <img src="/icons/tictok.svg" alt="TikTok" width={24} height={24} style={{display:'block'}} />
              </a>
            </div>
            <a 
              href={`tel:${siteSettings.contactInfo.phone.replace(/\s/g, '')}`} 
              className="top-bar-phone"
              onClick={() => trackPhoneClick(siteSettings.contactInfo.phone, 'header_desktop')}
            >
              {siteSettings.contactInfo.phone}
            </a>
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
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img src="/logo.png" alt="Tanker Tools" className="mobile-logo-image" />
              </picture>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            <Link to="/" onClick={closeMenu}>Главная</Link>
            <Link to="/catalog" onClick={closeMenu}>Каталог</Link>
            <Link to="/rental" onClick={closeMenu}>Аренда</Link>
            <Link to="/cooperation" onClick={closeMenu}>Сотрудничество</Link>
            <Link to="/about" onClick={closeMenu}>О компании</Link>
            <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
          </nav>

          {/* Mobile Contact Info */}
          <div className="mobile-contacts">
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Адрес:</div>
              <div className="mobile-contact-value">
                {siteSettings.contactInfo?.address || 'Аймусина 1в'}
              </div>
            </div>
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Email:</div>
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteSettings.contactInfo.email}`} className="mobile-contact-value" target="_blank" rel="noopener noreferrer">
                {siteSettings.contactInfo.email}
              </a>
            </div>
            <div className="mobile-contact-item">
              <div className="mobile-contact-label">Телефон:</div>
              <a 
                href={`tel:${siteSettings.contactInfo.phone.replace(/\s/g, '')}`} 
                className="mobile-contact-value"
                onClick={() => trackPhoneClick(siteSettings.contactInfo.phone, 'header_mobile')}
              >
                {siteSettings.contactInfo.phone}
              </a>
            </div>
            <div className="mobile-socials">
              <a 
                href={`https://web.whatsapp.com/send?phone=${siteSettings.contactInfo.phone.replace(/\s/g, '')}`} 
                className="mobile-social" 
                title="WhatsApp" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('WhatsApp', 'header_mobile', `https://web.whatsapp.com/send?phone=${siteSettings.contactInfo.phone.replace(/\s/g, '')}`)}
              >
                <img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} />
              </a>
              <a 
                href="https://www.instagram.com/eltok.kz_official" 
                className="mobile-social" 
                title="Instagram" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('Instagram', 'header_mobile', 'https://www.instagram.com/eltok.kz_official')}
              >
                <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61580230661013" 
                className="mobile-social" 
                title="Facebook" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('Facebook', 'header_mobile', 'https://www.facebook.com/profile.php?id=61580230661013')}
              >
                <img src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
              </a>
              <a 
                href="https://www.tiktok.com/@eltok.kz" 
                className="mobile-social" 
                title="TikTok" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('TikTok', 'header_mobile', 'https://www.tiktok.com/@eltok.kz')}
              >
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