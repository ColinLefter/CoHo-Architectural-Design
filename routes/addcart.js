const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    
    // Initialize productList as an array if it's not already set
    if (!req.session.productList) {
        req.session.productList = [];
    }

    let productList = req.session.productList;

    // Extract product information from query parameters
    let id = req.query.id;
    let name = req.query.name;
    let price = req.query.price;

    // Redirect if any of the required parameters are missing
    if (!id || !name || !price) {
        res.redirect("/listprod");
        return;
    }

    // Convert id to a number and price to a float
    id = parseInt(id);
    price = parseFloat(price);

    // Find the product in the cart
    let productIndex = productList.findIndex(product => product.id === id);

    // If product exists, increment the quantity
    if (productIndex > -1) {
        productList[productIndex].quantity += 1;
    } else {
        // Add new product
        productList.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    req.session.productList = productList;
    res.render('showCartFullScreen', { productList: productList }, function(err, html) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.send(html);
        }
    });
});

module.exports = router;
