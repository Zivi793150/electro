import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Product.css';

const products = [
  {
    id: 1,
    name: 'Болгарка Makita 125мм',
    subtitle: 'Профессиональный инструмент для точной и безопасной работы',
    description: 'Профессиональная угловая шлифмашина',
    price: '45 000 ₸',
    images: [
      '/images/products/bolgarka-makita-125.jpg',
      '/images/products/shurupovert-dewalt-18v.jpg',
      '/images/products/perforator-bosch-gbh.jpg',
      '/images/products/drel.jpg'
    ],
    specifications: [
      { name: 'Мощность', value: '1200 Вт' },
      { name: 'Диаметр диска', value: '125 мм' }
    ],
    equipment: ['Болгарка', 'Защитный кожух', 'Ключ'],
    applications: ['Металлообработка', 'Строительство']
  },
  {
    id: 2,
    name: 'Шуруповёрт DeWalt 18V',
    subtitle: 'Беспроводной шуруповёрт с литий-ионным аккумулятором',
    description: 'Беспроводной шуруповёрт с литий-ионным аккумулятором',
    price: '85 000 ₸',
    images: [
      '/images/products/shurupovert-dewalt-18v.jpg'
    ],
    specifications: [
      { name: 'Напряжение', value: '18 В' },
      { name: 'Тип аккумулятора', value: 'Li-Ion' }
    ],
    equipment: ['Шуруповёрт', 'Аккумулятор', 'Зарядное устройство'],
    applications: ['Сборка мебели', 'Строительство']
  },
  {
    id: 3,
    name: 'Перфоратор Bosch GBH 2-26',
    subtitle: 'Мощный перфоратор для строительных работ',
    description: 'Мощный перфоратор для строительных работ',
    price: '120 000 ₸',
    images: [
      '/images/products/perforator-bosch-gbh.jpg'
    ],
    specifications: [
      { name: 'Мощность', value: '800 Вт' },
      { name: 'Энергия удара', value: '2.7 Дж' }
    ],
    equipment: ['Перфоратор', 'Бур', 'Кейс'],
    applications: ['Сверление бетона', 'Долбление']
  },
  {
    id: 4,
    name: 'Дрель Интерскол ДУ-13/780',
    subtitle: 'Универсальная дрель для сверления',
    description: 'Универсальная дрель для сверления',
    price: '25 000 ₸',
    images: [
      '/images/products/drel.jpg'
    ],
    specifications: [
      { name: 'Мощность', value: '780 Вт' },
      { name: 'Патрон', value: '13 мм' }
    ],
    equipment: ['Дрель', 'Ключ', 'Инструкция'],
    applications: ['Сверление', 'Ремонт']
  },
  {
    id: 5,
    name: 'Лобзик Makita 4329',
    subtitle: 'Электролобзик для точной резки',
    description: 'Электролобзик для точной резки',
    price: '35 000 ₸',
    images: [
      'https://via.placeholder.com/300x200?text=Лобзик+Makita'
    ],
    specifications: [
      { name: 'Мощность', value: '450 Вт' }
    ],
    equipment: ['Лобзик', 'Пилка'],
    applications: ['Резка', 'Столярные работы']
  },
  {
    id: 6,
    name: 'Лазерный уровень BOSCH GLL 2-10',
    subtitle: 'Точный лазерный уровень для разметки',
    description: 'Точный лазерный уровень для разметки',
    price: '55 000 ₸',
    images: [
      'https://via.placeholder.com/300x200?text=Лазерный+уровень'
    ],
    specifications: [
      { name: 'Дальность', value: '10 м' }
    ],
    equipment: ['Уровень', 'Чехол'],
    applications: ['Разметка', 'Строительство']
  },
  {
    id: 7,
    name: 'Генератор Huter DY3000L',
    subtitle: 'Бензиновый генератор 3 кВт',
    description: 'Бензиновый генератор 3 кВт',
    price: '180 000 ₸',
    images: [
      'https://via.placeholder.com/300x200?text=Генератор+Huter'
    ],
    specifications: [
      { name: 'Мощность', value: '3 кВт' }
    ],
    equipment: ['Генератор'],
    applications: ['Электроснабжение']
  },
  {
    id: 8,
    name: 'Мультиметр Fluke 117',
    subtitle: 'Профессиональный измерительный прибор',
    description: 'Профессиональный измерительный прибор',
    price: '95 000 ₸',
    images: [
      'https://via.placeholder.com/300x200?text=Мультиметр+Fluke'
    ],
    specifications: [
      { name: 'Тип', value: 'Цифровой' }
    ],
    equipment: ['Мультиметр', 'Щупы'],
    applications: ['Измерения', 'Ремонт']
  }
];

