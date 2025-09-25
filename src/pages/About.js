import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/About.css';

const About = () => (
    <div className="about">
      <Header />
      <main className="about-main">
        <div className="container">
          <h1 className="about-title">О компании</h1>
          <section className="about-hero">
            <div className="about-hero-content">
              <p className="about-subtitle">Ведущий поставщик профессиональных электроинструментов и оборудования в Казахстане</p>
              <p>Мы предлагаем широкий ассортимент продукции для дома, офиса, дачи и фермерских хозяйств. Мы собрали в одном каталоге надёжные инструменты и оборудование, чтобы наши клиенты могли решать задачи любой сложности от домашних до промышленных.</p>
              <p>Мы работаем только с проверенными мировыми производителями и гарантируем качество и надёжность каждого товара. Наша цель обеспечить вас инструментами и оборудованием, которые помогут решать любые задачи быстро, удобно и эффективно.</p>
            </div>
            <div className="about-hero-image">
              <img src="/logo.webp" alt="Логотип ТОО Танкер Тулс" loading="lazy" width="500" height="300" />
            </div>
          </section>
          <section className="about-experience">
            <h2>Наш опыт</h2>
            <div className="experience-grid">
            <div className="experience-item"><div className="experience-number">10+</div><div className="experience-text">Лет на рынке</div></div>
            <div className="experience-item"><div className="experience-number">5000+</div><div className="experience-text">Довольных клиентов</div></div>
            <div className="experience-item"><div className="experience-number">1000+</div><div className="experience-text">Товаров в каталоге</div></div>
            <div className="experience-item"><div className="experience-number">24/7</div><div className="experience-text">Поддержка клиентов</div></div>
            </div>
          </section>
          <section className="about-history">
            <h2>История компании</h2>
            <div className="history-content">
            <p>Компания Eltok.kz была основана в 2014 году, начав свою историю с бренда Танкер. С небольшого склада в Алматы мы выросли в одного из ведущих поставщиков электроинструментов и оборудования в Казахстане.</p>
            <p>С первых дней мы делаем ставку на качество продукции и высокий уровень сервиса. Постепенно расширяя ассортимент, мы сформировали комплексное предложение от профессиональных электроинструментов и оборудования до электротехнической продукции для различных сфер применения.</p>
            <p>Сегодня Eltok.kz обслуживает как крупные строительные компании и промышленные предприятия, так и индивидуальных мастеров. Репутация компании строится на доверии клиентов, надёжности и профессиональном подходе.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );

export default About; 