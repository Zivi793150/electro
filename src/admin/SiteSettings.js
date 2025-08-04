import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://electro-a8bl.onrender.com/api/information';

const SiteSettings = ({ onLogout }) => {
  const navigate = useNavigate();
  const [information, setInformation] = useState({
    city: 'Алматы',
    deliveryInfo: {
      freeDelivery: 'Бесплатная доставка по городу',
      freeDeliveryNote: 'Сегодня — БЕСПЛАТНО',
      pickupAddress: 'ул. Толе би 216Б',
      pickupInfo: 'Сегодня с 9:00 до 18:00 — больше 5',
      deliveryNote: 'Срок доставки рассчитывается менеджером после оформления заказа'
    },
    contactInfo: {
      phone: '+7 707 703-31-13',
      phoneName: 'Виталий',
      officePhone: '+7 727 347 07 53',
      officeName: 'Офис',
      address: 'ул. Казыбаева 9/1 г. Алматы',
      email: 'info@промкраска.kz'
    },
    companyInfo: {
      name: 'ТОО «Long Partners»',
      bin: '170540006129',
      iik: 'KZ256018861000677041',
      kbe: '17',
      bank: 'АО «Народный Банк Казахстана»'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        if (data.information) {
          setInformation(data.information);
        }
      } else {
        console.log('Информация не найдена, используются значения по умолчанию');
      }
    } catch (error) {
      console.log('Ошибка загрузки информации, используются значения по умолчанию:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ information })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Информация успешно сохранена!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          throw new Error(data.error || 'Ошибка сохранения');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
    } catch (error) {
      setMessage(`❌ Ошибка при сохранении информации: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updateDeliveryInfo = (field, value) => {
    setInformation(prev => ({
      ...prev,
      deliveryInfo: {
        ...prev.deliveryInfo,
        [field]: value
      }
    }));
  };

  const updateContactInfo = (field, value) => {
    setInformation(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const updateCompanyInfo = (field, value) => {
    setInformation(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
        <div style={{maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
          <div style={{padding: 32, textAlign: 'center'}}>Загрузка настроек...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{minHeight: '100vh', background: '#f5f7fa', padding: '32px 0'}}>
      <div style={{maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 10, border: '1.5px solid #e0e0e0', padding: 24}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
          <h2 className="admin-header" style={{fontWeight: 700, fontSize: 24, color: '#1a2236', margin: 0}}>Настройки сайта</h2>
          <div>
            <button onClick={() => navigate('/admin/products')} style={{background: '#6c757d', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>📦 Товары</button>
            <button onClick={() => navigate('/admin/pickup-points')} style={{background: '#28a745', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>🏬 Пункты самовывоза</button>
            <button onClick={handleSave} disabled={saving} style={{background: '#007bff', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', marginRight: 12, cursor: 'pointer'}}>
              {saving ? 'Сохранение...' : '💾 Сохранить'}
            </button>
            <button onClick={onLogout} style={{background: '#e53935', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer'}}>Выйти</button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Основная информация */}
        <div style={{background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, padding: 20, marginBottom: 20}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#495057'}}>🏙️ Основная информация</h3>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Город по умолчанию</label>
            <input 
              value={information.city} 
              onChange={(e) => setInformation(prev => ({...prev, city: e.target.value}))}
              placeholder="Например: Алматы"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
            <small style={{color: '#6c757d', fontSize: 12}}>Отображается как "Ваш город: [название]"</small>
          </div>
        </div>

        {/* Информация о доставке */}
        <div style={{background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, padding: 20, marginBottom: 20}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#495057'}}>🚚 Информация о доставке</h3>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Бесплатная доставка</label>
            <input 
              value={information.deliveryInfo.freeDelivery} 
              onChange={(e) => updateDeliveryInfo('freeDelivery', e.target.value)}
              placeholder="Бесплатная доставка по городу"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Примечание к доставке</label>
            <input 
              value={information.deliveryInfo.freeDeliveryNote} 
              onChange={(e) => updateDeliveryInfo('freeDeliveryNote', e.target.value)}
              placeholder="Сегодня — БЕСПЛАТНО"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Адрес самовывоза</label>
            <input 
              value={information.deliveryInfo.pickupAddress} 
              onChange={(e) => updateDeliveryInfo('pickupAddress', e.target.value)}
              placeholder="ул. Толе би 216Б"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Информация о самовывозе</label>
            <input 
              value={information.deliveryInfo.pickupInfo} 
              onChange={(e) => updateDeliveryInfo('pickupInfo', e.target.value)}
              placeholder="Сегодня с 9:00 до 18:00 — больше 5"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{marginBottom: 0}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Примечание о сроке доставки</label>
            <input 
              value={information.deliveryInfo.deliveryNote} 
              onChange={(e) => updateDeliveryInfo('deliveryNote', e.target.value)}
              placeholder="Срок доставки рассчитывается менеджером после оформления заказа"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
        </div>

        {/* Контактная информация */}
        <div style={{background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, padding: 20, marginBottom: 20}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#495057'}}>📞 Контактная информация</h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16}}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Телефон</label>
              <input 
                value={information.contactInfo.phone} 
                onChange={(e) => updateContactInfo('phone', e.target.value)}
                placeholder="+7 707 703-31-13"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Имя контакта</label>
              <input 
                value={information.contactInfo.phoneName} 
                onChange={(e) => updateContactInfo('phoneName', e.target.value)}
                placeholder="Виталий"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16}}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Офисный телефон</label>
              <input 
                value={information.contactInfo.officePhone} 
                onChange={(e) => updateContactInfo('officePhone', e.target.value)}
                placeholder="+7 727 347 07 53"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Название офиса</label>
              <input 
                value={information.contactInfo.officeName} 
                onChange={(e) => updateContactInfo('officeName', e.target.value)}
                placeholder="Офис"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Адрес</label>
            <input 
              value={information.contactInfo.address} 
              onChange={(e) => updateContactInfo('address', e.target.value)}
              placeholder="ул. Казыбаева 9/1 г. Алматы"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{marginBottom: 0}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Email</label>
            <input 
              value={information.contactInfo.email} 
              onChange={(e) => updateContactInfo('email', e.target.value)}
              placeholder="info@промкраска.kz"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
        </div>

        {/* Информация о компании */}
        <div style={{background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, padding: 20, marginBottom: 20}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#495057'}}>🏢 Информация о компании</h3>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Название компании</label>
            <input 
              value={information.companyInfo.name} 
              onChange={(e) => updateCompanyInfo('name', e.target.value)}
              placeholder="ТОО «Long Partners»"
              style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
            />
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16}}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>БИН</label>
              <input 
                value={information.companyInfo.bin} 
                onChange={(e) => updateCompanyInfo('bin', e.target.value)}
                placeholder="170540006129"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>ИИК</label>
              <input 
                value={information.companyInfo.iik} 
                onChange={(e) => updateCompanyInfo('iik', e.target.value)}
                placeholder="KZ256018861000677041"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0}}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>КБЕ</label>
              <input 
                value={information.companyInfo.kbe} 
                onChange={(e) => updateCompanyInfo('kbe', e.target.value)}
                placeholder="17"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14}}>Банк</label>
              <input 
                value={information.companyInfo.bank} 
                onChange={(e) => updateCompanyInfo('bank', e.target.value)}
                placeholder="АО «Народный Банк Казахстана»"
                style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', fontSize: 14}}
              />
            </div>
          </div>
        </div>

        <div style={{textAlign: 'center', padding: 20, borderTop: '1px solid #e9ecef'}}>
          <small style={{color: '#6c757d', fontSize: 12}}>
            💡 Все изменения сохраняются автоматически и сразу отображаются на сайте
          </small>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings; 