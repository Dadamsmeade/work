const express = require('express');
const router = express.Router();
const {
    transformController: { exec },
} = require('../controllers');

['get', 'post', 'delete', 'put'].forEach(method => {
    router[method]('/:pcid?/:service/:type/', exec);
});

module.exports = router;
