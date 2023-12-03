// cartUtils.js
function calculateCartTotals(productList) {
    let total = 0;

    productList.forEach(product => {
        if (product) {
            product.subtotal = (product.quantity * product.price).toFixed(2);
            total += parseFloat(product.subtotal);
        }
    });

    // res.render('showcart', {
    //     title: 'Your Shopping Cart',
    //     productList: productList,
    //     total: total.toFixed(2),
    //     hasProducts: productList.length > 0
    // });
}

module.exports = { calculateCartTotals };