const {Dechet, DechetByCategory} = require('../models/dechet')
const { errorHandler } = require('../helpers/dbErrorHandler')

// find dechet by Id
exports.dechetById = (req, res, next, id) => {
    Dechet.findById(id)
    .populate('dechetByCategory.category', 'name')
    .exec((err, dechet) => {
    if (err || !dechet) {
        return res.status(400).json({
        error: errorHandler(err),
        })
    }
    req.dechet = dechet
    next()
    })
}

exports.dechetByOrderId = (req, res) => {
    const queryParam = {}
    queryParam['order'] = req.order._id
    Dechet.find(queryParam)
        .populate('dechetByCategory.category', 'name')
        .exec((err, dechet) => {
        if (err || !dechet) {
            return res.status(400).json({
                error: 'Order not found',
              })
        }
        res.json(dechet)
    })
}