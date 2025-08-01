import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({
    city: 'Алматы',
    contactInfo: {
      phone: '+7 (777) 777-77-77',
      email: 'info@tankertools.kz',
      address: 'г. Алматы, Казахстан'
    },
    companyInfo: {
      name: 'ТОО "Танкер Тулс"',
      bin: '123456789000',
      iik: 'KZ123456789',
      kbe: '17'
    }
  });

  // Загружаем информацию сайта
  useEffect(() => {
    fetch('https://electro-a8bl.onrender.com/api/information')
      .then(res => res.json())
      .then(data => {
        if (data.information) {
          setSiteSettings(data.information);
        }
      })
      .catch(error => {
        console.log('Ошибка загрузки информации в Footer, используются значения по умолчанию:', error);
      });
  }, []);
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h4>Реквизиты</h4>
          <ul>
            <li>{siteSettings.companyInfo.name}</li>
            <li>БИН: {siteSettings.companyInfo.bin}</li>
            <li>Юр. адрес: {siteSettings.contactInfo.address}</li>
            <li>КБЕ: {siteSettings.companyInfo.kbe}, ИИК: {siteSettings.companyInfo.iik}</li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Контакты</h4>
          <ul>
            <li><img src="/icons/telephone.svg" alt="Телефон" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> {siteSettings.contactInfo.phone}</li>
            <li>✉ {siteSettings.contactInfo.email}</li>
            <li><img src="/icons/map.svg" alt="Адрес" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> {siteSettings.contactInfo.address}</li>
            <li><img src="/icons/clock.svg" alt="Часы" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Пн-Пт: 9:00-18:00</li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Политика</h4>
          <ul>
            <li><Link to="/policy">Политика конфиденциальности</Link></li>
            <li><Link to="/policy">Условия использования</Link></li>
            <li><Link to="/policy">Условия доставки</Link></li>
            <li><Link to="/policy">Способы оплаты</Link></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Доставка и оплата</h4>
          <ul>
            <li><img src="/icons/truck.svg" alt="Доставка" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Доставка по Алматы</li>
            <li><img src="/icons/box.svg" alt="Самовывоз" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Самовывоз</li>
            <li><img src="/icons/card.svg" alt="Оплата" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Kaspi, Visa, наличные</li>
            <li><img src="/icons/lightning.svg" alt="Быстро" width={16} height={16} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Быстрая обработка заказов</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 {siteSettings.companyInfo.name}. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer; 