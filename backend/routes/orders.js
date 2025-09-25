const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Создать заказ
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    const order = await Order.create({
      firstName: data.firstName,
      phone: data.phone,
      address: data.address,
      comment: data.comment,
      items: data.items || [],
      deliveryType: data.deliveryType,
      payment: data.payment,
      paymentMethod: data.paymentMethod,
      total: data.total,
      clientSessionId: data.clientSessionId,
    });
    res.json({ success: true, order });
  } catch (err) {
    console.error('Ошибка создания заказа:', err);
    res.status(500).json({ success: false, error: 'Ошибка создания заказа' });
  }
});

// Список заказов (для админки)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Ошибка получения заказов:', err);
    res.status(500).json({ success: false, error: 'Ошибка получения заказов' });
  }
});

module.exports = router;


