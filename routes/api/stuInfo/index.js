const express = require('express');
const router = express.Router();


router.get('/' , require('./controller/get_StuInfo'))
router.post('/' , require('./controller/post_StuInfo'));

module.exports = router;
