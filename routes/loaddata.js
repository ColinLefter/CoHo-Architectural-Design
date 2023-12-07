const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

const loadDatabase = async () => {
    let pool = await sql.connect(dbConfig);
    let data = fs.readFileSync("./ddl/SQLServer_orderdb.ddl", { encoding: 'utf8' });
    let commands = data.split(";");
    for (let command of commands) {
        try {
            await pool.request().query(command);
        } catch (err) {
            
        }
    }
};

router.get('/', async function(req, res, next) {
    try {
        await loadDatabase();
        res.send("Database loading complete!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading database");
    }
});

module.exports = { router, loadDatabase };