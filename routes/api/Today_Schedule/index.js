const express = require('express');
const router = express.Router();

router.get('/', require('./controller/get_Today_Schedule.js'));

module.exports = router;
