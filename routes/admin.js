const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    if (!req.session.username) {
        req.session.loginMessage = "You have not been authorized to access the URL";
        res.redirect("/login");
        return;
    }

    try {
        let pool = await sql.connect(dbConfig);
        let sqlQuery = 
            "SELECT CONVERT(VARCHAR, orderDate, 111) as OrderDate, " +
            "SUM(totalAmount) as TotalOrderAmount " +
            "FROM ordersummary " +
            "GROUP BY CONVERT(VARCHAR, orderDate, 111) " +
            "ORDER BY OrderDate";
        let result = await pool.request().query(sqlQuery);

        let salesData = result.recordset.map(row => ({
            orderDate: row.OrderDate,
            totalOrderAmount: Number(row.TotalOrderAmount).toFixed(2)
        }));

        res.render('admin', {
            title: 'Administrator Sales Report',
            salesData: salesData
        });

    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;