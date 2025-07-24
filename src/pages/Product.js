import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/Product.css';

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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [miniProducts, setMiniProducts] = useState([]);
  const navigate = useNavigate();

  const API_URL = '/api/products';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки товара');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}?limit=4`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMiniProducts(data);
      });
  }, []);

  if (loading) {
    return <div style={{padding: 48, textAlign: 'center'}}>Загрузка...</div>;
  }
  if (error || !product) {
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

  const handleBuy = () => {
    navigate('/checkout', { state: { product } });
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

  const shortDesc = (product.shortDesc || 'краткое описание').slice(0, 160);

  return (
    <div className="product-page">
      <Header />
      <main className="product-main">
        <div className="product-container">
          <nav className="breadcrumbs" style={{paddingBottom: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
            <a href="/">Главная</a>
            <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
            <a href="/catalog">Каталог</a>
            {categoryName && (
              <>
                <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
                <a href={`/catalog?category=${product.category}`}>{categoryName}</a>
              </>
            )}
            <span style={{margin: '0 8px', color: '#bdbdbd', fontSize: '18px'}}>&rarr;</span>
            <span style={{color:'#1a2236', fontWeight:500}}>{product.name}</span>
          </nav>
          <div className="product-flex">
            {/* Фото и миниатюры */}
            <div className="product-gallery">
              <div className="product-gallery-inner">
                <div className="product-image-main" onClick={handleImageClick} style={{cursor:'zoom-in'}}>
                  <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images[activeImage] : '/images/products/placeholder.png'} alt={product.name} loading="lazy" />
                </div>
                {(Array.isArray(product.images) && product.images.length <= 1) && (
                  <>
                    <div className="product-thumbs" style={{marginBottom: '18px'}}>
                      {["/images/products/bolgarka-makita-125.jpg","/images/products/perforator-bosch-gbh.jpg","/images/products/drel.jpg"].map((img,idx)=>(
                        <img key={idx} src={img} alt={"thumb"+idx} className={activeImage===idx?"active": ""} onClick={()=>setActiveImage(idx)} loading="lazy" />
                      ))}
                    </div>
                    <div style={{textAlign:'center', color:'#888', fontSize:'1.05rem', marginTop: 4, marginBottom: 12, border:'none'}}>
                      Чтобы увеличить, нажмите на картинку
                    </div>
                  </>
                )}
                {Array.isArray(product.images) && product.images.length > 1 && (
                  <>
                    <div className="product-thumbs">
                      {product.images.map((img,idx)=>(
                        <img key={idx} src={img} alt={product.name+idx} className={activeImage===idx?"active": ""} onClick={()=>setActiveImage(idx)} loading="lazy" />
                      ))}
                    </div>
                    <div style={{textAlign:'center', color:'#888', fontSize:'1.05rem', marginTop: 4, marginBottom: 12, border:'none'}}>
                      Чтобы увеличить, нажмите на картинку
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Инфо и цена справа */}
            <div className="product-info-block">
              <>
                <h1 className="product-title" style={{fontWeight: 700, maxWidth: 320, marginBottom: 6, wordBreak: 'break-word', marginTop: 18}}>{product.name}</h1>
                <div className="product-short-desc" style={{fontSize: '1.18rem', color: '#222', marginBottom: 10, fontWeight: 500, marginTop: 0}}>{shortDesc}</div>
                <div className="product-subtitle">{product.subtitle}</div>
                <div className="product-divider"></div>
                <div className="product-buy-row">
                  <div className="product-price-block">
                    <div className="product-price-label-value">
                      <div className="product-price-label">Цена</div>
                      <div className="product-price-value">
                        {Number(product.price).toLocaleString('ru-RU')}
                        <span className="product-currency">₸</span>
                      </div>
                    </div>
                  </div>
                  <span className="product-price-divider"></span>
                  <div className="product-buy-btns">
                    <button className="product-btn-ask" onClick={handleOpenModal}>Задать вопрос</button>
                    <div className="product-btns-divider"></div>
                    <button className="product-btn-buy" onClick={handleBuy}>Купить</button>
                  </div>
                </div>
                <div className="product-divider"></div>
                <div style={{marginTop: 14, background: '#f5f7fa', borderRadius: 10, padding: '10px 12px 8px 12px', fontSize: '0.98rem', color: '#222', boxShadow: 'none', maxWidth: 320}}>
                  <div style={{fontWeight: 600, color: '#1e88e5', marginBottom: 8, fontSize: '1.01rem'}}>
                    Ваш город: <a href="#" style={{color:'#1e88e5', textDecoration:'underline', cursor:'pointer'}}>Алматы</a>
                  </div>
                  <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:6}}>
                    <span style={{fontSize:17, marginTop:2}}>🚚</span>
                    <div>
                      <div style={{fontWeight:500, color:'#222'}}>Бесплатная доставка по городу</div>
                      <div style={{color:'#1e88e5', fontWeight:600, fontSize:13}}>Сегодня — БЕСПЛАТНО</div>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:6}}>
                    <span style={{fontSize:17, marginTop:2}}>🏬</span>
                    <div>
                      <div style={{fontWeight:500, color:'#222'}}>Самовывоз из магазина <a href="#" style={{color:'#1e88e5'}}>ул. Толе би 216Б</a></div>
                      <div style={{color:'#222', fontSize:13}}>Сегодня с 9:00 до 18:00 — больше 5</div>
                    </div>
                  </div>
                  <div style={{background:'#f0f1f4', borderRadius:7, padding:'7px 10px', marginTop:8, color:'#222', fontSize:'0.93rem', display:'flex', alignItems:'center', gap:6}}>
                    <span style={{fontSize:15, color:'#888'}}>ⓘ</span>
                    <span>Срок доставки рассчитывается менеджером после оформления заказа</span>
                  </div>
                </div>
              </>
            </div>
          </div>
          {/* Вкладки снизу */}
          <div className="product-tabs-wrap">
            <Tabs product={product} />
                </div>
            </div>
      </main>
      {/* Мини-каталог популярных товаров */}
      <section className="mini-catalog-section">
        <div className="mini-catalog-header">
          <h2>Популярные товары</h2>
        </div>
        <div className="mini-catalog-slider-wrapper">
          <div className="mini-catalog-slider">
            {miniProducts.map(product => (
              <div
                key={product._id}
                className="product-card catalog-mini-product-card"
                onClick={() => window.location.href = `/product/${product._id}`}
                style={{ cursor: 'pointer', minHeight: 0, position: 'relative', fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, background: '#fff', minWidth: 260, maxWidth: 280, margin: '0 8px' }}
              >
                <div className="product-image" style={{height: '170px', padding: 0, margin: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', background:'#fff'}} loading="lazy" />
                </div>
                <div className="catalog-mini-product-divider" style={{width:'90%',maxWidth:'260px',borderTop:'1px solid #bdbdbd',margin:'0 auto 4px auto', alignSelf:'center'}}></div>
                <div className="product-info" style={{padding: '10px 12px 14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight:100}}>
                  <span style={{fontSize: '1.05rem', fontWeight: 500, color: '#1a2236', margin: 0, minHeight: '40px', lineHeight: 1.18, marginBottom: 8, textDecoration:'none',cursor:'pointer',display:'block', textAlign:'center', width:'100%'}}>{product.name}</span>
                  <div style={{width:'100%', textAlign:'left', margin:'0 0 2px 0'}}>
                    <span style={{color:'#888', fontSize:'0.98rem', fontWeight:400, letterSpacing:0.2}}>Цена</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: 0, marginBottom:2, justifyContent:'flex-start', width:'100%'}}>
                    <span className="product-price" style={{color:'#FFB300',fontWeight:'bold',fontSize:'1.25rem',letterSpacing:0.5}}>{product.price ? product.price + ' ₸' : ''}</span>
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
    {/* Модальное окно для увеличенного фото */}
    {showImageModal && (
      <div className="image-modal-overlay" onClick={handleCloseImageModal} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="image-modal-content" style={{background:'#fff',padding:0,borderRadius:'8px',boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative',maxWidth:'90vw',maxHeight:'90vh',display:'flex',flexDirection:'column',alignItems:'center'}} onClick={e=>e.stopPropagation()}>
          <img src={product.images[activeImage]} alt={product.name} style={{maxWidth:'80vw',maxHeight:'80vh',objectFit:'contain',background:'#fff'}} />
          {product.images.length > 1 && (
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:12}}>
              <button onClick={handlePrevImage} style={{fontSize:28,padding:'4px 16px',background:'none',border:'none',cursor:'pointer',color:'#222'}}>&#8592;</button>
              <button onClick={handleNextImage} style={{fontSize:28,padding:'4px 16px',background:'none',border:'none',cursor:'pointer',color:'#222'}}>&#8594;</button>
            </div>
          )}
          <button onClick={handleCloseImageModal} style={{position:'absolute',top:8,right:12,fontSize:32,background:'none',border:'none',color:'#222',cursor:'pointer',lineHeight:1}}>&times;</button>
        </div>
      </div>
    )}
    </div>
  );
};

function Tabs({product}) {
  const [tab,setTab]=React.useState('desc');
  // Пример группированных характеристик (можно заменить на реальные данные)
  const groupedSpecs = [
    {
      title: 'Дополнительно',
      specs: [
        { name: 'Наличие удара', value: 'безударный' },
        { name: 'Функции', value: 'реверс' },
        { name: 'Комплектация', value: 'кейс, зарядное устройство, угловая насадка, два аккумулятора, набор бит, набор сверл, набор накидных головок' },
        { name: 'Особенности', value: 'сменный аккумулятор' },
        { name: 'Вес', value: '2.0 кг' },
        { name: 'Дополнительная информация', value: 'гибкая насадка, набор бит, набор сверл, набор накидных головок' },
      ]
    },
    {
      title: 'Аккумулятор',
      specs: [
        { name: 'Напряжение аккумулятора', value: '48.0 В' },
        { name: 'Тип аккумулятора', value: 'Li-Ion' },
        { name: 'Ёмкость аккумулятора', value: '2.0 Ач' },
        { name: 'Питание', value: 'от аккумулятора' },
        { name: 'Аккумулятор и зарядное устройство в комплекте', value: 'Да' },
      ]
    },
    {
      title: 'Характеристики',
      specs: [
        { name: 'Тип патрона', value: 'быстрозажимной' },
        { name: 'Тип инструмента', value: 'дрель-шуруповёрт' },
        { name: 'Количество скоростей работы', value: '2' },
        { name: 'Диаметр патрона', value: '10' },
        { name: 'Максимальное число оборотов холостого хода', value: '1400.0 об/мин' },
        { name: 'Максимальный крутящий момент', value: '48.0 Нм' },
        { name: 'Потребляемая мощность', value: '350.0 Вт' },
      ]
    }
  ];
  return (
    <div className="product-tabs">
      <div className="product-tabs-header">
        <button className={tab==='desc'?'active':''} onClick={()=>setTab('desc')}>Описание</button>
        <button className={tab==='specs'?'active':''} onClick={()=>setTab('specs')}>Характеристики</button>
        <button className={tab==='equip'?'active':''} onClick={()=>setTab('equip')}>Комплектация</button>
      </div>
      <div className="product-tabs-content">
        {tab==='desc' && <div className="product-desc-kaspi-block">{product.description}</div>}
        {tab==='specs' && (
          <div className="product-specs-kaspi-block">
            <h2 className="product-specs-title">Характеристики {product.name}</h2>
            {groupedSpecs.map((group, idx) => (
              <div className="product-specs-group" key={group.title}>
                <div className="product-specs-group-title">{group.title}</div>
                <div className="product-specs-flex-table">
                  {group.specs.map((spec, i) => (
                    <div className={"product-specs-flex-row" + (!spec.value ? " no-value" : "")} key={i}>
                      <span className="product-specs-flex-name">{spec.name}</span>
                      <span className="product-specs-flex-dots"></span>
                      {spec.value && <span className="product-specs-flex-value">{spec.value}</span>}
                    </div>
                  ))}
                </div>
                {idx !== groupedSpecs.length-1 && <div className="product-specs-divider"></div>}
              </div>
            ))}
          </div>
        )}
        {tab==='equip' && (
          <div className="product-desc-kaspi-block">
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