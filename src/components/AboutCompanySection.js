import React from 'react';
import '../styles/AboutCompanySection.css';

const AboutCompanySection = () => (
  <section className="about-company-section">
    <div className="about-company-container">
      <div className="about-company-content">
        <div className="about-company-header">
          <div className="header-line"></div>
          <h1 className="about-company-title">Tanker</h1>
          <div className="header-line"></div>
        </div>
        <div className="about-company-subtitle">
          инструмент, которому<br/>
          доверяют мастера и<br/>
          компании.
        </div>
      </div>
    </div>
  </section>
);

export default AboutCompanySection; 