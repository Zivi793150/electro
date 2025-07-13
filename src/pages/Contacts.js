import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Contacts.css';

const Contacts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = () => {
    alert('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
  };
  const handleSocialClick = (platform) => {
    alert(`Переход в ${platform}`);
  };

  return (
    <div className="contacts">
      <Header />
      <main className="contacts-main">
        <div className="container">
          <h1 className="contacts-title">Контакты</h1>
          <div className="contacts-content">
            <div className="contacts-grid">
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/telephone.svg" alt="Телефон" width={24} height={24} /></span><span>Телефоны</span></div>
                <div className="contact-card-content">+7 (777) 777-77-77<br />+7 (727) 777-77-77</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon">✉</span><span>Email</span></div>
                <div className="contact-card-content">info@tankertools.kz<br />sales@tankertools.kz</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/map.svg" alt="Адрес" width={24} height={24} /></span><span>Адрес</span></div>
                <div className="contact-card-content">г. Алматы, ул. Примерная 1<br />Бизнес-центр "Танкер", офис 205</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-header"><span className="contact-card-icon"><img src="/icons/clock.svg" alt="Часы" width={24} height={24} /></span><span>Режим работы</span></div>
                <div className="contact-card-content">Пн-Пт: 9:00 - 18:00<br />Сб: 10:00 - 16:00<br />Вс: выходной</div>
              </div>
            </div>
            <div className="contact-form">
              <h2>Напишите нам</h2>
              <p>Оставьте сообщение, и мы свяжемся с вами в ближайшее время</p>
              <button className="btn-contact-form" onClick={handleOpenModal}>Отправить сообщение</button>
              <div className="social-links">
                <h3>Мы в социальных сетях</h3>
                <div className="social-grid">
                  <button className="social-link" onClick={() => handleSocialClick('WhatsApp')}><span className="social-icon"><img src="/icons/whatsapp-whats-app.svg" alt="WhatsApp" width={24} height={24} /></span><span>WhatsApp</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('Telegram')}><span className="social-icon"><img src="/icons/telegram.svg" alt="Telegram" width={24} height={24} /></span><span>Telegram</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('Instagram')}><span className="social-icon"><img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} /></span><span>Instagram</span></button>
                  <button className="social-link" onClick={() => handleSocialClick('Facebook')}><span className="social-icon">📘</span><span>Facebook</span></button>
                </div>
              </div>
            </div>
          </div>
          <section className="map-section">
            <h2>Как нас найти</h2>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.1234567890123!2d76.91234567890123!3d43.21234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDEyJzQ1LjAiTiA3NsKwNTQnNDUuMCJF!5e0!3m2!1sru!2skz!4v1234567890123"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Карта офиса Танкер Тулс"
              ></iframe>
            </div>
          </section>
          <section className="additional-info">
            <div className="info-grid">
              <div className="info-item"><h3><img src="/icons/truck.svg" alt="Доставка" width={24} height={24} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Доставка</h3><p>Бесплатная доставка по Алматы при заказе от 50 000 ₸</p></div>
              <div className="info-item"><h3><img src="/icons/wrench.svg" alt="Сервис" width={24} height={24} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Сервис</h3><p>Техническое обслуживание и ремонт электроинструментов</p></div>
              <div className="info-item"><h3><img src="/icons/checklist.svg" alt="Тендеры" width={24} height={24} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Тендеры</h3><p>Участие в государственных и коммерческих тендерах</p></div>
              <div className="info-item"><h3><img src="/icons/card.svg" alt="Оплата" width={24} height={24} style={{display:'inline-block', marginRight:'8px', verticalAlign:'middle'}} /> Оплата</h3><p>Наличные, банковские карты, безналичный расчёт</p></div>
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