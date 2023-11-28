const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	// Get product name to search for
	// TODO: Retrieve and display info for the product
    res.write('<h1><a href="/">CoHo Grocery</a></h2>');
    let productId = req.query.id
    let productName = req.query.name;
    let productPrice = req.query.price;

    productId = parseInt(productId);
    productPrice = parseFloat(productPrice);

    res.write("<table border='0'>");
    res.write(`<tr><h2>${productName}</td></tr>`)
	// TODO: If there is a productImageURL, display using IMG tag
    // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.

    // NOTE: we are using client side scripts to handle the case in which there is no image -- and in that case we don't display anything
    res.write('<script type="text/javascript">');
    res.write('function handleImageError(image) { image.style.display = "none"; }');
    res.write('</script>');
    
    res.write(`<img src='/displayImage?id=${productId}' alt='Product Image' style='max-width:100%; max-height:100%; height:auto; width:auto;' onerror='handleImageError(this)'>`);

    res.write(`<tr><td><strong>Id:   </strong></td><td>${productId}</td></tr>`)
    res.write(`<tr><td><strong>Price:        </strong></td><td>$${Number(productPrice).toFixed(2)}</td></tr>`)
    res.write("</table>");
	// TODO: Add links to Add to Cart and Continue Shopping
    res.write(`<h3><a href="/addcart?id=${productId}&name=${productName}&price=${productPrice}">Add to cart</a></h2>`); // add to cart
    res.write('<h3><a href="listprod">Continue Shopping</a></h2>'); // Continue Shopping
            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;