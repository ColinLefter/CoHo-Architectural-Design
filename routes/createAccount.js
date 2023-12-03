const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.render('createAccount', {
        title: "Create Account",
    });
});

module.exports = router;
