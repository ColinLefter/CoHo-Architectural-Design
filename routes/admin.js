const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    if (!req.session.username) {
        req.session.loginMessage = "You have not been authorized to access the URL";
        res.redirect("/login"); // we need to redirect otherwise
        return;
    }

    try {
        let pool = await sql.connect(dbConfig);
        let sqlQuery = 
            "SELECT CONVERT(VARCHAR, orderDate, 111) as OrderDate, "+
            "SUM(totalAmount) as TotalOrderAmount "+
            "FROM ordersummary "+
            "GROUP BY CONVERT(VARCHAR, orderDate, 111) "+
            "ORDER BY OrderDate";
        let result = await pool.request().query(sqlQuery);

        res.write("<h1>Administrator Sales Report by Day</h1>");
        res.write("<table border='1'><tr><th>Order Date</th> <th>Total Order Amount</th></tr>");

        for (let i = 0; i < result.recordset.length; i++) {
            let row = result.recordset[i];
            res.write("<tr><td>" + row.OrderDate + "</td><td>$" + Number(row.TotalOrderAmount).toFixed(2) + "</td></tr>");
        }

        res.write(`</table>`); // Close the table tag
        res.end();

    } catch(err) {
        console.dir(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;