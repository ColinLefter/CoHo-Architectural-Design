const express = require('express');
const router = express.Router();
const sql = require('mssql'); // Assuming you are using mssql

router.get('/', function(req, res) {
    res.render('createAccount', { title: "Create Account" });
});

router.post('/', async function(req, res) {
    try {
        // Connect to your database
        let pool = await sql.connect(dbConfig);

        // Extract form data
        const { 
            username,
            password,
            firstName,
            lastName,
            email,
            phoneNumber,
            country,
            streetAddress,
            city,
            region,
            postalCode,
            cardNumber,
            nameOnCard,
            expirationDate,
            cvv,
            paymentType
        } = req.body;

        // Insert data into the database
        const insertCustomerQuery =
            "INSERT INTO customer(firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) " +
            "OUTPUT INSERTED.customerId " + 
            "VALUES(@firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @userid, @password)";
        const customerResult = await pool.request()
            .input('firstName', sql.VarChar, firstName)
            .input('lastName', sql.VarChar, lastName)
            .input('email', sql.VarChar, email)
            .input('phonenum', sql.VarChar, phoneNumber)
            .input('address', sql.VarChar, streetAddress)
            .input('city', sql.VarChar, city)
            .input('state', sql.VarChar, region)
            .input('postalCode', sql.VarChar, postalCode)
            .input('country', sql.VarChar, country)
            .input('userid', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(insertCustomerQuery);

        const customerId = customerResult.recordset[0].customerId; // we need to do this here since autoincrement

        const insertPaymentQuery = `
            INSERT INTO paymentmethod (paymentType, paymentNumber, paymentExpiryDate, customerId) 
            VALUES (@paymentType, @paymentNumber, @paymentExpiryDate, @customerId)
        `;
        await pool.request()
            .input('paymentType', sql.VarChar, paymentType)
            .input('paymentNumber', sql.VarChar, cardNumber)
            .input('paymentExpiryDate', sql.VarChar, expirationDate)
            .input('customerId', sql.Int, customerId)
            .input('nameOnCard', sql.VarChar, nameOnCard)
            .input('cvv', sql.VarChar, cvv)
            .query(insertPaymentQuery);

        // Redirect to home page after successful insertion
        res.redirect('/');
    } catch(err) {
        console.error(err);
        res.status(500).send('Error processing request');
    }
});

module.exports = router;
