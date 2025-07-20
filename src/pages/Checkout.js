import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Product.css';
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const product = location.state?.product;
  const [payment, setPayment] = useState('card');
  const [delivery, setDelivery] = useState('courier');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо за заказ! Мы свяжемся с вами для подтверждения.');
  };

  const total = product ? Number(product.price) : 0;

  return (
    <div className="product-page">
      <Header />
      <main className="product-main" style={{ minHeight: 500 }}>
        <div style={{ maxWidth: 540, margin: '0 auto', alignItems: 'stretch' }}>
          <h1 className="product-title" style={{ textAlign: 'center', marginBottom: 24 }}>Оформление заказа</h1>
          {product && (
            <div style={{width: '100%', boxSizing: 'border-box', border: '1.5px solid #bdbdbd', borderRadius: 12, padding: 20, marginBottom: 28, background: '#f9f9f9', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 2px 12px rgba(30,40,90,0.06)'}}>
              <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 90, height: 90, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0'}} />
              <div style={{flex: 1}}>
                <div style={{fontWeight: 500, fontSize: 20, color: '#1a2236', marginBottom: 6}}>{product.name}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}>
                  <span style={{color: '#888', fontSize: 15}}>Цена за 1 шт:</span>
                  <span style={{color: '#FFB300', fontWeight: 700, fontSize: 18}}>{total.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: '1.5px solid #bdbdbd', borderRadius: 12, padding: 28, boxShadow: '0 4px 18px rgba(30,40,90,0.06)', marginBottom: 24 }}>
            <div style={{ marginBottom: 22, borderBottom: '1px solid #e0e0e0', paddingBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 8, fontSize: 17 }}>Способ оплаты</label>
              <div style={{ display: 'flex', gap: 24 }}>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="card" checked={payment==='card'} onChange={()=>setPayment('card')} /> Картой онлайн</label>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="cash" checked={payment==='cash'} onChange={()=>setPayment('cash')} /> Наличными</label>
                <label style={{fontSize: 16}}><input type="radio" name="payment" value="kaspi" checked={payment==='kaspi'} onChange={()=>setPayment('kaspi')} /> Kaspi QR</label>
              </div>
            </div>
            <div style={{ marginBottom: 22, borderBottom: '1px solid #e0e0e0', paddingBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 8, fontSize: 17 }}>Доставка</label>
              <div style={{ display: 'flex', gap: 24 }}>
                <label style={{fontSize: 16}}><input type="radio" name="delivery" value="courier" checked={delivery==='courier'} onChange={()=>setDelivery('courier')} /> Курьером</label>
                <label style={{fontSize: 16}}><input type="radio" name="delivery" value="pickup" checked={delivery==='pickup'} onChange={()=>setDelivery('pickup')} /> Самовывоз</label>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Ваше имя</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 12, border: '1px solid #bdbdbd', borderRadius: 6, fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Телефон</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+7 (___) ___-__-__" style={{ width: '100%', padding: 12, border: '1px solid #bdbdbd', borderRadius: 6, fontSize: 16 }} />
            </div>
            {delivery === 'courier' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Адрес доставки</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required style={{ width: '100%', padding: 12, border: '1px solid #bdbdbd', borderRadius: 6, fontSize: 16 }} />
              </div>
            )}
            <div style={{borderTop: '1.5px solid #bdbdbd', margin: '24px 0 18px 0', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontWeight: 600, fontSize: 18, color: '#222'}}>Итого к оплате:</span>
              <span style={{color: '#FFB300', fontWeight: 700, fontSize: 22}}>{total.toLocaleString('ru-RU')} ₸</span>
            </div>
            <button type="submit" style={{ width: '100%', background: '#FF6B00', color: '#fff', fontSize: 20, fontWeight: 600, border: 'none', borderRadius: 8, padding: '16px 0', cursor: 'pointer', marginTop: 10, letterSpacing: 0.5 }}>Оформить заказ</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout; 