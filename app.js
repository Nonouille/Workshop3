const express = require("express");
const { Client } = require("pg");
const app = express();
const PORT = process.env.PORT || 3000;

let actualID = 15;
let orderID = 1;
app.use(express.json()); // => to parse request body with http header "content-type": "application/json"

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "shop",
  password: "root",
  port: 5432,
});

client.connect();

let products = []
let orders = []
let orderDetails = []
let carts = []
let cartDetails = []

async function updateDatabase() {
  try {
    const resultProducts = await client.query("SELECT * FROM product");
    products = resultProducts.rows;

    const resultOrders = await client.query("SELECT * FROM orders");
    orders = resultOrders.rows;

    const resultOrderDetails = await client.query("SELECT * FROM orderDetails");
    orderDetails = resultOrderDetails.rows;

    const resultCarts = await client.query("SELECT * FROM carts");
    carts = resultCarts.rows;

    const resultCartDetails = await client.query("SELECT * FROM cartDetails");
    cartDetails = resultCartDetails.rows;

  }
  catch (err) {
    console.error("Error initializing the database", err);
  }
  finally {
    let actualID = products.length;
    let orderID = orders.length;
    console.log("Database retrieved");
  }
}

function generateUniqueId() {
  actualID ++;
  return actualID;
}

function generateUniqueIdOrder() {
  orderID ++;
  return orderID;
}


app.get('/getServer', (req, res) => {
  const serverUrl = `localhost:${PORT}`;
  res.status(200).json({server: serverUrl });
});

//###################################
//          PRODUCTS PART
//###################################

//Get products (by category and stock)
app.get('/products', (req,res) => {
  // Extract optional query parameters
  const { category, inStock } = req.query;
  // Filter products based on optional parameters
  let filteredProducts = products;
  //Filtering category
  if (category) {
      filteredProducts = filteredProducts.filter(product => product.category.toLowerCase() === category.toLowerCase());
  }
  //Filtering stock
  if (inStock) {
    inStockValue = inStock.toLowerCase()=== "true";
    filteredProducts = filteredProducts.filter(product => product.instock === inStockValue);
  }
  res.status(200).json(filteredProducts);
})

//Get a product by it's ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10); // Parse the ID as an integer
  const product = products.find(product => product.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  else{
      res.status(200).json(product)
  }
})

//Add a new product
app.post('/products', async (req, res) => {
  // Extract product information from the request body
  const { name, description, price, category, inStock } = req.body;
  // Generate a unique identifier for the new product
  const newProductId = generateUniqueId(category);
  // Create a new product object

  const values = [newProductId, name, description, price, category, inStock];

  const query = `
      INSERT INTO product(id, name, description, price, category, inStock)
      VALUES($1, $2, $3, $4, $5, $6)
    `;

  // Use the pg library to perform a bulk insert
  const result = await client.query(query, values);

  // Check if a record was updated
  if (result.rowCount === 0) {
    return res.status(400).json({ error: 'Product not found' });
  }
  // Update the tables
  updateDatabase();
  // Respond with the updated product details
  res.status(201).json({message : "Product sucessfuly added ", elementAdded : result.rows[0]});
});

//Modify a product
app.put('/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10); // Parse the ID as an integer
  const productIndex = products.findIndex(product => product.id === productId);
  //check index is valid
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Extract the updated product information from the request body
  const updatedFields = req.body;
  // Construct a parameterized SQL query for updating the product
  const query = `UPDATE product SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      category = COALESCE($4, category),
      inStock = COALESCE($5, inStock)
    WHERE id = $6
    RETURNING *
  `;
  // Map the updated fields to an array, ensuring that missing fields are set to NULL
  const values = [
    updatedFields.name,
    updatedFields.description,
    updatedFields.price,
    updatedFields.category,
    updatedFields.inStock,
    productId,
  ];
  // Use the pg library to execute the update query
  const result = await client.query(query, values);
  // Check if a record was updated
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Update the tables
  updateDatabase();
  // Respond with the updated product details
  res.status(200).json(result.rows[0]);
});

