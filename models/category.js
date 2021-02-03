const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500,
      unique: true,
    },
    unit: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500,
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema)