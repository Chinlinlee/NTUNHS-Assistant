const express = require('express');
const router = express.Router();

router.get('/', require('./controller/get_learnMap'));
router.get('/tookcourse', require('./controller/get_tookCourse'));

module.exports = router;
