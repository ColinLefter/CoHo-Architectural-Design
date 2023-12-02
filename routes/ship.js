const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function(req, res, next) {
    let orderId = parseInt(req.query.orderId);
    if (isNaN(orderId)) {
        res.render('ship', { title: 'Shipment Error', error: 'Invalid order ID.' });
        return;
    }

    try {
        let pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            let getItemsSQL = "SELECT * FROM orderproduct WHERE orderId = @orderId";
            let items = await pool.request().input("orderId", sql.Int, orderId).query(getItemsSQL);
            let shipmentDate = moment().format("YYYY-MM-DD");
            await pool.request()
                .input("shipmentDate", sql.Date, shipmentDate)
                .input("orderId", sql.Int, orderId)
                .query("INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) VALUES (@shipmentDate, 'Shipment for order @orderId', 1)");

            let shipmentDetails = [];
            for (let row of items.recordset) {
                let checkInventorySQL = "SELECT quantity FROM productinventory WHERE warehouseId = 1 AND productId = @productId";
                let inventoryResult = await pool.request().input("productId", sql.Int, row.productId).query(checkInventorySQL);
                let inventory = inventoryResult.recordset[0].quantity;

                if (inventory < row.quantity) {
                    await transaction.rollback();
                    res.render('ship', { title: 'Shipment Error', error: `Insufficient inventory for product ID: ${row.productId}.` });
                    return;
                } else {
                    await pool.request()
                        .input("quantity", sql.Int, row.quantity)
                        .input("productId", sql.Int, row.productId)
                        .query("UPDATE productinventory SET quantity = quantity - @quantity WHERE warehouseId = 1 AND productId = @productId");
                    shipmentDetails.push({ productId: row.productId, quantity: row.quantity, previousInventory: inventory });
                }
            }
            await transaction.commit();
            res.render('ship', { title: 'Shipment Processed', shipmentDetails: shipmentDetails, success: true });
        } catch (err) {
            await transaction.rollback();
            console.error(err);
            res.render('ship', { title: 'Shipment Error', error: err.message });
        }
    } catch(err) {
        console.error(err);
        res.render('ship', { title: 'Shipment Error', error: err.message });
    }
});

module.exports = router;