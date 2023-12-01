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
            "SELECT customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid " +
            "FROM customer WHERE userid = @userid";

        let result = await pool.request()
            .input('userid', sql.VarChar, req.session.username)
            .query(sqlQuery);

        if (result.recordset.length > 0) {
            let customer = result.recordset[0];
            res.render('customer', {
                title: 'Customer Profile',
                customer: customer
            });
        } else {
            res.render('customer', {
                title: 'Customer Profile',
                customer: null,
                message: 'No customer data found'
            });
        }
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;