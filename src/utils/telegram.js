// Утилита для отправки форм в Telegram
// В реальном проекте здесь будет интеграция с Telegram Bot API

export const sendToTelegram = async (formData) => {
  try {
    // Здесь будет реальная отправка в Telegram
    // Пока что просто логируем данные
    
    const message = `
🔔 Новая заявка с сайта!

👤 Имя: ${formData.name}
📞 Телефон: ${formData.phone}
💬 Сообщение: ${formData.message || 'Не указано'}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `;

    console.log('Отправка в Telegram:', message);
    
    // В реальном проекте здесь будет fetch запрос к Telegram Bot API
    // const response = await fetch('/api/send-telegram', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     chat_id: 'YOUR_CHAT_ID',
    //     text: message,
    //     parse_mode: 'HTML'
    //   })
    // });
    
    return { success: true, message: 'Заявка успешно отправлена!' };
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    return { success: false, message: 'Ошибка отправки заявки' };
  }
};

// Функция для валидации формы
export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.name.trim()) {
    errors.name = 'Имя обязательно для заполнения';
  }
  
  if (!formData.phone.trim()) {
    errors.phone = 'Телефон обязателен для заполнения';
  } else if (!/^[+]?[0-9\s\-()]{10,}$/.test(formData.phone)) {
    errors.phone = 'Введите корректный номер телефона';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 