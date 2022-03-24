const express = require('express');
const router = express.Router();

router.get('/', require('./controller/getSchedule'));

module.exports = router;
