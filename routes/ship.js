const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1 style="text-align: center;"><a href="/">CoHo Grocery</a></h1>');

	// TODO: Get order id
    let orderId = parseInt(req.query.orderId);

	// TODO: Check if valid order id
    if (isNaN(orderId)) {
        res.end();
        return;
    }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            // TODO: Start a transaction
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            
            // let checkShipmentSQL = "SELECT COUNT(*) as count FROM shipment WHERE orderId = @orderId";
            // let shipmentResult = await pool.request()
            //     .input("orderId", sql.Int, orderId)
            //     .query(checkShipmentSQL);
            
            // if (shipmentResult.recordset[0].count > 0) {
            //     await transaction.commit();
            //     res.end();
            //     return;
            // }

            try {
                // TODO: Retrieve all items in order with given id
                let getItemsSQL = "SELECT * FROM orderproduct WHERE orderId = @orderId";
                let items = await pool.request()
                    .input("orderId", sql.Int, orderId)
                    .query(getItemsSQL);
                // TODO: Create a new shipment record.
                let shipmentDate = moment().format("YYYY-MM-DD");
                let createShipmentSQL = 
                    "INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) " + 
                    "VALUES (@shipmentDate, 'Shipment for order @orderId', 1)";
                await pool.request()
                    .input("shipmentDate", sql.Date, shipmentDate)
                    .input("orderId", sql.Int, orderId)
                    .query(createShipmentSQL);
    
                // TODO: For each item verify sufficient quantity available in warehouse 1.
                for (let i = 0; i < items.recordset.length; i++) {
                    let row = items.recordset[i];
                    let quantity = row.quantity;
                    let productId = row.productId;
    
                    let checkInventorySQL = "SELECT quantity FROM productinventory WHERE warehouseId = 1 AND productId = @productId";
                    let result3 = await pool.request()
                        .input("productId", sql.Int, productId)
                        .query(checkInventorySQL);
                    
                    let inventory = result3.recordset[0].quantity;
                    // TODO: If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.
                    if (inventory < quantity) {
                        await transaction.rollback();
                        res.write(`<h2>Shipment not done. Insufficient inventory for product id: ${productId}</h2>`);
                        res.write('<h1><a href="/">Back to Main Page</a></h2>');
                        res.end();
                        return;
                    } else {
                        let updateInventorySQL = "UPDATE productinventory SET quantity = quantity - @quantity WHERE warehouseId = 1 AND productId = @productId";
                        await pool.request()
                            .input("quantity", sql.Int, quantity)
                            .input("productId", sql.Int, productId)
                            .query(updateInventorySQL);
                        
                        let updatedInventorySQL = "SELECT quantity FROM productinventory WHERE warehouseId = 1 AND productId = @productId";
                        let result4 = await pool.request()
                            .input("productId", sql.Int, productId)
                            .query(updatedInventorySQL);
                        let updatedInventory = result4.recordset[0].quantity;
    
                        res.write(`<h3>Ordered product: ${productId} Qty: ${quantity} Previous inventory: ${inventory} New inventory: ${updatedInventory} </h3>`);
                    }
                }
                res.write(`<h2>Shipment successfully processed.</h2>`)
                res.write('<h1><a href="/">Back to Main Page</a></h2>');
                await transaction.commit();
                res.end();
            } catch (err) {
                await transaction.rollback();
                console.dir(err);
                res.write(err + "")
                res.end();
            }
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
