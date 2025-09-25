const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    comment: { type: String },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
        selectedVariant: { type: mongoose.Schema.Types.Mixed },
        selectedParameters: { type: mongoose.Schema.Types.Mixed }
      }
    ],
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    payment: { type: String, enum: ['cashless', 'cash'], default: 'cashless' },
    paymentMethod: { type: String, enum: ['remote', 'qr', 'transfer', null], default: 'remote' },
    total: { type: Number, required: true },
    clientSessionId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);


