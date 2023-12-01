const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = req.session.username || false;
    
    res.render('index', {
        title: "CoHo Architectural Design",
        username: username // Pass username to the view
    });
})

module.exports = router;
