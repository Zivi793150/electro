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
							<h1 className="main-maket-title">Сотрудничество для оптовиков</h1>
							<div className="main-maket-subtitle">Гибкие условия, персональный менеджер, быстрые поставки по всему Казахстану.</div>
							<ul className="main-maket-advantages" style={{ marginTop: 12 }}>
								<li className="main-maket-adv-item"><span className="main-maket-arrow"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9H15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/><path d="M11 5L15 9L11 13" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Оптовые цены и приоритетные отгрузки</span></li>
								<li className="main-maket-adv-item"><span className="main-maket-arrow"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9H15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/><path d="M11 5L15 9L11 13" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Документы для тендеров и корпоративных закупок</span></li>
								<li className="main-maket-adv-item"><span className="main-maket-arrow"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9H15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/><path d="M11 5L15 9L11 13" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Быстрая логистика по РК</span></li>
							</ul>
							<div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
								<button className="main-maket-btn" onClick={handleOpenModal} style={{ width: 240, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}>Оставить заявку</button>
								<a
									href="https://electro-1-vjdu.onrender.com/api/price-list.csv"
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