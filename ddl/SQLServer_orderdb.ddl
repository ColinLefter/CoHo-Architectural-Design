CREATE DATABASE orders;
go

USE orders;
go

DROP TABLE review;
DROP TABLE shipment;
DROP TABLE productinventory;
DROP TABLE warehouse;
DROP TABLE orderproduct;
DROP TABLE incart;
DROP TABLE product;
DROP TABLE category;
DROP TABLE ordersummary;
DROP TABLE paymentmethod;
DROP TABLE customer;


CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),    
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE productImage (
    imageId             INT IDENTITY,
    productId           INT,
    imageUrl            VARCHAR(100),
    productImage        VARBINARY(MAX),
    PRIMARY KEY (imageId),
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

INSERT INTO category (categoryName) VALUES ('Residential Architectural Visualization');

INSERT INTO product (productName, productPrice, productDesc, categoryId) VALUES
('Project A', 2999.99, 'Project A features unmatched photorealism with all architectural elements drafted to scale. Interior and exterior are fully rendered with real-time rendering in Unreal Engine 5.', 1),
('Project B', 3499.99, 'Project B offers powerful cinematics and is furnished with up to 8k textures and foliage, leveraging global illumination and advanced virtualized geometry.', 1),
('Project C', 3999.99, 'Project C showcases architectural precision with fully rendered and furnished interiors. It includes post-processing features and real-time ray tracing.', 1),
('Project D', 4499.99, 'Project D provides a cinematic showcasing of the render with high-resolution images and the Unreal Engine project file accompanied by CAD files.', 1),
('Project E', 4999.99, 'Project E is our premium offering with complete deliverables including the Unreal Engine project file, CAD files, and close-up views of materials.', 1);

INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES
('Alex', 'Johnson', 'alex.johnson@email.com', '555-0100', '123 Elm Street', 'Metropolis', 'NY', '12345', 'USA', 'alexj', 'pass123'),
('Morgan', 'Brown', 'morgan.brown@email.com', '555-0200', '456 Oak Avenue', 'Gotham', 'IL', '23456', 'USA', 'morganb', 'pass234'),
('Jamie', 'Smith', 'jamie.smith@email.com', '555-0300', '789 Pine Road', 'Star City', 'CA', '34567', 'USA', 'jamies', 'pass345'),
('Casey', 'Lee', 'casey.lee@email.com', '555-0400', '101 Maple Lane', 'Central City', 'OH', '45678', 'USA', 'caseyl', 'pass456'),
('Dana', 'Taylor', 'dana.taylor@email.com', '555-0500', '202 Birch Street', 'Liberty City', 'TX', '56789', 'USA', 'danat', 'pass567');

INSERT INTO paymentmethod (paymentType, paymentNumber, paymentExpiryDate, customerId) VALUES
('Credit Card', '1234567890123456', '2025-12-31', 1),
('Credit Card', '2345678901234567', '2024-11-30', 2),
('PayPal', 'jamie.smith@email.com', '2023-10-31', 3),
('Credit Card', '3456789012345678', '2026-09-30', 4),
('Debit Card', '4567890123456789', '2027-08-31', 5);

-- Insert into 'ordersummary' and 'orderproduct' for Order 1
DECLARE @orderId1 int;
INSERT INTO ordersummary (orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) 
VALUES ('2023-11-28 10:00:00', 2999.99, '123 Elm Street', 'Metropolis', 'NY', '12345', 'USA', 1);
SELECT @orderId1 = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId1, 1, 1, 2999.99);

-- Insert into 'ordersummary' and 'orderproduct' for Order 2
DECLARE @orderId2 int;
INSERT INTO ordersummary (orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) 
VALUES ('2023-11-29 11:00:00', 3499.99, '456 Oak Avenue', 'Gotham', 'IL', '23456', 'USA', 2);
SELECT @orderId2 = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId2, 2, 1, 3499.99);

-- Insert into 'ordersummary' and 'orderproduct' for Order 3
DECLARE @orderId3 int;
INSERT INTO ordersummary (orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) 
VALUES ('2023-11-30 12:00:00', 3999.99, '789 Pine Road', 'Star City', 'CA', '34567', 'USA', 3);
SELECT @orderId3 = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId3, 3, 1, 3999.99);

-- Insert into 'ordersummary' and 'orderproduct' for Order 4
DECLARE @orderId4 int;
INSERT INTO ordersummary (orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) 
VALUES ('2023-12-01 13:00:00', 4499.99, '101 Maple Lane', 'Central City', 'OH', '45678', 'USA', 4);
SELECT @orderId4 = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 4, 1, 4499.99);

-- Insert into 'ordersummary' and 'orderproduct' for Order 5
DECLARE @orderId5 int;
INSERT INTO ordersummary (orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, customerId) 
VALUES ('2023-12-02 14:00:00', 4999.99, '202 Birch Street', 'Liberty City', 'TX', '56789', 'USA', 5);
SELECT @orderId5 = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId5, 5, 1, 4999.99);

INSERT INTO incart (orderId, productId, quantity, price) VALUES
(1, 2, 1, 3499.99),
(2, 3, 1, 3999.99),
(3, 4, 1, 4499.99),
(4, 5, 1, 4999.99),
(5, 1, 1, 2999.99);

-- Insert images for Project 1
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P1.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P2.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P3.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P5.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P6.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P7.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P8.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P9.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (1, 'ProductImages/Project_1/P10.jpg');

-- Insert images for Project 2
INSERT INTO productImage (productId, imageUrl) VALUES (2, 'ProductImages/Project_2/P1.JPG');
INSERT INTO productImage (productId, imageUrl) VALUES (2, 'ProductImages/Project_2/P2.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (2, 'ProductImages/Project_2/P3.jpg');

-- Insert images for Project 3
INSERT INTO productImage (productId, imageUrl) VALUES (3, 'ProductImages/Project_3/P1.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (3, 'ProductImages/Project_3/P2.JPG');

-- Insert images for Project 4
INSERT INTO productImage (productId, imageUrl) VALUES (4, 'ProductImages/Project_4/P1.JPG');
INSERT INTO productImage (productId, imageUrl) VALUES (4, 'ProductImages/Project_4/P2.png');
INSERT INTO productImage (productId, imageUrl) VALUES (4, 'ProductImages/Project_4/P3.png');

-- Insert images for Project 5
INSERT INTO productImage (productId, imageUrl) VALUES (5, 'ProductImages/Project_5/P1.jpg');
INSERT INTO productImage (productId, imageUrl) VALUES (5, 'ProductImages/Project_5/P2.JPG');