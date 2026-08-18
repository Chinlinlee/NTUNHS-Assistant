const express = require('express');
const router = express.Router();

router.get('/', require('./controller/get_Course'));
router.post('/savePreSchedule', require('./controller/save_PreSchedule'));
router.get('/getPreSchedule', require('./controller/get_PreSchedule'));

module.exports = router;
