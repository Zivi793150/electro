import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
// import DeliveryInfo from '../components/DeliveryInfo';
import '../styles/Product.css';
import '../styles/Checkout.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackFormSubmit, trackPurchaseComplete } from '../utils/analytics';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const [payment, setPayment] = useState('cashless');
  const [paymentMethod, setPaymentMethod] = useState('remote'); // remote, qr, transfer
  const [deliveryType, setDeliveryType] = useState('pickup'); // pickup, delivery
  const [selectedCity, setSelectedCity] = useState('Алматы');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [form, setForm] = useState({ firstName: '', phone: '', address: '', comment: '' });
  const [promo, setPromo] = useState('');
  const [siteSettings, setSiteSettings] = useState({ showPromoCode: false });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('https://electro-1-vjdu.onrender.com/api/information');
        if (response.ok) {
          const data = await response.json();
          if (data.information) {
            setSiteSettings({
              showPromoCode: data.information.showPromoCode || false
            });
          }
        }
      } catch (error) {
        console.log('Ошибка загрузки настроек сайта:', error);
      }
    };
    
    fetchSiteSettings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем обязательные поля
    if (!form.firstName || !form.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (deliveryType === 'delivery' && !form.address) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }
    
    // Формируем сообщение с деталями заказа
    const orderDetails = {
      product: product?.name,
      price: total,
      deliveryType: deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка',
      address: deliveryType === 'delivery' ? form.address : 'ул. Толе би 216Б, Алматы',
      payment: payment === 'cash' ? 'Наличными' : 'Безналичный расчет',
      paymentMethod: payment === 'cashless' ? (paymentMethod === 'remote' ? 'Удаленная оплата' : paymentMethod === 'qr' ? 'QR-код' : paymentMethod === 'transfer' ? 'Перевод' : '') : '',
      customer: form.firstName,
      phone: form.phone,
      comment: form.comment,
      total: finalTotal
    };
    
    // Сохраняем заказ в БД и отправляем в Telegram
    (async () => {
      let orderId = null;
      try {
        const resp = await fetch('https://electro-1-vjdu.onrender.com/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            phone: form.phone,
            address: deliveryType === 'delivery' ? form.address : '',
            comment: form.comment,
            items: product ? [{ productId: product._id, productName: product.name, price: Number(total), quantity: 1 }] : [],
            deliveryType,
            payment,
            paymentMethod: payment === 'cashless' ? paymentMethod : null,
            total: Number(finalTotal)
          })
        });
        const data = await resp.json();
        if (!data.success) throw new Error('Ошибка сохранения заказа');
        orderId = data.orderId || Date.now().toString();
      } catch (err) {
        console.log('Ошибка сохранения заказа:', err.message);
        orderId = Date.now().toString(); // fallback ID
      }
      try {
        await fetch('https://electro-1-vjdu.onrender.com/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.firstName,
            phone: form.phone,
            message: `Заказ через форму\nТовар: ${product?.name || ''}\nДоставка: ${orderDetails.deliveryType}${deliveryType==='delivery' ? `, адрес: ${form.address}` : ''}\nОплата: ${orderDetails.payment}${payment==='cashless' ? `, способ: ${orderDetails.paymentMethod}` : ''}\nСумма: ${Number(finalTotal).toFixed(0)} ₸\nКомментарий: ${form.comment || ''}`
          })
        });
      } catch (err) {
        console.log('Ошибка отправки в Telegram:', err.message);
      }
      
      // Отслеживаем завершение покупки
      if (product) {
        trackPurchaseComplete(
          orderId,
          product._id,
          product.name,
          finalTotal,
          'checkout_page'
        );
      }
      
      // Отслеживаем отправку формы
      trackFormSubmit('checkout_form', product?._id);
      
      // Переходим на страницу благодарности
      navigate('/thanks');
    })();
  };

  const total = product ? Number(product.price) : 0;
  const deliveryCost = deliveryType === 'delivery' ? 5000 : 0; // Стоимость доставки 5000 тенге
  const finalTotal = total + deliveryCost;

  return (
    <div className="product-page">
      <Header />
      <main className="product-main" style={{ minHeight: 500 }}>
        <div className="checkout-container">
          {/* Левая колонка - Форма */}
          <div className="checkout-products">
            <h1 className="product-title" style={{ marginBottom: 16 }}>Оформление заказа</h1>

            {/* 1. Контактные данные */}
            <div className="checkout-form-container" style={{marginBottom: 16}}>
              <div style={{fontWeight:700, marginBottom:12}}><span style={{color:'#FFB300'}}>1</span> Контактные данные</div>
              <div className="form-group">
                <label>Телефон</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+7 (___) ___-__-__" />
              </div>
              <div className="form-group">
                <label>Имя</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Введите имя кириллицей" />
              </div>
            </div>

            {/* 2. Доставка */}
            <div className="checkout-form-container" style={{marginBottom: 16}}>
              <div style={{fontWeight:700, marginBottom:12}}><span style={{color:'#FFB300'}}>2</span> Доставка</div>
              <div className="delivery-methods">
                <label style={{display:'flex', alignItems:'center', marginBottom:8, cursor:'pointer'}}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="pickup" 
                    checked={deliveryType === 'pickup'} 
                    onChange={() => setDeliveryType('pickup')}
                    style={{marginRight:6}}
                  />
                  Самовывоз
                </label>
                <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="delivery" 
                    checked={deliveryType === 'delivery'} 
                    onChange={() => setDeliveryType('delivery')}
                    style={{marginRight:6}}
                  />
                  Доставка
                </label>
              </div>
              
              {/* Дополнительные варианты для доставки */}
              {deliveryType === 'delivery' && (
                <div style={{marginTop:12, paddingLeft:20}}>
                  <div className="form-group">
                    <label>Укажите адрес</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      placeholder="Введите адрес доставки" 
                      required={deliveryType === 'delivery'}
                    />
                  </div>
                </div>
              )}
              {deliveryType === 'pickup' && (
                <div style={{marginTop:12, paddingLeft:20}}>
                  <div style={{color:'#666', fontSize:14, padding:'8px 12px', background:'#f5f5f5', borderRadius:4}}>
                    Самовывоз: ул. Толе би 216Б, Алматы
                  </div>
                </div>
              )}
            </div>

            {/* 3. Оплата */}
            <div className="checkout-form-container" style={{marginBottom: 16}}>
              <div style={{fontWeight:700, marginBottom:12}}><span style={{color:'#FFB300'}}>3</span> Оплата</div>
              <div className="payment-methods">
                {/* Безналичный расчёт */}
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cashless" 
                      checked={payment==='cashless'} 
                      onChange={()=>setPayment('cashless')}
                      style={{marginRight:6}}
                    />
                    Безналичный расчет
                  </label>
                  {/* Доп. способы сразу ПОД безналичным расчётом */}
                  {payment === 'cashless' && (
                    <div style={{marginLeft:20}}>
                      <div style={{marginBottom:8}}>
                        <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="remote" 
                            checked={paymentMethod==='remote'} 
                            onChange={()=>setPaymentMethod('remote')}
                            style={{marginRight:6}}
                          />
                          Удаленная оплата
                        </label>
                        <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="qr" 
                            checked={paymentMethod==='qr'} 
                            onChange={()=>setPaymentMethod('qr')}
                            style={{marginRight:6}}
                          />
                          QR-код
                        </label>
                        <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="transfer" 
                            checked={paymentMethod==='transfer'} 
                            onChange={()=>setPaymentMethod('transfer')}
                            style={{marginRight:6}}
                          />
                          Перевод
                        </label>
                      </div>
                      {paymentMethod === 'remote' && (
                        <div style={{color:'#666', fontSize:14, padding:'8px 12px', background:'#f5f5f5', borderRadius:4}}>
                          Оплата будет произведена после подтверждения заказа менеджером
                        </div>
                      )}
                      {paymentMethod === 'qr' && (
                        <div style={{color:'#666', fontSize:14, padding:'8px 12px', background:'#f5f5f5', borderRadius:4}}>
                          QR-код для оплаты будет отправлен после подтверждения заказа
                        </div>
                      )}
                      {paymentMethod === 'transfer' && (
                        <div style={{color:'#666', fontSize:14, padding:'8px 12px', background:'#f5f5f5', borderRadius:4}}>
                          Реквизиты для перевода будут отправлены после подтверждения заказа
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Наличными */}
                <label style={{display:'flex', alignItems:'center', cursor:'pointer', marginTop:8}}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash" 
                    checked={payment==='cash'} 
                    onChange={()=>setPayment('cash')}
                    style={{marginRight:6}}
                  />
                  Наличными
                </label>
              </div>
            </div>

            {/* Комментарий */}
            <div className="checkout-form-container">
              <div style={{fontWeight:700, marginBottom:12}}>Комментарий к заказу</div>
              <div className="form-group">
                <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Введите комментарий" />
              </div>
            </div>
          </div>

          {/* Правая колонка - Итоги */}
          <div className="checkout-form">
            <div style={{ height: '60px', marginBottom: 0 }}></div> {/* Невидимый блок для выравнивания с заголовком */}
            {product && (
              <div className="checkout-product-card">
                <img src={product.image || '/images/products/placeholder.png'} alt={product.name} style={{width: 72, height: 72, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0'}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:600}}>{product.name}</div>
                  <div style={{color:'#666', fontSize:14}}>1 шт.</div>
                </div>
                <div style={{fontWeight:700, color:'#1a2236'}}>{Number(total).toFixed(3).replace(/\.?0+$/, '')} ₸</div>
              </div>
            )}

            <div className="checkout-form-container" style={{marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <span style={{color:'#666'}}>Стоимость заказа:</span>
                <span style={{fontWeight:600}}>{Number(total).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
              </div>
              {deliveryCost > 0 && (
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <span style={{color:'#666'}}>Доставка:</span>
                  <span style={{fontWeight:600}}>{Number(deliveryCost).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
                </div>
              )}
              <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px solid #e0e0e0', paddingTop:12}}>
                <span style={{fontWeight:600}}>К оплате:</span>
                <span style={{color:'#FFB300', fontWeight:700}}>{Number(finalTotal).toFixed(3).replace(/\.?0+$/, '')} ₸</span>
              </div>
            </div>

            {siteSettings.showPromoCode && (
              <div className="checkout-form-container" style={{marginBottom:12}}>
                <div style={{display:'flex', gap:8}}>
                  <input type="text" placeholder="Ввести промокод" value={promo} onChange={(e)=>setPromo(e.target.value)} style={{flex:1}} />
                  <button type="button" className="submit-button" style={{padding:'12px 16px', width:160}}>Применить</button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
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