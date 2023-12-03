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

        let sqlQuery2 = "SELECT * FROM customer";
        let result2 = await pool.request().query(sqlQuery2);

        let customerData = result2.recordset.map(row => ({
            firstname: row.firstName,
            lastname: row.lastName,
            email: row.email,
            phoneNum: row.phonenum,
            address: row.address,
            city: row.city,
            state: row.state,
            postalCode: row.postalCode,
            country: row.country,
        }));

        res.render('admin', {
            title: 'Administrator Sales Report',
            salesData: salesData,
            customerData: customerData
        });
        res.render('admin', {
            title: 'Customers Information',
            customerData: customerData
        });

    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;