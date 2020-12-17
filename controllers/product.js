const _ = require('lodash')
const Product = require('../models/product')
const { errorHandler } = require('../helpers/dbErrorHandler')

// find product by Id
exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate('category')
    .exec((err, product) => {
      if (err || !product) {
        res.status(400).json({
          error: 'Product not found',
        })
      }
      req.product = product

      next()
    })
}

// read product detail
exports.read = (req, res) => {
  return res.json(req.product)
}

// Create new Product
exports.create = async (req, res) => {
  //console.log(req.body)

  const { name, description, exchangeRatio, category } = req.body

  if (!name) {
    return res.status(400).json({
      error: 'Product must have name',
    })
  }
  if (!exchangeRatio) {
    return res.status(400).json({
      error: 'Product must have exchange ratio',
    })
  }
  if (!category) {
    return res.status(400).json({
      error: 'Product must have category',
    })
  }

  try {
    let product = await Product.findOne({ name })

    if (product) {
      return res.status(400).json({
        error: 'Product already exists',
      })
    }

    const newProduct = new Product({
      name: name,
      description: description || '',
      exchangeRatio: exchangeRatio,
      category: category,
    })

    const data = await newProduct.save()

    res.json(data)
  } catch (err) {
    return res.status(500).json({
      error: 'Server Error',
    })
  }
}

// update product
exports.update = async (req, res, next) => {
  const { name, description, exchangeRatio, category } = req.body

  let productToUpdate = req.product

  if (!name) {
    return res.status(400).json({
      error: 'Product must have name',
    })
  }
  if (!exchangeRatio) {
    return res.status(400).json({
      error: 'Product must have exchange ratio',
    })
  }
  if (!category) {
    return res.status(400).json({
      error: 'Product must have category',
    })
  }

  try {
    let product = await Product.findOne({ _id: productToUpdate._id })

    if (!product) {
      return res.status(400).json({
        error: 'Product does not exist',
      })
    }

    const fields = {
      name: name,
      description: description || '',
      exchangeRatio: exchangeRatio,
      category: category,
    }

    product = _.extend(product, fields)

    const data = await product.save()

    res.json(data)
  } catch (err) {
    return res.status(500).json({
      error: 'Server Error',
    })
  }
}

// remove product
exports.remove = (req, res) => {
  let product = req.product
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json({
      message: 'Product deleted successfully',
    })
  })
}

/**
 * Show Products
 */

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'

  Product.find()
    .populate('category')
    .sort([[sortBy, order]])
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: 'Products not found',
        })
      }

      res.send(products)
    })
}

/**
 * find the products with the same category
 * with the req product
 */

exports.listCategories = (req, res) => {
  Product.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Categories not found',
      })
    }
    res.json(categories)
  })
}

// Search by name
exports.listSearch = (req, res) => {
  const query = {}

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' }
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category
    }

    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(products)
    })
  }
}

