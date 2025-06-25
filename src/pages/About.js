import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about">
      <Header />
      
      <main className="about-main">
        <div className="container">
          <h1 className="about-title">О компании</h1>
          
          {/* Основная информация */}
          <section className="about-hero">
            <div className="about-hero-content">
              <h2>ТОО "Танкер Тулс"</h2>
              <p className="about-subtitle">
                Ведущий поставщик профессиональных электроинструментов в Казахстане
              </p>
              <p>
                Мы специализируемся на поставке качественных электроинструментов от мировых 
                производителей. Наша миссия — обеспечить профессионалов и любителей надёжным 
                инструментом для любых задач.
              </p>
            </div>
            <div className="about-hero-image">
              <img 
                src="https://via.placeholder.com/500x300?text=О+компании" 
                alt="О компании Танкер Тулс" 
              />
            </div>
          </section>

          {/* Опыт и достижения */}
          <section className="about-experience">
            <h2>Наш опыт</h2>
            <div className="experience-grid">
              <div className="experience-item">
                <div className="experience-number">10+</div>
                <div className="experience-text">Лет на рынке</div>
              </div>
              <div className="experience-item">
                <div className="experience-number">5000+</div>
                <div className="experience-text">Довольных клиентов</div>
              </div>
              <div className="experience-item">
                <div className="experience-number">1000+</div>
                <div className="experience-text">Товаров в каталоге</div>
              </div>
              <div className="experience-item">
                <div className="experience-number">24/7</div>
                <div className="experience-text">Поддержка клиентов</div>
              </div>
            </div>
          </section>

          {/* Преимущества */}
          <section className="about-advantages">
            <h2>Наши преимущества</h2>
            <div className="advantages-grid">
              <div className="advantage-item">
                <div className="advantage-icon">🏭</div>
                <h3>Прямые поставки</h3>
                <p>Работаем напрямую с производителями, что позволяет предлагать лучшие цены</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">✅</div>
                <h3>Гарантия качества</h3>
                <p>Вся продукция сертифицирована и имеет официальную гарантию</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">🚚</div>
                <h3>Быстрая доставка</h3>
                <p>Доставляем по Алматы в день заказа, по области — на следующий день</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">🔧</div>
                <h3>Техподдержка</h3>
                <p>Консультации по выбору инструмента и техническая поддержка</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">📋</div>
                <h3>Тендерные документы</h3>
                <p>Предоставляем все необходимые документы для участия в тендерах</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">💰</div>
                <h3>Гибкие цены</h3>
                <p>Специальные условия для оптовых клиентов и постоянных партнёров</p>
              </div>
            </div>
          </section>

          {/* История компании */}
          <section className="about-history">
            <h2>История компании</h2>
            <div className="history-content">
              <p>
                Компания "Танкер Тулс" была основана в 2014 году группой профессионалов, 
                имеющих многолетний опыт работы в сфере строительства и промышленности. 
                Начав с небольшого склада в Алматы, мы выросли до одного из ведущих 
                поставщиков электроинструментов в Казахстане.
              </p>
              <p>
                За годы работы мы наладили партнёрские отношения с ведущими мировыми 
                производителями: Makita, DeWalt, Bosch, Hitachi, Metabo и многими другими. 
                Наша команда постоянно расширяется, а ассортимент пополняется новыми 
                моделями инструментов.
              </p>
              <p>
                Сегодня мы обслуживаем как крупные строительные компании и промышленные 
                предприятия, так и индивидуальных мастеров и домашних умельцев. 
                Наша репутация — это доверие клиентов и качество обслуживания.
              </p>
            </div>
          </section>

          {/* Партнёры */}
          <section className="about-partners">
            <h2>Наши партнёры</h2>
            <div className="partners-grid">
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=Makita" alt="Makita" />
                <h4>Makita</h4>
              </div>
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=DeWalt" alt="DeWalt" />
                <h4>DeWalt</h4>
              </div>
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=Bosch" alt="Bosch" />
                <h4>Bosch</h4>
              </div>
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=Hitachi" alt="Hitachi" />
                <h4>Hitachi</h4>
              </div>
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=Metabo" alt="Metabo" />
                <h4>Metabo</h4>
              </div>
              <div className="partner-item">
                <img src="https://via.placeholder.com/150x80?text=Milwaukee" alt="Milwaukee" />
                <h4>Milwaukee</h4>
              </div>
            </div>
          </section>

          {/* Команда */}
          <section className="about-team">
            <h2>Наша команда</h2>
            <div className="team-grid">
              <div className="team-item">
                <img src="https://via.placeholder.com/200x200?text=Директор" alt="Директор" />
                <h3>Александр Петров</h3>
                <p>Генеральный директор</p>
                <p>15 лет опыта в сфере поставок электроинструментов</p>
              </div>
              <div className="team-item">
                <img src="https://via.placeholder.com/200x200?text=Менеджер" alt="Менеджер" />
                <h3>Мария Сидорова</h3>
                <p>Менеджер по продажам</p>
                <p>Специалист по работе с корпоративными клиентами</p>
              </div>
              <div className="team-item">
                <img src="https://via.placeholder.com/200x200?text=Техник" alt="Техник" />
                <h3>Дмитрий Козлов</h3>
                <p>Технический специалист</p>
                <p>Консультации по выбору и обслуживанию инструмента</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About; 