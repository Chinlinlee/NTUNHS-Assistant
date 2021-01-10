const express = require('express');
const router = express.Router();

router.get('/' , require('./controller/get_Course_Search'));

router.get('/Place' , require('./controller/get_Place'));

router.get('/Teacher' , require('./controller/get_Teacher'));


router.get('/GetSem'  ,require('./controller/get_Sem'));

module.exports = router;