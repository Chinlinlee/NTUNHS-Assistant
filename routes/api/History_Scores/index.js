const express = require('express');
const router = express.Router();

router.get('/' , require('./controller/get_History_Scores'));

router.post('/' , require('./controller/post_storeHistoryScore'));
module.exports = router;