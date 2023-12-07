const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session')
const bodyParser  = require('body-parser');
const sql = require('mssql');
const fs = require('fs');
const { router: loadData, loadDatabase } = require('./routes/loaddata');

let index = require('./routes/index');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let showCartFullScreen = require('./routes/showCartFullScreen');
let checkout = require('./routes/checkout');
let order = require('./routes/order');
let login = require('./routes/login');
let validateLogin = require('./routes/validateLogin');
let logout = require('./routes/logout');
let admin = require('./routes/admin');
let product = require('./routes/product');
let displayImage = require('./routes/displayImage');
let customer = require('./routes/customer');
let ship = require('./routes/ship');
let createAccount = require('./routes/createAccount');

const app = express();

// Enable parsing of requests for POST requests
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

// This DB Config is accessible globally
dbConfig = {    
  server: 'cosc304_sqlserver',
  authentication: {
      type: 'default',
      options: {
          userName: 'sa', 
          password: '304#sa#pw'
      }
  },   
  options: {      
    encrypt: false,      
    enableArithAbort:false,
  }
}

// Setting up the session
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // For production
    maxAge: 3600000, // 1 hour, for example
  }
}));

app.use((req, res, next) => {
  res.locals.username = req.session.username;
  next();
});

// Setting up the rendering engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Setting up where static assets should
// be served from.
app.use(express.static('public'));

const pool = new sql.ConnectionPool(dbConfig);
pool.on('error', err => {
    console.error('SQL pool error:', err);
});

const refreshInterval = 30000; // 30 seconds
setInterval(async () => {
    console.log("Refreshing database...");
    try {
        await loadDatabase();
        console.log("Database refreshed successfully");
    } catch (err) {
        console.error("Error refreshing database:", err);
    }
}, refreshInterval);

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/', index);
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/showCartFullScreen', showCartFullScreen);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/login', login);
app.use('/validateLogin', validateLogin);
app.use('/logout', logout);
app.use('/admin', admin);
app.use('/product', product);
app.use('/displayImage', displayImage);
app.use('/customer', customer);
app.use('/ship', ship);
app.use('/createAccount', createAccount);

// Starting our Express app
app.listen(3000)