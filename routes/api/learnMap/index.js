const express = require('express');
const router = express.Router();

router.get('/' , require('./controller/get_learnMap'));
module.exports = router;