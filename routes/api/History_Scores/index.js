const express = require('express');
const router = express.Router();

router.get('/' , require('./controller/get_History_Scores'));
router.get('/storedHistoryScore' , require('./controller/get_storedHistoryScore'));

router.post('/' , require('./controller/post_storeHistoryScore'));
module.exports = router;