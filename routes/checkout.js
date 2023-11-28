const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Grocery CheckOut Line</title>");

    res.write("<h1>Enter your customer id and password to complete the transaction:</h1>");
    res.write("<table border='0'><tr> <th></th> <th></th></tr>");

    res.write('<tr>');
    res.write('<td>Customer ID:</td><td> <form method="get" action="order"><input type="text" name="customerId" size="20"></td></tr>');


    res.write('<tr>');
    res.write('<td>Password:</td><td>  <form method="get" action="order"><input type="text" name="password" size="20"></td></tr>');

    res.write('<tr><td><input type="submit" value="Submit"><input type="reset" value="Reset"></td></tr>');

    res.write('</form>');

    res.write('</table>')
    res.end();
});

module.exports = router;
