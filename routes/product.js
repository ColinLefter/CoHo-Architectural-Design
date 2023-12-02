const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    try {
        let pool = await sql.connect(dbConfig);

        // Get product details
        let productId = req.query.id;
        let productName = req.query.name;
        let productPrice = req.query.price;
        let productDesc = req.query.productDesc;

        // Convert to appropriate data types
        productId = parseInt(productId);
        productPrice = parseFloat(productPrice).toFixed(2);

        // Set the URL for the product image
        let imageURL = `/displayImage?id=${productId}`;

        // Render the product.handlebars template with data
        res.render('product', {
            productName: productName,
            productId: productId,
            productPrice: productPrice,
            imageURL: imageURL, // Pass imageURL to the handlebars template
            productDesc: productDesc
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;