const express = require('express')
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const {
  userById,
  read,
  update,
  purchaseHistory,
  dechetHistory,
  stats,
  totalDechetsByUser,
  totalDechets
} = require('../controllers/user')

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  })
})

router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory)
router.get('/dechets/by/user/:userId', requireSignin, isAuth, dechetHistory)
router.get('/dechets/total/user/:userId', requireSignin, isAuth, totalDechetsByUser)

router.get('/admin/stats/:userId', requireSignin, isAuth, isAdmin, stats)
router.get('/admin/total/dechetsByCategory/:userId', requireSignin, isAuth, isAdmin, totalDechets)


router.get('/user/:userId', requireSignin, isAuth, read)
router.put('/user/:userId', requireSignin, isAuth, update)

router.param('userId', userById)

module.exports = router