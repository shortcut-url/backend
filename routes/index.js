const router = require('express').Router();

router.use('/session', require('./session'));
router.use('/url', require('./url'));

module.exports = router;