// Категории для хлебных крошек
const categories = [
  { id: 'grinders', name: 'Болгарки' },
  { id: 'screwdrivers', name: 'Шуруповёрты' },
  { id: 'hammers', name: 'Перфораторы' },
  { id: 'drills', name: 'Дрели' },
  { id: 'jigsaws', name: 'Лобзики' },
  { id: 'levels', name: 'Лазерные уровни' },
  { id: 'generators', name: 'Генераторы' },
  { id: 'measuring', name: 'Измерители' }
];

const Product = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="product">
        <Header />
        <main className="product-main">
          <div className="container" style={{padding: '48px 0', textAlign: 'center'}}>
            <h1>Товар не найден</h1>
            <p>Проверьте правильность ссылки или вернитесь в <a href="/catalog">каталог</a>.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Найти категорию для хлебных крошек
  const categoryObj = categories.find(cat => cat.id === product.category);
  const categoryName = categoryObj ? categoryObj.name : '';

  // Преимущества — если есть в product, иначе дефолтные
  const productAdvantages = product.advantages || [
    'Высокий крутящий момент и мощность',
    'Долговечный литий-ионный аккумулятор',
    'Компактный и лёгкий корпус для работы одной рукой'
  ];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmitForm = (formData) => {
    console.log('Заявка на товар:', { ...formData, product: product.name });
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  // Модалка фото
  const handleImageClick = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  return (
    <div className="product-page">
      <Header />
      <main className="product-main">
        <div className="product-container">
          <div className="product-flex">
            {/* Фото и миниатюры */}
            <div className="product-gallery">
              <div className="product-gallery-inner">
                <div className="product-image-main">
                  <img src={product.images[activeImage]} alt={product.name} loading="lazy" />
                </div>
                {product.images.length > 1 && (
                  <div className="product-thumbs">
                    {product.images.map((img,idx)=>(
                      <img key={idx} src={img} alt={product.name+idx} className={activeImage===idx?"active":""} onClick={()=>setActiveImage(idx)} loading="lazy" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Инфо и цена справа */}
            <div className="product-info-block">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-subtitle">{product.subtitle}</div>
              <div className="product-divider"></div>
              <div className="product-buy-row">
                <div className="product-price-block">
                  <div className="product-price-label-value">
                    <div className="product-price-label">Цена</div>
                    <div className="product-price-value">
                      {parseInt(product.price.replace(/\D/g,'')).toLocaleString('ru-RU')}
                      <span className="product-currency">₸</span>
                    </div>
                  </div>
                  <span className="product-price-divider"></span>
                </div>
                <div className="product-buy-btns">
                  <button className="product-btn-ask" onClick={handleOpenModal}>Задать вопрос</button>
                  <div className="product-btns-divider"></div>
                  <button className="product-btn-buy" onClick={handleOpenModal}>Купить</button>
                </div>
            </div>
            </div>
          </div>
          {/* Вкладки снизу */}
          <div className="product-tabs-wrap">
            <Tabs product={product} />
                </div>
            </div>
      </main>
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Популярные товары</h2>
        </div>
        <div className="mini-catalog-slider-wrapper">
          <div className="mini-catalog-slider">
            {[...products.slice(0, 4), ...products.slice(0, 4)].map(product => (
              <div
                key={product.id + Math.random()}
                className="product-card catalog-mini-product-card"
                onClick={() => window.location.href = `/product/${product.id}`}
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', minWidth: 260, maxWidth: 280, margin: '0 8px' }}
              >
                <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img src={product.images[0]} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                </div>
                <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                  <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                  <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                    <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                    <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{parseInt(product.price.replace(/\D/g, '')).toLocaleString('ru-RU')} ₸</span>
                    <span style={{height:'2.7em',width:'1px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 7px',verticalAlign:'middle'}}></span>
            </div>
                </div>
            </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} />
    </div>
  );
};

function Tabs({product}) {
  const [tab,setTab]=React.useState('desc');
  return (
    <div className="product-tabs">
      <div className="product-tabs-header">
        <button className={tab==='desc'?'active':''} onClick={()=>setTab('desc')}>Описание</button>
        <button className={tab==='specs'?'active':''} onClick={()=>setTab('specs')}>Характеристики</button>
        <button className={tab==='equip'?'active':''} onClick={()=>setTab('equip')}>Комплектация</button>
      </div>
      <div className="product-tabs-content">
        {tab==='desc' && <div>{product.description}</div>}
        {tab==='specs' && (
          <div>
            {product.specifications && product.specifications.length>0 ? (
              <ul>
                {product.specifications.map((spec,idx)=>(
                  <li key={idx}><b>{spec.name}:</b> {spec.value}</li>
                ))}
              </ul>
            ) : 'Нет данных'}
          </div>
        )}
        {tab==='equip' && (
          <div>
            {product.equipment && product.equipment.length>0 ? (
              <ul>
                {product.equipment.map((item,idx)=>(
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : 'Нет данных'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product; 