const router = require('express').Router();
const transformRoutes = require('./transform');

router.use('/', transformRoutes);

module.exports = router;
