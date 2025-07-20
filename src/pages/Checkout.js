import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Product.css';

const Checkout = () => {
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

  return (
    <div className="product-page">
      <Header />
      <main className="product-main" style={{ minHeight: 500 }}>
        <div className="product-container" style={{ maxWidth: 540, margin: '0 auto', alignItems: 'stretch' }}>
          <h1 className="product-title" style={{ textAlign: 'center', marginBottom: 24 }}>Оформление заказа</h1>
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #bdbdbd', borderRadius: 8, padding: 24, boxShadow: '0 4px 18px rgba(30,40,90,0.06)' }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Способ оплаты</label>
              <div style={{ display: 'flex', gap: 18 }}>
                <label><input type="radio" name="payment" value="card" checked={payment==='card'} onChange={()=>setPayment('card')} /> Картой онлайн</label>
                <label><input type="radio" name="payment" value="cash" checked={payment==='cash'} onChange={()=>setPayment('cash')} /> Наличными</label>
                <label><input type="radio" name="payment" value="kaspi" checked={payment==='kaspi'} onChange={()=>setPayment('kaspi')} /> Kaspi QR</label>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Доставка</label>
              <div style={{ display: 'flex', gap: 18 }}>
                <label><input type="radio" name="delivery" value="courier" checked={delivery==='courier'} onChange={()=>setDelivery('courier')} /> Курьером</label>
                <label><input type="radio" name="delivery" value="pickup" checked={delivery==='pickup'} onChange={()=>setDelivery('pickup')} /> Самовывоз</label>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Ваше имя</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 10, border: '1px solid #bdbdbd', borderRadius: 4, fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Телефон</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+7 (___) ___-__-__" style={{ width: '100%', padding: 10, border: '1px solid #bdbdbd', borderRadius: 4, fontSize: 16 }} />
            </div>
            {delivery === 'courier' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, color: '#222', display: 'block', marginBottom: 6 }}>Адрес доставки</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required style={{ width: '100%', padding: 10, border: '1px solid #bdbdbd', borderRadius: 4, fontSize: 16 }} />
              </div>
            )}
            <button type="submit" style={{ width: '100%', background: '#FF6B00', color: '#fff', fontSize: 18, fontWeight: 500, border: 'none', borderRadius: 6, padding: '14px 0', cursor: 'pointer', marginTop: 10 }}>Оформить заказ</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout; 