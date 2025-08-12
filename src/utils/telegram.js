// Утилита для отправки форм в Telegram

export const sendToTelegram = async (formData, product = null) => {
  try {
    // Определяем базовый URL API (локально шлём на порт сервера)
    // Всегда шлём на прод-сервер (Render), чтобы избежать 404 от CRA dev-сервера
    const API_BASE = 'https://electro-a8bl.onrender.com';

    // Отправляем данные на наш API endpoint
    const response = await fetch(`${API_BASE}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
        product: product
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: 'Заявка успешно отправлена!' };
    } else {
      console.error('Ошибка API:', result.error);
      return { success: false, message: result.error || 'Ошибка отправки заявки' };
    }
    
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