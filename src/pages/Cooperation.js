import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Product.css';

const Cooperation = () => (
  <div className="cooperation">
    <Header />
    <main className="product-main">
      <div className="product-specifications" style={{maxWidth: 900, margin: '0 auto 32px auto'}}>
        <h2>Сотрудничество и партнёрство</h2>
        <p style={{fontSize: '1.15rem', marginBottom: 24}}>
          Мы открыты к сотрудничеству с оптовыми и корпоративными клиентами, строительными компаниями, дилерами и поставщиками. 
          Предлагаем выгодные условия, индивидуальный подход и профессиональное сопровождение на всех этапах.
        </p>
        <ul style={{marginBottom: 24, paddingLeft: 24, fontSize: '1.08rem'}}>
          <li>Оптовые поставки электроинструментов по Казахстану</li>
          <li>Гибкая система скидок для постоянных клиентов</li>
          <li>Срочная комплектация и доставка под заказ</li>
          <li>Оформление договоров и все необходимые документы</li>
          <li>Персональный менеджер для корпоративных клиентов</li>
        </ul>
        <div style={{background:'#fff',borderRadius:12,padding:'18px 24px',boxShadow:'0 2px 8px rgba(30,40,90,0.07)',marginBottom:12}}>
          <strong>Хотите стать нашим партнёром?</strong><br/>
          Напишите нам на <a href="mailto:info@tankertools.kz" style={{color:'#1e88e5'}}>info@tankertools.kz</a> или позвоните <a href="tel:+77777777777" style={{color:'#1e88e5'}}>+7 (777) 777-77-77</a> — мы обсудим все детали!
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Cooperation; 