import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { trackPageView, trackButtonClick } from '../utils/analytics';

const Thanks = () => {
  // На мобильных при переходе через history иногда остаётся предыдущая прокрутка
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Отслеживаем просмотр страницы благодарности
    trackPageView('thanks_page');
  }, []);
  return (
    <div className="thanks-page" style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#fff'}}>
      <Header />
      <main style={{flex:'1 0 auto'}}>
        <div style={{maxWidth: 960, margin: '0 auto', padding: '40px 16px', textAlign: 'center'}}>
          <div style={{fontSize: 48, marginBottom: 12}}>🎉</div>
          <h1 style={{fontSize: '1.8rem', margin: '0 0 8px 0', color: '#1a2236'}}>Спасибо за заявку!</h1>
          <p style={{fontSize: '1.05rem', color: '#445', margin: 0}}>Менеджер скоро вам ответит.</p>
          <div style={{marginTop: 28}}>
            <Link 
              to="/" 
              onClick={() => trackButtonClick('На главную', 'thanks_page')}
              style={{
                display: 'inline-block',
                background: '#FF6B00',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              На главную
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Thanks;


