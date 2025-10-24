import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { trackSocialClick, trackPhoneClick } from '../utils/analytics';
import '../styles/Contacts.css';

const Contacts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [mapLoaded, setMapLoaded] = useState(false); // Не используется в текущей реализации

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = () => {};
  const handleSocialClick = (platform) => {
    const urls = {
      WhatsApp: `https://wa.me/${'+77075177385'.replace(/\\s/g, '')}`,
      Instagram: 'https://www.instagram.com/eltok.kz_official',
      Facebook: 'https://www.facebook.com/profile.php?id=61580230661013',
      TikTok: 'https://www.tiktok.com/@eltok.kz'
    };
    const url = urls[platform];
    if (url) {
      trackSocialClick(platform, 'contacts_page', url);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    // Улучшенная загрузка карты с несколькими вариантами
    const loadInteractiveMap = () => {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        // Создаем контейнер с несколькими вариантами карт
        mapContainer.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            position: relative;
            border-radius: 8px;
            overflow: hidden;
          ">
            <!-- Основная карта 2GIS -->
            <div id="main-map" style="width: 100%; height: 100%; position: relative;">
              <iframe
                src="https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A43.233801%2C%22lon%22%3A76.816602%7D%2C%22zoom%22%3A17%2C%22city%22%3A%22almaty%22%7D"
                width="100%"
                height="100%"
                style="border: 0; border-radius: 8px;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Карта офиса Танкер Тулс - Аймусин улица, 1в"
              ></iframe>
            </div>
            
            <!-- Панель управления картой -->
            <div style="
              position: absolute;
              top: 10px;
              right: 10px;
              background: rgba(255,255,255,0.95);
              border-radius: 8px;
              padding: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              display: flex;
              gap: 5px;
              z-index: 1000;
            ">
              <button 
                onclick="switchTo2GIS()" 
                style="
                  padding: 6px 12px;
                  border: 1px solid #ddd;
                  background: #2E7D32;
                  color: white;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.3s;
                "
                onmouseover="this.style.background='#1B5E20'"
                onmouseout="this.style.background='#2E7D32'"
              >
                2GIS
              </button>
              <button 
                onclick="switchToGoogle()" 
                style="
                  padding: 6px 12px;
                  border: 1px solid #ddd;
                  background: #1976D2;
                  color: white;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.3s;
                "
                onmouseover="this.style.background='#1565C0'"
                onmouseout="this.style.background='#1976D2'"
              >
                Google
              </button>
              <button 
                onclick="openInNewWindow()" 
                style="
                  padding: 6px 12px;
                  border: 1px solid #ddd;
                  background: #FF9800;
                  color: white;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.3s;
                "
                onmouseover="this.style.background='#F57C00'"
                onmouseout="this.style.background='#FF9800'"
              >
                🔗
              </button>
            </div>
            
            <!-- Информационная панель -->
            <div style="
              position: absolute;
              bottom: 10px;
              left: 10px;
              background: rgba(255,255,255,0.95);
              border-radius: 8px;
              padding: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 300px;
              z-index: 1000;
            ">
              <div style="font-weight: bold; margin-bottom: 5px; color: #333;">
                📍 Танкер Тулс
              </div>
              <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                г. Алматы, ул. Аймусин 1в
              </div>
              <div style="font-size: 12px; color: #888;">
                Координаты: 43.233801, 76.816602
              </div>
            </div>
          </div>
        `;
        
        // Добавляем функции переключения карт
        window.switchTo2GIS = () => {
          const mainMap = document.getElementById('main-map');
          if (mainMap) {
            mainMap.innerHTML = `
              <iframe
                src="https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A43.233801%2C%22lon%22%3A76.816602%7D%2C%22zoom%22%3A17%2C%22city%22%3A%22almaty%22%7D"
                width="100%"
                height="100%"
                style="border: 0; border-radius: 8px;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Карта офиса Танкер Тулс - Аймусин улица, 1в"
              ></iframe>
            `;
          }
        };
        
        window.switchToGoogle = () => {
          const mainMap = document.getElementById('main-map');
          if (mainMap) {
            mainMap.innerHTML = `
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.123456789!2d76.816602!3d43.233801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE0JzAxLjciTiA3NsKwNDknMDAuMCJF!5e0!3m2!1sru!2skz!4v1234567890123!5m2!1sru!2skz"
                width="100%"
                height="100%"
                style="border: 0; border-radius: 8px;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Карта офиса Танкер Тулс - Google Maps"
              ></iframe>
            `;
          }
        };
        
        window.openInNewWindow = () => {
          // Открываем в новом окне с выбором карты
          const choice = window.confirm('Выберите карту:\nOK - 2GIS\nОтмена - Google Maps');
          if (choice) {
            window.open('https://2gis.kz/almaty/search/43.233801%2C76.816602', '_blank');
          } else {
            window.open('https://www.google.com/maps?q=43.233801,76.816602', '_blank');
          }
        };
      }
    };

    // Загружаем улучшенную интерактивную карту
    loadInteractiveMap();
    
    // Если карта не загрузится, создаем fallback через 5 секунд
    const fallbackTimer = setTimeout(() => {
      const mapContainer = document.getElementById('map-container');
      const mainMap = document.getElementById('main-map');
      
      if (mapContainer && mainMap) {
        // Проверяем, загрузился ли iframe
        const iframe = mainMap.querySelector('iframe');
        if (iframe) {
          iframe.onerror = () => {
            createFallbackMap();
          };
          
          // Дополнительная проверка через 3 секунды
          setTimeout(() => {
            if (mainMap.innerHTML.includes('iframe')) {
              createFallbackMap();
            }
          }, 3000);
        }
      }
    }, 5000);

    const createFallbackMap = () => {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          ">
            <!-- Анимированный фон -->
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
              opacity: 0.3;
            "></div>
            
            <div style="
              background: rgba(255,255,255,0.95);
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 450px;
              margin: 20px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.2);
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #2E7D32, #4CAF50);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 24px;
                box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
              ">
                📍
              </div>
              
              <h3 style="margin-bottom: 15px; color: #333; font-size: 20px; font-weight: 600;">
                Танкер Тулс
              </h3>
              <p style="margin-bottom: 25px; color: #666; line-height: 1.6; font-size: 16px;">
                г. Алматы, ул. Аймусин 1в
              </p>
              
              <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                <a 
                  href="https://2gis.kz/almaty/search/43.233801%2C76.816602" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #2E7D32, #4CAF50);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
                  "
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46, 125, 50, 0.4)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(46, 125, 50, 0.3)'"
                >
                  🗺️ 2GIS
                </a>
                <a 
                  href="https://www.google.com/maps?q=43.233801,76.816602" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #1976D2, #42A5F5);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
                  "
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(25, 118, 210, 0.4)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(25, 118, 210, 0.3)'"
                >
                  🗺️ Google Maps
                </a>
              </div>
              
              <div style="
                background: rgba(0,0,0,0.05);
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                color: #666;
                border-left: 3px solid #2E7D32;
              ">
                <strong>Координаты:</strong> 43.233801, 76.816602<br>
                <strong>Статус:</strong> Карта временно недоступна
              </div>
            </div>
            
            <!-- Декоративные элементы -->
            <div style="
              position: absolute;
              top: 20px;
              right: 20px;
              width: 100px;
              height: 100px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
              animation: float 6s ease-in-out infinite;
            "></div>
            <div style="
              position: absolute;
              bottom: 20px;
              left: 20px;
              width: 60px;
              height: 60px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
              animation: float 4s ease-in-out infinite reverse;
            "></div>
            
            <style>
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            </style>
          </div>
        `;
      }
    };

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className="contacts">
      <Header />
      <main className="contacts-main">
        <div className="container">
          <h1 className="contacts-title">Контакты</h1>
          <div className="contacts-content">
            <div className="contacts-grid">
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/telephone.svg" alt="Телефон" width={24} height={24} loading="lazy" /></span><span>Телефоны</span></div>
                <div className="contact-card-content">
                  <a 
                    href="tel:+77075177385" 
                    style={{color: 'inherit', textDecoration: 'none'}}
                    onClick={() => trackPhoneClick('+7 707 517 73 85', 'contacts_page')}
                  >
                    +7 707 517 73 85
                  </a>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon">✉</span><span>Email</span></div>
                <div className="contact-card-content">info@eltok.kz<br />sales@eltok.kz</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/map.svg" alt="Адрес" width={24} height={24} loading="lazy" /></span><span>Адрес</span></div>
                <div className="contact-card-content">г. Алматы, ул. Аймусин 1в</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/clock.svg" alt="Часы" width={24} height={24} loading="lazy" /></span><span>Режим работы</span></div>
                <div className="contact-card-content">Пн-Пт: 9:00 - 18:00<br />Сб: 10:00 - 16:00</div>
              </div>
            </div>
            <div className="contact-form">
              <h2>Напишите нам</h2>
              <p>Оставьте сообщение, и мы свяжемся с вами в ближайшее время</p>
              <button className="btn-contact-form" onClick={handleOpenModal}>Отправить сообщение</button>
              <div className="social-links">
                <h3>Мы в социальных сетях</h3>
                <div className="social-grid">
                  <button className="social-link" onClick={() => handleSocialClick('WhatsApp')}><span className="social-icon"><img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} loading="lazy" /></span><span>WhatsApp</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('Instagram')}><span className="social-icon"><img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} loading="lazy" /></span><span>Instagram</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('Facebook')}><span className="social-icon">📘</span><span>Facebook</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('TikTok')}><span className="social-icon"><img src="/icons/tictok.svg" alt="TikTok" width={24} height={24} loading="lazy" /></span><span>TikTok</span></button>
                </div>
              </div>
            </div>
          </div>
          <section className="map-section">
            <h2>Как нас найти - Аймусин улица, 1в</h2>
            <div className="map-container">
              <div 
                id="map-container" 
                style={{ 
                  width: '100%', 
                  height: '450px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              ></div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} />
    </div>
  );
};

export default Contacts; 