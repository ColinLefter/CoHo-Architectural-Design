const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    
    try {
        let pool = await sql.connect(dbConfig);

        // SQL query to retrieve order data
        let SQL1 = 
            "SELECT o.orderId, o.orderDate, o.customerId, c.firstName, c.lastName, o.totalAmount " +
            "FROM ordersummary o JOIN customer c ON o.customerId = c.customerId";

        let results = await pool.request().query(SQL1);

        // Map the query results to a structured data format
        let ordersData = results.recordset.map(order => ({
            orderId: order.orderId,
            orderDate: moment(order.orderDate).format('YYYY-MM-DD'),
            customerId: order.customerId,
            customerName: `${order.firstName} ${order.lastName}`,
            totalAmount: order.totalAmount.toFixed(2)
        }));

        res.render('listorder', {
            title: 'Order List',
            ordersData: ordersData
        });
    } catch (err) {
        console.dir(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;