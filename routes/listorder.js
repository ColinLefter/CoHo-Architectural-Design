const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

/**
Useful code for formatting currency:
    let num = 2.87879778;
    num = num.toFixed(2);
**/
let currFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // or any other currency you need
  });

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>Order List</title>');
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let SQL1 = 
                "SELECT o.orderId, o.orderDate, o.customerId, c.firstName, c.lastName, o.totalAmount " +
                "FROM ordersummary o JOIN customer c ON o.customerId = c.customerId";

            let results = await pool.request().query(SQL1);

            // Start the main table
            res.write("<table border='1'>");
            res.write("<tr><th>Order ID</th><th>Order Date</th><th>Customer ID</th><th>Name</th><th>Total Amount</th></tr>");

            for (let i = 0; i < results.recordset.length; i++) {
                let order = results.recordset[i];
                // Order summary row
                res.write("<tr>");
                res.write("<td>" + order.orderId + "</td>");
                res.write("<td>" + moment(order.orderDate).format('YYYY-MM-DD') + "</td>");
                res.write("<td>" + order.customerId + "</td>");
                res.write("<td>" + order.firstName + " " + order.lastName + "</td>");
                res.write("<td>" + currFormat.format(order.totalAmount) + "</td>");
                res.write("</tr>");

                // Product details row
                res.write("<tr><td colspan='5'>");  // The colspan should match the number of columns in the summary

                // Nested table for product details
                res.write("<table border='1' width='45%' style = 'margin:0 auto; margin-right: 100px; '>");
                res.write("<tr><th>Product ID</th><th>Quantity</th><th>Price</th></tr>");

                // Prepare the statement for SQL2
                const ps = new sql.PreparedStatement(pool);
                ps.input('orderId', sql.Int);
                await ps.prepare("SELECT productId, quantity, price FROM orderproduct WHERE orderId = @orderId");

                const detailResults = await ps.execute({ orderId: order.orderId });

                for (let j = 0; j < detailResults.recordset.length; j++) {
                    let product = detailResults.recordset[j];
                    res.write("<tr>");
                    res.write("<td>" + product.productId + "</td>");
                    res.write("<td>" + product.quantity + "</td>");
                    res.write("<td>" + currFormat.format(product.price) + "</td>");
                    res.write("</tr>");
                }

                res.write("</table>"); // End of nested table
                res.write("</td></tr>"); // End of product details row

                // Unprepare the statement
                await ps.unprepare();
            }

            // End the main table
            res.write("</table>");
            res.end();

        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;
