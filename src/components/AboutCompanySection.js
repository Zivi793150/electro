import React from 'react';
import '../styles/AboutCompanySection.css';

const AboutCompanySection = () => (
  <section className="about-company-section">
    <div className="about-company-container">
      <div className="about-company-left">
        <h2 className="about-company-title">
          Компания <span className="about-company-title-accent">Промкраска</span> начала<br/> свою работу в марте 2014 года.
        </h2>
        <div className="about-company-desc">
          Мы — ведущий производитель и поставщик красок в Казахстане, предлагающий широкий спектр решений для окраски. Мы предоставляем инновационные технологии и высококачественные материалы для различных отраслей. Наши продукты соответствуют мировым стандартам и гарантируют надёжные покрытия.
        </div>
        <div className="about-company-list-wrap">
          <ul className="about-company-list">
            <li><span className="about-company-list-icon"/>Высококачественные материалы.</li>
            <li><span className="about-company-list-icon"/>Современные технологии окраски.</li>
            <li><span className="about-company-list-icon"/>Надёжные покрытия.</li>
            <li><span className="about-company-list-icon"/>Соответствие мировым стандартам.</li>
          </ul>
          <ul className="about-company-list">
            <li><span className="about-company-list-icon"/>Комплексные решения для окраски.</li>
            <li><span className="about-company-list-icon"/>Инновации в лакокрасочной индустрии.</li>
            <li><span className="about-company-list-icon"/>Оборудование для нанесения покрытий.</li>
            <li><span className="about-company-list-icon"/>Полный цикл услуг – от поставки до обучения.</li>
          </ul>
        </div>
        <button className="about-company-btn">Оставить заявку</button>
      </div>
      <div className="about-company-right">
        <div className="about-company-image-wrap">
          <img 
            src="/ChatGPT Image 26 июл. 2025 г., 10_35_59.png" 
            alt="Компания Промкраска" 
            className="about-company-image"
            loading="lazy"
          />
        </div>
        <div className="about-company-date">
          <span className="about-company-date-month">МАРТ</span>
          <span className="about-company-date-year">2014</span>
        </div>
      </div>
    </div>
  </section>
);

export default AboutCompanySection; 