const User = require('../models/user')
const {Order}  = require('../models/order')
const Dechet = require('../models/dechet')

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
    .populate('dechetByCategory.category', 'name')
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
