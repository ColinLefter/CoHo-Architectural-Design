const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Formatter for currency
let currFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Route to handle the GET request
router.get('/', async function(req, res, next) {
  try {
    // Headers
    res.setHeader('Content-Type', 'text/html');
    res.write('<!DOCTYPE html>');
    res.write('<html lang="en"><head><meta charset="UTF-8"><title>Search Products</title></head><body>');
    
    res.write("<title>CoHo Grocery</title>");
    res.write('<h1>Search for the products you want to buy: </h1>');
    res.write('<form action="" method="get">');
    res.write('<input type="text" name="productName" placeholder="Search for a product" size ="50">');
    res.write('<input type="submit" value="Submit">');
    res.write('<input type="reset" value="Reset"><small>(Leave blank for all products)</small>');
    res.write('</form>');   
    res.write('<h2>All Products </h2>');

    let pool = await sql.connect(dbConfig);
    /** $name now contains the search string the user entered
     Use it to build a query and print out the results. **/
    /** Create and validate connection **/
    
    let name = req.query.productName || '%';
    
    let SQL1 = "SELECT productId, productName, productPrice, categoryName FROM product JOIN category ON product.categoryId = category.categoryId WHERE productName LIKE @name";

    let results = await pool.request()
      .input('name', sql.VarChar, `%${name}%`)
      .query(SQL1);

    // Start the table
    res.write("<table border='1' cellpadding='10'><tr> <th></th> <th>Product Name</th> <th>Category</th> <th>Product Price</th> </tr>");
    /** Print out the ResultSet **/

    /** 
    For each product create a link of the form
    addcart?id=<productId>&name=<productName>&price=<productPrice>
    **/
    for (let i = 0; i < results.recordset.length; i++) {
      let product = results.recordset[i];
      res.write(`<tr><td><a href="/addcart?id=${product.productId}&name=${product.productName}&price=${product.productPrice}">Add to cart</a></td>`);
      res.write(`<td><a href="/product?id=${product.productId}&name=${product.productName}&price=${product.productPrice}">${product.productName}</a></td>`);
      res.write(`<td>${product.categoryName}</td>`);
      res.write(`<td>${currFormat.format(product.productPrice)}</td>`);
      res.write("</tr>");

      let html1 = ``;
    }
    res.write("</table>");
    res.write('</body></html>');
    res.end();
  } catch (err) {
    console.error(err);
    res.write(JSON.stringify(err));
    res.write('</body></html>');
    res.end();
  }
});

module.exports = router;



