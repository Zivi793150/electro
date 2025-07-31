import React from 'react';
import '../styles/AboutCompanySection.css';

const AboutCompanySection = () => (
  <section className="about-company-section">
    <div className="about-company-container">
      <div className="about-company-content">
        <div className="about-company-header">
          <div className="header-line"></div>
          <h1 className="about-company-title">Промкраска</h1>
          <div className="header-line"></div>
        </div>
        <div className="about-company-subtitle">
          Ваш надежный партнер<br/>
          в мире красок и<br/>
          технологий!
        </div>
        <button className="about-company-btn">Оставить заявку</button>
      </div>
    </div>
  </section>
);

export default AboutCompanySection; 