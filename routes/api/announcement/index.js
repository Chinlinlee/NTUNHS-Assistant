const express = require('express');
const router = express.Router();

router.get('/', require('./controller/get_Announcement'));

module.exports = router;
