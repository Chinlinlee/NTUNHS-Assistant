const express = require('express')
const router = express.Router()

router.get('/', require('./controller/get_Scores'))

router.get('/storeRank', require('./controller/get_StoredRank'))
router.post('/storeRank', require('./controller/post_StoreRank'))

router.get('/isSignOffCanUse', require('./controller/get_isSignOffCanUse'))
router.get('/signOffPrerank', require('./controller/get_SignOffPreRank'))

module.exports = router