//Delete a product
app.delete('/products/:id', async(req, res) => {
  const productId = parseInt(req.params.id, 10); // Parse the ID as an integer
  const productIndex = products.findIndex(product => product.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Construct a parameterized SQL query for deleting the product
  const query = `
    DELETE FROM product
    WHERE id = $1
    RETURNING *
  `;
  // Use the pg library to execute the delete query
  const result = await client.query(query, [productId]);

  // Check if a record was deleted
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Update the tables
  updateDatabase();
  // Respond with the deleted product details
  res.status(200).json({
    message: 'Product deleted successfully',
    deletedProduct: result.rows[0],
  });
});

//###################################
//            ORDERS PART
//###################################

//Create an order
app.post('/orders' , async (req,res) => {
  //create ID and usefull variables
  thisOrderID = generateUniqueIdOrder();
  totalPrice = 0;
  odrerDetail = [];

  //retrieve body details
  const body = req.body;
  oderUser = body.user.toLowerCase();
  bodyDetails = body.order;

  //for each element of the order, retrieve ID and calculate total price
  for (const element of bodyDetails) {
    const productIndex = products.findIndex(product => product.id === element.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    //create the new order json element
    const query = `
    INSERT INTO orderDetails(orderid, id, quantity, "name", price)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `;
    const values = [thisOrderID, element.id, element.qty, products[productIndex].name, products[productIndex].price];
    // Use the pg library to execute the insert query
    await client.query(query, values);
    totalPrice +=  products[productIndex].price*element.qty
  };
  //round total price
  totalPrice = Math.round(totalPrice*100)/100;
  console.log(totalPrice);
  //create the new order json element
  const query = `
      INSERT INTO orders(orderid, "status", "user", totalprice)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `;
  const values = [thisOrderID, "pending", oderUser, totalPrice];
  // Use the pg library to execute the insert query
  const result = await client.query(query, values);

  updateDatabase();
  // Respond with the created order details
  res.status(200).json({
    message: 'Successful order creation',
    orderDetails: result.rows[0],
  });
})

//Get orders by a userId
app.get('/orders/:userId', (req,res) => {
  updateDatabase();
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  filteredOrders = orders.filter(order => order.user === userId.toLowerCase());
  res.status(200).json(filteredOrders);
})

//###################################
//            CART PART
//###################################

//Add a product to user cart
app.post('/cart/:userId', async (req,res) => {
  let totalQuantity = 0;
  let totalPrice = 0;
  const userId = req.params.userId.toLowerCase();
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  //Get the cart if existing 
  thisUserCartDetail = cartDetails.filter(order => order.user === userId);
  thisUserCart = carts.filter(order => order.user === userId);
  //Create a new one if not existing
  if (thisUserCart.length === 0){
    const insertQuery = `
        INSERT INTO carts("user", cartstatus, totalprice)
        VALUES($1, $2, $3)
        RETURNING *
      `;

    const values = [userId, 1, 0];
    const insertResult = await client.query(insertQuery, values);

    thisUserCart = insertResult.rows[0];
  }

  //Get infos about the product
  const body = req.body;
  const productIndex = products.findIndex(product => product.id === body.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  //If product already in cart, just increase the qty
  thisCartObject = thisUserCartDetail.filter(object => object.id === body.id)
  if(thisCartObject.length != 0){
    const updateQuery = `
      UPDATE cartDetails
      SET quantity = $2
      WHERE "user" = $3 AND id = $1
      RETURNING *
    `;
    totalQuantity = thisCartObject.reduce((acc, item) => acc + item.quantity, 0) + body.qty;
    const updateValues = [body.id,totalQuantity, userId];
    const updateResult = await client.query(updateQuery, updateValues);
  }
  else {
    const insertQuery = `
      INSERT INTO cartDetails( "user", id, quantity, name, price)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const insertValues = [userId, body.id, body.qty, products[productIndex].name, products[productIndex].price];
    const updateResult = await client.query(insertQuery, insertValues);
  }

  const updateQuery = `
  UPDATE carts
  SET "user" = $1, cartstatus = $2, totalprice = $3
  WHERE "user" = $1
  RETURNING *
  `;
  
  totalPrice = thisUserCart.reduce((acc,item) => acc + item.totalPrice,0) + (products[productIndex].price*body.qty);
  const updateValues = [userId, 1, totalPrice];
  const updateResult = await client.query(updateQuery, updateValues);

  updateDatabase();
  // Respond with the updated cart details
  res.status(200).json({
    message: 'Added to cart',
    cart: updateResult.rows[0],
  });
})

//Get cart from a userID
app.get('/cart/:userId', (req,res) => {
  updateDatabase();
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  filteredCarts = cartDetails.filter(cart => cart.user === userId.toLowerCase());
  filteredCarts += carts.filter(cart => cart.user === userId.toLowerCase());
  res.status(200).json(filteredCarts[0]);
})

//Delete an item
app.delete('/cart/:userId/item/:productId', async (req,res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  const productId = parseInt(req.params.productId,10)
  if (!productId) {
    return res.status(400).json({ error: 'productId incorrect' });
  }
  //Verify the user cart exist
  thisUserCart = cartDetails.filter(order => order.user === userId);
  if(thisUserCart.length === 0){
    return res.status(400).json({ error: 'This user has no actual cart' });
  }
  
  //Verify the object is in the user cart 
  thisCartObject = thisUserCart.filter(object => object.id === productId);
  if(thisCartObject.length === 0){
    return res.status(400).json({ error: 'This user doesn\'t have this object in the actual cart' });
  }
  // Update the cart in the database
  const deleteQuery = `
    DELETE FROM cartDetails
    WHERE id = $1 AND "user" = $2
    RETURNING *
  `;
  const deleteValues = [thisCartObject.id,thisCartObject.user];
  const deleteResult = await client.query(deleteQuery, deleteValues);

  // Check if a cart was deleted
  if (deleteResult.rowCount === 0) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  // Respond with the deleted cart details
  res.status(200).json({
    message: 'Successfully deleted',
    deletedCart: deleteResult.rows[0],
  });
})

console.log('starting...');
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
updateDatabase()