import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackPhoneClick } from '../utils/analytics';
import '../styles/Footer.css';

const Footer = () => {
  const location = useLocation();
  const [siteSettings, setSiteSettings] = useState({
    city: 'Алматы',
    contactInfo: {
      phone: '+7 707 517 73 85',
      email: 'info@eltok.kz',
      address: 'Аймусина 1в'
    },
    companyInfo: {
      name: 'ТОО «Eltok.kz»',
      bin: '123456789000',
      iik: 'KZ123456789',
      kbe: '17'
    }
  });

  // Загружаем информацию сайта при монтировании и изменении роута
  useEffect(() => {
    fetch('/api/information')
      .then(res => res.json())
      .then(data => {
        if (data.information) {
          console.log('Footer: Загруженные данные из БД:', data.information);
          setSiteSettings(data.information);
        }
      })
      .catch(error => {
        console.log('Ошибка загрузки информации в Footer, используются значения по умолчанию:', error);
      });
  }, [location.pathname]);
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h4>Реквизиты</h4>
          <ul>
            <li>{siteSettings.companyInfo.name}</li>
            <li>БИН: {siteSettings.companyInfo.bin}</li>
            <li>Юр. адрес: {siteSettings.city || 'Алматы'}</li>
            <li>КБЕ: {siteSettings.companyInfo.kbe}, ИИК: {siteSettings.companyInfo.iik}</li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Контакты</h4>
          <ul>
            <li>
              <img src="/icons/telephone.svg" alt="Телефон" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              <a 
                href={`tel:${siteSettings.contactInfo.phone.replace(/\s/g, '')}`} 
                style={{color: 'inherit', textDecoration: 'none'}}
                onClick={() => trackPhoneClick(siteSettings.contactInfo.phone, 'footer')}
              >
                {siteSettings.contactInfo.phone}
              </a>
            </li>
            <li>
              ✉ <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteSettings.contactInfo.email}`} style={{color: 'inherit', textDecoration: 'none'}} target="_blank" rel="noopener noreferrer">
                {siteSettings.contactInfo.email}
              </a>
            </li>
            <li>
              <img src="/icons/map.svg" alt="Адрес" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              {siteSettings.contactInfo?.address || 'Аймусина 1в'}
            </li>
            <li>
              <img src="/icons/clock.svg" alt="Часы" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              {siteSettings.workingHours || 'Пн-Пт: 9:00-18:00'}
            </li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Политика</h4>
          <ul>
            <li><Link to="/policy">Политика конфиденциальности</Link></li>
            <li><Link to="/policy">Условия использования</Link></li>
            <li><Link to="/policy">Условия доставки</Link></li>
            <li><Link to="/policy">Способы оплаты</Link></li>
            {/* Social links removed by request */}
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Доставка и оплата</h4>
          <ul>
            <li>
              <img src="/icons/truck.svg" alt="Доставка" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              {siteSettings.deliveryInfo?.freeDelivery || 'Доставка по Алматы'}
            </li>
            <li>
              <img src="/icons/box.svg" alt="Самовывоз" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              Самовывоз: {siteSettings.deliveryInfo?.pickupAddress || 'ул. Толе би 216Б'}
            </li>
            <li>
              <img src="/icons/card.svg" alt="Оплата" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              {siteSettings.paymentMethods || 'Kaspi, Visa, наличные'}
            </li>
            <li>
              <img src="/icons/lightning.svg" alt="Быстро" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} />
              {siteSettings.deliveryInfo?.deliveryNote || 'Быстрая обработка заказов'}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2020-{new Date().getFullYear()} {siteSettings.companyInfo.name}. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer; 