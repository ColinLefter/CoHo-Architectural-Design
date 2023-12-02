const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let id = req.query.id;
    let idVal = parseInt(id);
    if (isNaN(idVal)) {
        res.end();
        return;
    }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "SELECT imageUrl, productImage FROM product JOIN productImageData ON product.productId = productImageData.productId";

            result = await pool.request()
                .input('productId', sql.Int, idVal)
                .query(sqlQuery);        

            if (result.recordset.length === 0) {
                console.log("No image record");
                res.end();
                return;
            } else {
                let product = result.recordset[0];
                if (product.productImage) {
                    res.setHeader('Content-Type', 'image/jpeg'); // we are using the image of the product, not the URL
                    res.write(product.productImage);
                    res.end();
                } else if (product.imageUrl) {
                    // If no binary image, redirect to the URL
                    res.redirect(product.imageUrl); // if we have no binary image, we need to redirect to the URL
                } else {
                    res.status(404).send('Image not available');
                }
            }
            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
