const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

function getCurrentDateTime() {
    let now = new Date();

    // Formatting the date part
    let datePart = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format

    // Formatting the time part
    let timePart = now.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Combining date and time
    return `${datePart} ${timePart}.0`;
}

let currentDateTime = getCurrentDateTime();
console.log(currentDateTime);

router.get('/', async function(req, res, next) {
    let productList;
    let customer;
    let orderId;

    // Declare these variables at the beginning
    let productId, productName, productPrice, productQuantity;

    /**
    Determine if there are products in the shopping cart
    If either are not true, display an error message
    **/
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList;
    } else {
        // Set an error message and render the template
        return res.render('order', { error: 'Your shopping cart is empty! Cannot check out.', orderSummary: null });
    }

    let customerId = req.query.customerId; // from the form on checkout.js
    let password = req.query.password; // from the form on checkout.js

    if (!customerId || isNaN(customerId)) {
        // Set an error message and render the template
        return res.render('order', { error: 'Invalid or missing customer ID.', orderSummary: null });
    }

    // Now we set up the connection to the DB:
    try {
        let pool = await sql.connect(dbConfig);

        // Check if the password matches what is in the database
        let passwordCheckQuery = "SELECT password FROM customer WHERE customerId = @customerId";

        let foundPassword = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(passwordCheckQuery);

        if (!foundPassword.recordset.length > 0 || foundPassword.recordset[0].password != password) {
            // Set an error message and render the template
            return res.render('order', { error: 'Invalid password.', orderSummary: null });
        }

        // Initialize variables for order summary
        let totalAmount = 0;
        let orderSummary = [];

        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product) { // Skip if there is no product
                continue;
            }
            // Extract product information
            productId = product.id;
            productName = product.name;
            productPrice = product.price;
            productQuantity = product.quantity;

            // Calculate the subtotal for this product
            let subtotal = productQuantity * productPrice;
            totalAmount += subtotal;

            // Create an object for the product in the order summary
            orderSummary.push({
                productId,
                productName,
                productQuantity,
                productPrice: productPrice.toFixed(2),
                subtotal: (subtotal).toFixed(2),
            });
        }

        // Insert order summary into the database
        let insertSummaryQuery =
            "INSERT INTO ordersummary(orderDate, customerId, totalAmount) " +
            "VALUES(@orderDate, @customerId, @totalAmount)";

        await pool.request()
            .input('orderDate', sql.DateTime, currentDateTime)
            .input('customerId', sql.Int, customerId)
            .input('totalAmount', sql.Int, totalAmount)
            .query(insertSummaryQuery);

        // Retrieve the order ID
        let getOrderId =
            "SELECT orderId FROM ordersummary " +
            "WHERE customerId = @customerId AND orderDate = @orderDate ";

        let orderIdData = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.DateTime, currentDateTime)
            .query(getOrderId);

        orderId = orderIdData.recordset[0].orderId;

        // This loop inserts the ordered products into the database
        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product) {
                continue;
            }
            productId = product.id;
            productName = product.name;
            productPrice = parseFloat(product.price);
            productQuantity = product.quantity;

            // Insert the product into the order details
            let productInsertionQuery =
                "INSERT INTO orderproduct(orderId, productId, quantity, price) " +
                "VALUES(@orderId, @productId, @quantity, @price)";

            await pool.request()
                .input('orderId', sql.Int, orderId) // Bind orderId to orderId
                .input('productId', sql.Int, productId) // Bind productId to productId
                .input('quantity', sql.Int, productQuantity) // Bind quantity to productQuantity
                .input('price', sql.Decimal(10, 2), productPrice) // Bind price to productPrice
                .query(productInsertionQuery);
        }

        /** Print out order summary **/
        let orderSummaryData = {
            orderId,
            customerId,
            customer,
            totalAmount: totalAmount.toFixed(2),
            currentDateTime,
            productList: orderSummary,
        };

        // Render the order summary template
        /** Clear session/cart **/
        req.session.productList = [];
        return res.render('order', { error: null, orderSummary: orderSummaryData });

    } catch (err) {
        console.error(err);
        // Set an error message and render the template
        return res.render('order', { error: 'An error occurred while processing your order.', orderSummary: null });
    }
});

module.exports = router;