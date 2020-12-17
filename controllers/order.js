const { Order, CartItem } = require('../models/order')
const User = require('../models/user')
const {Dechet} = require('../models/dechet')
const { errorHandler } = require('../helpers/dbErrorHandler')
const {calculByCategory} = require('../helpers/calculDechetByCategory')

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
      .populate('products.product', 'name exchangeRatio masse')
      .exec((err, order) => {
        if (err || !order) {
          return res.status(400).json({
            error: errorHandler(err),
          })
        }
        req.order = order
        next()
      })
}

exports.create = async (req, res) => {
  req.body.order.user = req.profile
  const order = new Order(req.body.order)
  // create order
    try {
        const data = await order.save()

        // calcule dechet evite 
        const dechetInit = {
            order: data._id,
            user: req.profile._id
        }

        dechetInit.dechetByCategory = await calculByCategory(data)

        const dechetSave = new Dechet(dechetInit)
        
        const dechet = await dechetSave.save()

        // update user history
        let history=[]

        data.products.forEach((product) => {
            history.push({
                _id: product._id,
                name: product.name,
                exchangeRatio: product.exchangeRatio,
                weight: product.weight,
                orderId: data._id
            })
        })

        const updateUser = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $push: { history: history } },
            { new: true }
        )

        res.json({data, dechet, updateUser})
        
    } catch (error) {
        return res.status(400).json({
            error: 'Could not save order',
        })
    }
}

exports.listOrders = (req, res) => {
  Order.find()
    .populate('user', '_id name')
    .populate('products.category', 'name')
    .sort('-create')
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(orders)
    })
}

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path('status').enumValues)
}

exports.updateOrderStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(order)
    }
  )
}
