import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DeliveryInfo from '../components/DeliveryInfo';
import '../styles/Product.css';
import '../styles/Checkout.css';
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const product = location.state?.product;
  const [payment, setPayment] = useState('card');
  const [delivery, setDelivery] = useState('courier');
  const [selectedCity, setSelectedCity] = useState('Алматы');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', additionalInfo: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо за заказ! Мы свяжемся с вами для подтверждения.');
  };

  const total = product ? Number(product.price) : 0;
  const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
  const finalTotal = total + deliveryCost;

  return (
    <div className="product-page">
      <Header />
      <main className="product-main" style={{ minHeight: 500 }}>
        <div className="checkout-container">
          {/* Левая колонка - Продукты */}
          <div className="checkout-products">
            <h1 className="product-title" style={{ marginBottom: 24 }}>Ваш заказ</h1>
            {product && (
              <div className="checkout-product-card">
                <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 90, height: 90, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0'}} />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 500, fontSize: 20, color: '#1a2236', marginBottom: 6}}>{product.name}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}>
                    <span style={{color: '#888', fontSize: 15}}>Цена за 1 шт:</span>
                    <span style={{color: '#FFB300', fontWeight: 700, fontSize: 18}}>{Number(total).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Форма оформления */}
          <div className="checkout-form">
            <h1 className="product-title" style={{ marginBottom: 24 }}>Оформление заказа</h1>
            <form onSubmit={handleSubmit} className="checkout-form-container">
            <div style={{ marginBottom: 22, borderBottom: '1px solid #e0e0e0', paddingBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 8, fontSize: 17 }}>Способ оплаты</label>
              <div className="payment-methods">
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="card" checked={payment==='card'} onChange={()=>setPayment('card')} /> Картой онлайн</label>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="cash" checked={payment==='cash'} onChange={()=>setPayment('cash')} /> Наличными</label>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="kaspi" checked={payment==='kaspi'} onChange={()=>setPayment('kaspi')} /> Kaspi QR</label>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="remote" checked={payment==='remote'} onChange={()=>setPayment('remote')} /> Оплата удаленно</label>
              </div>
            </div>
            <div style={{ marginBottom: 22, borderBottom: '1px solid #e0e0e0', paddingBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 8, fontSize: 17 }}>Город доставки</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 16,
                  background: '#fff'
                }}
              >
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
                <option value="Актобе">Актобе</option>
                <option value="Караганда">Караганда</option>
                <option value="Тараз">Тараз</option>
                <option value="Павлодар">Павлодар</option>
                <option value="Семей">Семей</option>
                <option value="Усть-Каменогорск">Усть-Каменогорск</option>
                <option value="Уральск">Уральск</option>
              </select>
            </div>
            
            <DeliveryInfo 
              city={selectedCity} 
              onDeliverySelect={setSelectedDelivery}
            />
            <div className="form-group">
              <label>Ваше имя</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+7 (___) ___-__-__" />
            </div>
            {selectedDelivery && selectedDelivery.type !== 'pickup' && (
              <div className="form-group">
                <label>Адрес доставки</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label>Дополнительная информация</label>
              <textarea 
                name="additionalInfo" 
                value={form.additionalInfo} 
                onChange={handleChange} 
                placeholder="Укажите дополнительную информацию, пожелания или комментарии к заказу..."
              />
            </div>
            <div className="total-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{fontWeight: 500, fontSize: 16, color: '#666'}}>Стоимость товара:</span>
                <span style={{fontWeight: 600, fontSize: 16, color: '#333'}}>{Number(total).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
              </div>
              {deliveryCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{fontWeight: 500, fontSize: 16, color: '#666'}}>Доставка:</span>
                  <span style={{fontWeight: 600, fontSize: 16, color: '#333'}}>{Number(deliveryCost).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', paddingTop: 12 }}>
                <span style={{fontWeight: 600, fontSize: 18, color: '#222'}}>Итого к оплате:</span>
                <span style={{color: '#FFB300', fontWeight: 700, fontSize: 22}}>{Number(finalTotal).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
              </div>
            </div>
            <button type="submit" className="submit-button">Оформить заказ</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout; 