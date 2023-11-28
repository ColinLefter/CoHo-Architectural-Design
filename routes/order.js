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
    res.setHeader('Content-Type', 'text/html');
    res.write("<h1>Your Order Summary</h1>");

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
        // we need to write an error message
        res.write("<h2>Your shopping cart is empty! Cannot check out.</h2>");
    }

    let customerId = req.query.customerId; // from the form on checkout.js
    let password = req.query.password; // from the form on checkout.js

    if (!customerId || isNaN(customerId)) { // there is a chance that this is always true
        res.write("<h2>Invalid or missing customer ID.</h2>");
        res.end();
        return; // End things here
    }

    // now we set up the connection to the db:
    try {
        let pool = await sql.connect(dbConfig);

        // we need to check if the password matches what is in the database
        let passwordCheckQuery = "SELECT password FROM customer WHERE customerId = @customerId";
    
        let foundPassword = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(passwordCheckQuery);
        
        if (!foundPassword.recordset.length > 0 || foundPassword.recordset[0].password != password) {
            res.write("<h2>Invalid password.</h2>");
            res.end();
            return;
        }

        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th></tr>");

        // first step: get the customer information
        let totalAmount = 0;

        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product) { // if we have no product, we skip this iteration
                continue;
            }
            // "id": id,
            // "name": name,
            // "price": price,
            // "quantity": 1
            productId = product.id;
            productName = product.name;
            productPrice = product.price;
            productQuantity = product.quantity;

            totalAmount = totalAmount + product.quantity * product.price;

            res.write(`<tr><td>${productId}</td>`);
            res.write(`<td>${productName}</td>`);
            res.write(`<td align="center">${productQuantity}</td>`);
            res.write(`<td align="right">$${productPrice.toFixed(2)}</td>`);
            res.write(`<td align="right">$${(productQuantity * productPrice).toFixed(2)}</td></tr>`);
        }

        res.write(`</table>`); // Close the table tag

        // now we have the product info
        let customerResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query("SELECT firstName, lastName FROM customer WHERE customerId = @customerId");
        if (customerResult.recordset.length > 0) {
            let customerData = customerResult.recordset[0];
            customer = `${customerData.firstName} ${customerData.lastName}`;
        }
        
        let currentDateTime = getCurrentDateTime();

        let insertSummaryQuery = 
            "INSERT INTO ordersummary(orderDate, customerId, totalAmount) "+ 
            "VALUES(@orderDate, @customerId, @totalAmount)";

        await pool.request()
            .input('orderDate', sql.DateTime, currentDateTime)
            .input('customerId', sql.Int, customerId)
            .input('totalAmount', sql.Int, totalAmount)
            .query(insertSummaryQuery)
        
        // now we can extract the order id
        let getOrderId = 
            "SELECT orderId FROM ordersummary "+
            "WHERE customerId = @customerId AND orderDate = @orderDate ";
        
        let orderIdData = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.DateTime, currentDateTime)
            .query(getOrderId)
        
        orderId = orderIdData.recordset[0].orderId;
        
        // this second for loop actually inputs the ordered product
        // we need to run a similar for loop to the above
        // because we can only have the order id after the order summary query has been executed
        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product) {
                continue;
            }
            productId = product.id;
            productName = product.name;
            productPrice = parseFloat(product.price)
            productQuantity = product.quantity;

            totalAmount = totalAmount + product.quantity * product.price;

            let productInsertionQuery = 
                "INSERT INTO orderproduct(orderId, productId, quantity, price) "+
                "VALUES(@orderId, @productId, @quantity, @price)";
            
            await pool.request()
                .input('orderId', sql.Int, orderId) // Bind orderId to orderId
                .input('productId', sql.Int, productId) // Bind productId to productId
                .input('quantity', sql.Int, productQuantity) // Bind quantity to productQuantity
                .input('price', sql.Decimal(10, 2), productPrice) // Bind price to productPrice
                .query(productInsertionQuery);
            }
        }
    catch (err) {
        console.error(err);
        res.write(JSON.stringify(err));
        res.write('</body></html>');
        res.end();
    }
    /** Print out order summary **/
    res.write("<h1>Order completed. Will be shipped soon...</h1>");
    res.write(`<h1>Your order reference number is: ${orderId} </h1>`);
    res.write(`<h1>Shipping to customer: ${customerId} Name: ${customer} </h1>`);
    /** Clear session/cart **/
    req.session.productList = [];
    res.end();
});

module.exports = router;