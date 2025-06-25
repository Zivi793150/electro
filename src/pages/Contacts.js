import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Contacts.css';

const Contacts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitForm = (formData) => {
    // Здесь будет логика отправки в Telegram
    console.log('Контактная форма:', formData);
    alert('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
  };

  const handleSocialClick = (platform) => {
    // Здесь будет логика перехода в соцсети
    console.log(`Переход в ${platform}`);
    alert(`Переход в ${platform} (в реальном проекте будет ссылка)`);
  };

  return (
    <div className="contacts">
      <Header />
      
      <main className="contacts-main">
        <div className="container">
          <h1 className="contacts-title">Контакты</h1>
          
          <div className="contacts-content">
            {/* Контактная информация */}
            <div className="contact-info">
              <h2>Свяжитесь с нами</h2>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-details">
                  <h3>Телефон</h3>
                  <p>+7 (777) 777-77-77</p>
                  <p>+7 (727) 777-77-77</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">✉</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>info@tankertools.kz</p>
                  <p>sales@tankertools.kz</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Адрес</h3>
                  <p>г. Алматы, ул. Примерная 1</p>
                  <p>Бизнес-центр "Танкер", офис 205</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">🕒</div>
                <div className="contact-details">
                  <h3>Режим работы</h3>
                  <p>Понедельник - Пятница: 9:00 - 18:00</p>
                  <p>Суббота: 10:00 - 16:00</p>
                  <p>Воскресенье: выходной</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">🚚</div>
                <div className="contact-details">
                  <h3>Доставка</h3>
                  <p>По Алматы: в день заказа</p>
                  <p>По области: на следующий день</p>
                  <p>Самовывоз: ежедневно</p>
                </div>
              </div>
            </div>

            {/* Форма связи */}
            <div className="contact-form">
              <h2>Напишите нам</h2>
              <p>Оставьте сообщение, и мы свяжемся с вами в ближайшее время</p>
              
              <button className="btn-contact-form" onClick={handleOpenModal}>
                Отправить сообщение
              </button>
              
              <div className="social-links">
                <h3>Мы в социальных сетях</h3>
                <div className="social-grid">
                  <button 
                    className="social-link" 
                    onClick={() => handleSocialClick('WhatsApp')}
                  >
                    <span className="social-icon">📱</span>
                    <span>WhatsApp</span>
                  </button>
                  <button 
                    className="social-link" 
                    onClick={() => handleSocialClick('Telegram')}
                  >
                    <span className="social-icon">📧</span>
                    <span>Telegram</span>
                  </button>
                  <button 
                    className="social-link" 
                    onClick={() => handleSocialClick('Instagram')}
                  >
                    <span className="social-icon">📷</span>
                    <span>Instagram</span>
                  </button>
                  <button 
                    className="social-link" 
                    onClick={() => handleSocialClick('Facebook')}
                  >
                    <span className="social-icon">📘</span>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Карта */}
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

          {/* Дополнительная информация */}
          <section className="additional-info">
            <div className="info-grid">
              <div className="info-item">
                <h3>🚚 Доставка</h3>
                <p>Бесплатная доставка по Алматы при заказе от 50 000 ₸</p>
              </div>
              <div className="info-item">
                <h3>🔧 Сервис</h3>
                <p>Техническое обслуживание и ремонт электроинструментов</p>
              </div>
              <div className="info-item">
                <h3>📋 Тендеры</h3>
                <p>Участие в государственных и коммерческих тендерах</p>
              </div>
              <div className="info-item">
                <h3>💰 Оплата</h3>
                <p>Наличные, банковские карты, безналичный расчёт</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      
      <Modal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Contacts; 