const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            res.redirect("/");
        } else {
            res.redirect("/login");
        }
     })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }
    
    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser;
    
    authenticatedUser = await (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            // TODO: Check if userId and password match some customer account. 
            // If so, set authenticatedUser to be the username.

            let sqlQuery = "SELECT * FROM customer WHERE userid = @userid AND password = @password";
            result = await pool.request()
                .input('userid', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query(sqlQuery);
            if (result.recordset.length === 0) {
                return false;
            } else {
                authenticatedUser = username;
                req.session.username = authenticatedUser;
                req.session.password = password;
                return true;
            }
        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
