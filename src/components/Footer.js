import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h4>Реквизиты</h4>
          <ul>
            <li>ТОО "Танкер Тулс"</li>
            <li>БИН: 123456789000</li>
            <li>Юр. адрес: г. Алматы, ул. Примерная 1</li>
            <li>КБЕ: 17, ИИК: KZ123456789</li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Контакты</h4>
          <ul>
            <li>📞 +7 (777) 777-77-77</li>
            <li>✉ info@tankertools.kz</li>
            <li>📍 г. Алматы, Казахстан</li>
            <li>🕒 Пн-Пт: 9:00-18:00</li>
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
            <li>🚚 Доставка по Алматы</li>
            <li>📦 Самовывоз</li>
            <li>💳 Kaspi, Visa, наличные</li>
            <li>⚡ Быстрая обработка заказов</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 ТОО "Танкер Тулс". Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer; 