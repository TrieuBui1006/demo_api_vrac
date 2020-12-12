const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema

const dechetByCategorySchema = new mongoose.Schema(
    {
      category: {type: ObjectId, ref: 'Category'},
      amount: Number
    },
    { timestamps: true }
  )

const dechetSchema = new mongoose.Schema(
  {
    order: {
        type: ObjectId,
        ref: 'Order',
    },
    dechetByCategory: [dechetByCategorySchema],
    user: {
        type: ObjectId,
        ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Dechet', dechetSchema)