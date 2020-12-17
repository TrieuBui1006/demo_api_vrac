const express = require('express')
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const {dechetById, dechetByOrderId} = require('../controllers/dechet')
const {orderById} =  require('../controllers/order')
const {userById} = require('../controllers/user')

router.get('/dechet/byOrder/:userId/:orderId', requireSignin, isAuth, dechetByOrderId)

router.param('dechetId', dechetById)
router.param('orderId', orderById)
router.param('userId', userById)

module.exports = router