const router = require('express').Router();
const publicTransformRoutes = require('./publicTransform');

router.use('/', publicTransformRoutes);

module.exports = router;
