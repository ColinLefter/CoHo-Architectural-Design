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
    let pool = await sql.connect(dbConfig);
    let name = req.query.productName || '%';
    
    let query = "SELECT productId, productName, productPrice, categoryName, displayOne, productDesc FROM product JOIN category ON product.categoryId = category.categoryId WHERE productName LIKE @name";
    let results = await pool.request()
      .input('name', sql.VarChar, `%${name}%`)
      .query(query);

    // Process the results for rendering
    let products = results.recordset.map(product => ({
      ...product,
      formattedPrice: currFormat.format(product.productPrice) // Formatting the price
    }));

    // Render the Handlebars template with the products data
    res.render('listprod', {
      title: 'Search Products',
      products: products,
      searchValue: name === '%' ? '' : name // Preserving the search input
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;