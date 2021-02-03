const User = require('../models/user')
const Category = require('../models/category')
const Product = require('../models/product')
const {Order}  = require('../models/order')
const {Dechet} = require('../models/dechet')
const {calculTotalByCategory, calculTotalDechets} = require ('../helpers/calculDechetByCategory')

// Find user by id
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      })
    }

    req.profile = user
    next()
  })
}

// read user by Id
exports.read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined

  const {role, history, _id, name, email, createdAt, updatedAt, __v} = req.profile
  const Authtoken = req.headers.authorization.split(' ')
  const token = Authtoken[1]
  return res.json({token, user: {role, history, _id, name, email, createdAt, updatedAt, __v}})
}

// update user
exports.update = (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { name, password } = req.body

  User.findOne({ _id: req.profile._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      })
    }
    if (!name) {
      return res.status(400).json({
        error: 'Name is required',
      })
    } else {
      user.name = name
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password should be min 6 characters long',
        })
      } else {
        user.password = password
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log('USER UPDATE ERROR', err)
        return res.status(400).json({
          error: 'User update failed',
        })
      }
      updatedUser.hashed_password = undefined
      updatedUser.salt = undefined
      res.json(updatedUser)
    })
  })
}

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate('user', '_id name')
    .populate('products.category', 'name unit')
    .sort({ createdAt: 'desc' })
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(orders)
    })
}

exports.dechetHistory = (req, res) => {
  Dechet.find({ user: req.profile._id })
    .populate('user', '_id name')
    .populate('dechetByCategory.category', 'name unit')
    .sort({ createdAt: 'desc' })
    .exec((err, dechets) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(dechets)
    })
}

exports.userStats = async (req, res) => {
  const userId = req.profile._id
  try {
    const numberOfOrders = await Order.find({user: userId}).count()
    // let dechets =  await Dechet.find({ user: req.profile._id })

    // if(!dechets) {
    //   return res.status(404).json({
    //     error: "cannot found user's dechets !"
    //   })
    // }

    // let totalDechets = await calculTotalDechets(dechets)

    res.json({
      user: dechets[0].user,
      numberOfOrders: numberOfOrders,
      // totalDechets: totalDechets
    })

  } catch (error) {
    return res.status(400).json({
      error: 'cannot get user stats!'
    })
  }
}

exports.stats = async (req, res) => {
  try {
    const numberOfUser = await User.find().count()
    const numberOfCategory = await Category.find().count()
    const numberOfProduct = await Product.find().count()
    const numberOfOrder = await Order.find().count()

    res.json({
      numberOfUsers: numberOfUser,
      numberOfCategories: numberOfCategory,
      numberOfProducts: numberOfProduct,
      numberOfOrders: numberOfOrder
    })
  } catch (error) {
    return res.status(400).json({
      error: 'cannot get stats!'
    })
  }
}

exports.totalDechetsByUser = async (req, res) => {
  try {
    let dechets = await Dechet.find({ user: req.profile._id })
    .populate('user', '_id name')
    .populate('dechetByCategory.category', 'name unit')
    .sort({ createdAt: 'desc' })

    if(!dechets) {
      return res.status(404).json({
        error: "cannot found user's dechets !"
      })
    }

    let totalDechets = await calculTotalByCategory(dechets)

    res.json({
      user: dechets[0].user,
      totalDechetsByCategory: totalDechets
    })

  } catch (error) {
    return res.status(400).json({
      error: 'cannot get total !'
    })
  }
}

exports.totalDechets = async (req, res) => {
  try {
    let dechets = await Dechet.find()
    .populate('dechetByCategory.category', 'name unit')
    .sort({ createdAt: 'desc' })

    if(!dechets) {
      return res.status(404).json({
        error: "cannot found user's dechets !"
      })
    }

    let totalDechets = await calculTotalByCategory(dechets)

    res.json({
      totalDechetsByCategory: totalDechets
    })

  } catch (error) {
    return res.status(400).json({
      error: 'cannot get total !'
    })
  }
}