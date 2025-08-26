import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import SimpleSlider from '../components/SimpleSlider';
import { trackButtonClick } from '../utils/analytics';
import '../styles/Product.css';

const Cooperation = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const sliderImages = [
		{ webp: '/images/hero/hero-main.webp', jpg: '/images/hero/hero-main.jpg', alt: 'Электроинструмент 1' },
		{ webp: '/images/hero/hero-main.webp', jpg: '/images/hero/hero-main.jpg', alt: 'Электроинструмент 2' },
		{ webp: '/images/hero/hero-main.webp', jpg: '/images/hero/hero-main.jpg', alt: 'Электроинструмент 3' }
	];

	const handleOpenModal = () => {
		trackButtonClick('Оставить заявку', 'cooperation_page');
		setIsModalOpen(true);
	};

	const handleCloseModal = () => setIsModalOpen(false);

	return (
  <div className="cooperation">
    <Header />
			<main className="product-main" style={{ background: '#fff' }}>
				<section className="main-maket-section" style={{ padding: '40px 0' }}>
					<div className="main-maket-container">
						<div className="main-maket-left">
							<SimpleSlider images={sliderImages} height={380} />
						</div>
						<div className="main-maket-right">
							<h1 className="main-maket-title">СОТРУДНИЧЕСТВО ДЛЯ ОПТОВИКОВ И КОМПАНИЙ</h1>
							
							<div className="main-maket-subtitle" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>
								Официальный поставщик электроинструментов Tanker в Казахстане и СНГ
							</div>
							
							<div style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px', color: '#333' }}>
								Мы приглашаем к сотрудничеству оптовых клиентов, снабженцев, строительные организации, компании и дистрибьюторов.
								Работая с нами, вы получаете надёжного партнёра и прямой доступ к официальной продукции Tanker с гарантией качества.
							</div>

							<div style={{ marginBottom: '24px' }}>
								<h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FF6B00', marginBottom: '12px' }}>ВАШИ ВЫГОДЫ</h3>
								<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Прямые поставки – без посредников, только оригинальная продукция
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Лучшие цены – специальные условия для оптовых клиентов
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Гибкость – закупки от мелкого до крупного опта
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Надёжность – гарантия на весь ассортимент (12 месяцев)
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Поддержка – консультации, сервис и постгарантийное обслуживание
									</li>
								</ul>
							</div>

							<div style={{ marginBottom: '24px' }}>
								<h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FF6B00', marginBottom: '12px' }}>ОСОБЫЕ УСЛОВИЯ ДЛЯ B2B</h3>
								<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Работаем с госзакупками и тендерами (полный пакет документов)
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Персональный менеджер для каждого клиента
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Индивидуальные скидки и бонусные программы
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Возможность отгрузки со склада и под заказ
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Быстрая доставка по всему Казахстану и СНГ
									</li>
								</ul>
							</div>

							<div style={{ marginBottom: '24px' }}>
								<h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FF6B00', marginBottom: '12px' }}>ДОПОЛНИТЕЛЬНЫЕ ПРИЕМУЩЕСТВА</h3>
								<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Розыгрыши и акции для оптовых партнёров
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Бонусная система лояльности
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Логистика под ключ – экономия вашего времени
									</li>
								</ul>
							</div>

							<div style={{ marginBottom: '24px' }}>
								<h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FF6B00', marginBottom: '12px' }}>КОМУ ПОДХОДИТ СОТРУДНИЧЕСТВО</h3>
								<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Оптовым компаниям и дистрибьюторам
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Строительным и ремонтным организациям
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Снабженцам и закупочным отделам
									</li>
									<li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
										<span style={{ color: '#FF6B00', marginRight: '8px' }}>✓</span>
										Интернет-магазинам и розничным торговым точкам
									</li>
        </ul>
							</div>

							<div style={{ marginBottom: '24px' }}>
								<h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FF6B00', marginBottom: '12px' }}>НАЧНИТЕ ЗАРАБАТЫВАТЬ СЕГОДНЯ</h3>
								<div style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '16px' }}>
									Свяжитесь с нами — и получите персональное предложение!
									Запросите прайс и условия сотрудничества у нашего менеджера.
								</div>
								<div style={{ fontSize: '1rem', lineHeight: '1.6', fontStyle: 'italic', color: '#666' }}>
									Мы ценим долгосрочные партнёрские отношения и строим бизнес на доверии, выгоде и надёжности.
								</div>
								<div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#FF6B00', marginTop: '12px' }}>
									Ваш успех — наша общая цель!
								</div>
							</div>

							<div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
								<button className="main-maket-btn" onClick={handleOpenModal} style={{ width: 240, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}>
									Оставить заявку
								</button>
								<a
									href="/price-list.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="main-maket-btn"
									style={{ background: '#2d3748', width: 240, textAlign: 'center', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}
									onClick={() => trackButtonClick('Скачать прайс-лист', 'cooperation_page')}
								>
									Скачать прайс-лист
								</a>
							</div>
        </div>
      </div>
				</section>
    </main>
    <Footer />
			<Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={() => {}} />
  </div>
);
};

export default Cooperation; 