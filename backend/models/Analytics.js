const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['phone_click', 'product_view', 'form_submit', 'button_click', 'page_view']
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: String,
    default: null // Анонимные пользователи
  },
  sessionId: {
    type: String,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  page: String,
  referrer: String
});

// Индексы для быстрого поиска
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ productId: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
