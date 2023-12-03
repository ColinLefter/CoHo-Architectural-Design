const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = req.session.productList || [];
    let total = 0;

    productList.forEach(product => {
        if (product) {
            product.subtotal = (product.quantity * product.price).toFixed(2);
            total += parseFloat(product.subtotal);
        }
    });

    res.render('showCartFullSCreen', {
        title: 'Your Shopping Cart',
        productList: productList,
        total: total.toFixed(2),
        hasProducts: productList.length > 0
    });
});

module.exports = router;