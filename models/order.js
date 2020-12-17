const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    exchangeRatio: Number,
    weight: Number,
    category: {type: ObjectId, ref: 'Category'}
  },
  { timestamps: true }
)

const CartItem = mongoose.model('CartItem', CartItemSchema)

const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema],
    status: {
        type: String,
        default: 'Not processed',
        enum: [
          'Not processed',
          'Processing',
          'Shipped',
          'Delivered',
          'Cancelled',
        ], // enum means string objects
      },
    user: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', OrderSchema)

module.exports = { Order, CartItem }
