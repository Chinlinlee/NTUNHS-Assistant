const express = require('express');
const router = express.Router();

router.post('/', require('./controller/post_CTE'));
router.get('/', require('./controller/get_CTE'));
module.exports = router;
