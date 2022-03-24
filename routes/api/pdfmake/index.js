const router = require('express').Router();

router.get('/', require('./controller/get_pdfmake'));
router.get('/docx', require('./controller/get_docx'));
router.get('/xlsx', require('./controller/get_xlsx'));
router.post('/picture', require('./controller/post_picture'));
router.post('/storeData', require('./controller/post_storeData'));
router.get('/storeData', require('./controller/get_storeData'));
module.exports = router;
