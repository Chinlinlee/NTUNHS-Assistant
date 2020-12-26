const express = require('express');
const router = express.Router();

router.get('/' , require('./controller/get_History_Scores'));

module.exports = router;