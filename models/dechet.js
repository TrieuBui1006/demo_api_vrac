const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema

const DechetByCategorySchema = new mongoose.Schema(
    {
      category: {type: ObjectId, ref: 'Category'},
      amount: Number
    },
    { timestamps: true }
)

const DechetByCategory = mongoose.model('DechetByCategory', DechetByCategorySchema)

const DechetSchema = new mongoose.Schema(
  {
    order: {
        type: ObjectId,
        ref: 'Order',
    },
    dechetByCategory: [DechetByCategorySchema],
    user: {
        type: ObjectId,
        ref: 'User'
    }
  },
  { timestamps: true }
)

const Dechet = mongoose.model('Dechet', DechetSchema)

module.exports = { Dechet, DechetByCategory }