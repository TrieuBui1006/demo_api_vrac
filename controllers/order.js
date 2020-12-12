const { Order, CartItem } = require('../models/order')
const User = require('../models/user')
const Dechet = require('../models/dechet')
const { errorHandler } = require('../helpers/dbErrorHandler')

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
  // console.log('CREATE ORDER', req.body)
  req.body.order.user = req.profile
  const order = new Order(req.body.order)
  
  // create order
  try {
    const data =  await order.save()

    // add order to user history
    try {
        let history=[]

        data.products.foreach((product) => {
            history.push({
                _id: product._id,
                name: product.name,
                exchangeRatio: product.exchangeRatio,
                masse: product.masse,
                orderId: data._id
            })
        })

        await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $push: { history: history } },
            { new: true }
        )
    } catch (error) {
        return res.status(400).json({
            error: 'Could not update user purchase history',
        })
    }

    // calcule dechet evite 
    try {
        const dechetInit = {
            order: data._id,
            user: req.profile
        }
        let dechetByCategory = []
        let arrTemp
        
        data.products.foreach(product => {
            arrTemp.push({
                category: product.category,
                amount: product.exchangeRatio*product.masse
            })
        })

        dechetByCategory = Array.from(arrTemp.reduce(
            (m, {category, amount}) => m.set(category, (m.get(category) || 0) + amount), new Map
          ), ([category, amount]) => ({category, amount}));

        dechetInit.dechetByCategory = dechetByCategory
    
        const dechetSave = new Dechet(dechetInit)

        const dechet = await dechetSave.save()

        res.json({
            order: data,
            dechet: dechet
        })
        
    } catch (error) {
        return res.status(400).json({ error: errorHandler(error) })
    }

  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) })
  }
}

exports.listOrders = (req, res) => {
  Order.find()
    .populate('user', '_id name')
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
