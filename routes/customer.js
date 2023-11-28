const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    if (!req.session.username) {
        req.session.loginMessage = "You have not been authorized to access the URL";
        res.redirect("/login"); // we need to redirect otherwise
        return;
    }

    // TODO: Print Customer information

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            
            let sqlQuery = 
                "SELECT customerId, " +
                "firstName, " +
                "lastName, " +
                "email, " +
                "phonenum, " +
                "address, " +
                "city, " +
                "state, " +
                "postalCode, " +
                "country, " +
                "userid " +
                "FROM customer " +
                "WHERE userid = @userid";

            let result = await pool.request()
                .input('userid', sql.VarChar, req.session.username)
                .query(sqlQuery);

            res.write("<h1>Customer Profile</h1>");
            res.write("<table border='1'>");
            if (result.recordset.length > 0) {
                let customer = result.recordset[0];
                res.write(`<tr><td><strong>Id</strong></td><td>${customer.customerId}</td></tr>`);
                res.write(`<tr><td><strong>First Name</strong></td><td>${customer.firstName}</td></tr>`);
                res.write(`<tr><td><strong>Last Name</strong></td><td>${customer.lastName}</td></tr>`);
                res.write(`<tr><td><strong>Email</strong></td><td>${customer.email}</td></tr>`);
                res.write(`<tr><td><strong>Phone</strong></td><td>${customer.phonenum}</td></tr>`);
                res.write(`<tr><td><strong>Address</strong></td><td>${customer.address}</td></tr>`);
                res.write(`<tr><td><strong>City</strong></td><td>${customer.city}</td></tr>`);
                res.write(`<tr><td><strong>State</strong></td><td>${customer.state}</td></tr>`);
                res.write(`<tr><td><strong>Postal Code</strong></td><td>${customer.postalCode}</td></tr>`);
                res.write(`<tr><td><strong>Country</strong></td><td>${customer.country}</td></tr>`);
                res.write(`<tr><td><strong>User Id</strong></td><td>${customer.userid}</td></tr>`);
            } else {
                res.write("<tr><td colspan='2'>No customer data found</td></tr>");
            }

            res.write("</table>");
            res.end();

	// TODO: Print customer info
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;