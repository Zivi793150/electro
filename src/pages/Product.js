import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import ImageModal from '../components/ImageModal';
import '../styles/Product.css';

const products = [
  {
    id: 1,
    name: 'Болгарка Makita 125мм',
    subtitle: 'Профессиональный инструмент для точной и безопасной работы',
    description: 'Профессиональная угловая шлифмашина',
    price: '45 000 ₸',
    images: [
      '/images/products/bolgarka-makita-125.jpg'
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
    <div className="product">
      <Header />
      <main className="product-main" style={{background:'#fff',padding:'48px 0'}}>
        <div className="container" style={{maxWidth:1440, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={{display:'flex',gap:64,alignItems:'flex-start',justifyContent:'center',width:'100%',flexWrap:'wrap'}}>
            {/* Фото и миниатюры */}
            <div style={{flex:'0 0 600px',maxWidth:600}}>
              <div style={{border:'1px solid #eee',borderRadius:18,padding:32,background:'#fafbfc',textAlign:'center'}}>
                <img src={product.images[activeImage]} alt={product.name} style={{maxWidth:'100%',maxHeight:600,objectFit:'contain',margin:'0 auto',display:'block',borderRadius:12}} />
              </div>
              {product.images.length > 1 && (
                <div style={{display:'flex',gap:16,marginTop:18,justifyContent:'center'}}>
                  {product.images.map((img,idx)=>(
                    <img key={idx} src={img} alt={product.name+idx} style={{width:90,height:90,objectFit:'contain',borderRadius:10,border:activeImage===idx?'3px solid #1e88e5':'2px solid #eee',cursor:'pointer',background:'#fff'}} onClick={()=>setActiveImage(idx)} />
                  ))}
                </div>
              )}
            </div>
            {/* Инфо и цена справа */}
            <div style={{flex:'1 1 420px',minWidth:340,maxWidth:520,display:'flex',flexDirection:'column',gap:32,justifyContent:'flex-start'}}>
              <h1 style={{fontSize:'2.8rem',fontWeight:800,margin:'0 0 18px 0',color:'#1a2236',lineHeight:1.13}}>{product.name}</h1>
              <div style={{fontSize:'1.45rem',color:'#444',marginBottom:12}}>{product.subtitle}</div>
              {/* Горизонтальная полоска */}
              <div style={{width:'100%',borderTop:'2px solid #bdbdbd',margin:'12px 0 28px 0'}}></div>
              <div style={{display:'flex',alignItems:'center',gap:40,margin:'24px 0'}}>
                <div style={{display:'flex',alignItems:'center',gap:18}}>
                  <div>
                    <div style={{color:'#888',fontSize:'1.25rem',marginBottom:4}}>Цена</div>
                    <div style={{fontSize:'2.7rem',fontWeight:900,color:'#FFB300',letterSpacing:1,whiteSpace:'nowrap'}}>
                      {parseInt(product.price.replace(/\D/g,'')).toLocaleString('ru-RU')}
                      <span style={{whiteSpace:'nowrap',marginLeft:6}}>₸</span>
                    </div>
                  </div>
                  {/* Вертикальная полоска */}
                  <span style={{height:'4.2em',width:'2px',background:'#bdbdbd',display:'inline-block',margin:'0 0 0 18px',verticalAlign:'middle'}}></span>
                </div>
                <button onClick={handleOpenModal} style={{background:'#FF6B00',color:'#fff',fontWeight:800,fontSize:'1.45rem',border:'none',borderRadius:12,padding:'22px 54px',cursor:'pointer',boxShadow:'0 6px 24px rgba(255,107,0,0.13)',transition:'background 0.2s'}}>Оформить заказ</button>
              </div>
            </div>
          </div>
          {/* Вкладки снизу, на всю ширину */}
          <div style={{marginTop:64, width:'100%', display:'flex', justifyContent:'flex-start', marginLeft:0}}>
            <div style={{marginLeft:'calc((100% - 1440px)/2 + 0px)', minWidth:480}}>
              <Tabs product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} />
    </div>
  );
};

function Tabs({product}) {
  const [tab,setTab]=React.useState('desc');
  return (
    <div style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(30,40,90,0.06)',padding:'24px 18px',maxWidth:900}}>
      <div style={{display:'flex',gap:16,marginBottom:18}}>
        <button onClick={()=>setTab('desc')} style={{background:'none',border:'none',fontWeight:tab==='desc'?700:400,fontSize:'1.08rem',color:tab==='desc'?'#1e88e5':'#222',borderBottom:tab==='desc'?'2px solid #1e88e5':'2px solid transparent',padding:'6px 12px',cursor:'pointer'}}>Описание</button>
        <button onClick={()=>setTab('specs')} style={{background:'none',border:'none',fontWeight:tab==='specs'?700:400,fontSize:'1.08rem',color:tab==='specs'?'#1e88e5':'#222',borderBottom:tab==='specs'?'2px solid #1e88e5':'2px solid transparent',padding:'6px 12px',cursor:'pointer'}}>Характеристики</button>
        <button onClick={()=>setTab('equip')} style={{background:'none',border:'none',fontWeight:tab==='equip'?700:400,fontSize:'1.08rem',color:tab==='equip'?'#1e88e5':'#222',borderBottom:tab==='equip'?'2px solid #1e88e5':'2px solid transparent',padding:'6px 12px',cursor:'pointer'}}>Комплектация</button>
      </div>
      <div style={{minHeight:60}}>
        {tab==='desc' && (
          <div style={{fontSize:'1.05rem',color:'#222'}}>{product.description}</div>
        )}
        {tab==='specs' && (
          <div style={{fontSize:'1.05rem',color:'#222'}}>
            {product.specifications && product.specifications.length>0 ? (
              <ul style={{paddingLeft:18,margin:0}}>
                {product.specifications.map((spec,idx)=>(
                  <li key={idx}><b>{spec.name}:</b> {spec.value}</li>
                ))}
              </ul>
            ) : 'Нет данных'}
          </div>
        )}
        {tab==='equip' && (
          <div style={{fontSize:'1.05rem',color:'#222'}}>
            {product.equipment && product.equipment.length>0 ? (
              <ul style={{paddingLeft:18,margin:0}}>
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