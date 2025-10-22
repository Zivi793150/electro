import React, { useState } from 'react';
import '../styles/Modal.css';

const RentalConsentModal = ({ isOpen, onClose, onAccept }) => {
  const [showTerms, setShowTerms] = useState(false);

  if (!isOpen) return null;

  const rentalTerms = `Условия аренды электроинструмента

1. Общие положения
• Аренда предоставляется на срок от 1 суток
• Для оформления аренды требуется документ, удостоверяющий личность
• Вносится залог в размере стоимости инструмента

2. Ответственность арендатора
• Арендатор несет полную ответственность за сохранность инструмента
• В случае повреждения или утери - полное возмещение стоимости
• Запрещена передача инструмента третьим лицам

3. Возврат инструмента
• Инструмент возвращается в чистом, рабочем состоянии
• При просрочке взимается штраф 50% от суточной стоимости за каждый день
• Залог возвращается после проверки инструмента

4. Контактная информация
По всем вопросам: +7 707 617 73 85`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: showTerms ? '600px' : '500px' }}>
        <div className="modal-header">
          <h3>{showTerms ? 'Условия аренды' : 'Подтверждение аренды'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body" style={{padding: '20px', textAlign: showTerms ? 'left' : 'center'}}>
          {!showTerms ? (
            <>
              <p style={{fontSize: '1.1rem', color: '#222', marginBottom: '20px', lineHeight: '1.6'}}>
                Если вы берете в аренду, соглашаетесь с{' '}
                <span 
                  onClick={() => setShowTerms(true)}
                  style={{
                    color: '#1e88e5',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  условиями пользования
                </span>
              </p>
              <button 
                onClick={onAccept}
                className="btn-submit"
                style={{
                  background: '#FF6B00',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 40px',
                  fontSize: '1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Ознакомлен
              </button>
            </>
          ) : (
            <>
              <div style={{
                fontSize: '0.95rem',
                color: '#333',
                lineHeight: '1.8',
                whiteSpace: 'pre-line',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {rentalTerms}
              </div>
              <button 
                onClick={() => setShowTerms(false)}
                className="btn-submit"
                style={{
                  background: '#1e88e5',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 40px',
                  fontSize: '1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  width: '100%'
                }}
              >
                Ознакомлен
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalConsentModal;
