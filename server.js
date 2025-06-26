const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Пример эндпоинта для приёма формы обратной связи
app.post('/api/feedback', (req, res) => {
  console.log('Получена заявка:', req.body);
  // Здесь можно добавить отправку в Telegram/email и т.д.
  res.json({ success: true, message: 'Заявка успешно получена на сервере!' });
});

app.get('/', (req, res) => {
  res.send('Backend работает!');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
}); 