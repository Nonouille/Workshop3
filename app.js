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
  const result = await client.query(query, values.flat());

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
app.post('/orders' , (req,res) => {
  //create ID and usefull variables
  thisOrderID = generateUniqueIdOrder();
  totalPrice = 0;
  odrerDetail = [];
  bodyDetails = [];
  //retrieve body details
  const body = req.body;
  oderUser = body.user.toLowerCase();
  bodyDetails = body.order;
  //for each element of the order, retrieve ID and calculate total price
  bodyDetails.forEach( element => {
    const productIndex = products.findIndex(product => product.id === element.id);
    element = {
      "id" : element.id,
      "Quantity" : element.qty,
      "Name" : products[productIndex].name,
      "Price" : products[productIndex].price};
    odrerDetail.push(element);
    totalPrice += products[productIndex].price*element.qty
  });
  //round total price
  totalPrice = Math.round(totalPrice*100)/100;
  //create the new order json element
  newOrder = {"orderID" : thisOrderID, "status" : "pending", "User" : oderUser, "odrerDetail" : odrerDetail, "Total Price" : totalPrice}
  //add the new order to the array orders
  orders.push(newOrder);
  res.status(200).json({"message" : "Sucessful order creation", "orderDetails" : newOrder});
})

//Get orders by a userId
app.get('/orders/:userId', (req,res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  filteredOrders = orders.filter(order => order.User === userId.toLowerCase());
  res.status(200).json(filteredOrders);
})

//###################################
//            CART PART
//###################################

//Add a product to user cart
app.post('/cart/:userId',(req,res) => {
  const userId = req.params.userId.toLowerCase();
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }

  //Get the cart if existing 
  thisUserCart = carts.filter(order => order.user === userId);
  //Create a new one if not existing
  if (thisUserCart.length === 0){
    carts.push(thisUserCart = {
      "user" : userId,
      "cartDetail" : [],
      "totalPrice" : 0
    })
  }
  
  //Get the index in the carts array for this cart
  cartIndex = carts.findIndex(cart => cart.user === userId);

  //Get infos about the product
  const body = req.body;
  const productIndex = products.findIndex(product => product.id === body.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  //If product already in cart, just increase the qty
  thisCartObject = carts[cartIndex].cartDetail.filter(object => object.id === body.id)
  if(thisCartObject.length != 0){
    const cartDetailIndex = carts[cartIndex].cartDetail.findIndex(object => object.id === body.id)
    carts[cartIndex].cartDetail[cartDetailIndex].Quantity += body.qty;
  }
  else {
    addToCartDetail = {
      "id" : body.id,
      "Quantity" : body.qty,
      "Name" : products[productIndex].name,
      "Price" : products[productIndex].price
    };
    carts[cartIndex].cartDetail.push(addToCartDetail);
  } 
  carts[cartIndex].totalPrice+= (products[productIndex].price*body.qty);
  res.status(200).json({"message" : "Added to cart", "cart" : carts[cartIndex]});
})

//Get cart from a userID
app.get('/cart/:userId', (req,res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  filteredCarts = carts.filter(cart => cart.user === userId.toLowerCase());
  res.status(200).json(filteredCarts[0]);
})

//Delete an item
app.delete('/cart/:userId/item/:productId', (req,res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  const productId = parseInt(req.params.productId,10)
  if (!productId) {
    return res.status(400).json({ error: 'productId incorrect' });
  }
  //Verify the user cart exist
  thisUserCart = carts.filter(order => order.user === userId);
  if(thisUserCart.length === 0){
    return res.status(400).json({ error: 'This user has no actual cart' });
  }
  //Get the index in the carts array for this cart
  cartIndex = carts.findIndex(cart => cart.user === userId);
  
  //Verify the object is in the user cart 
  thisCartObject = carts[cartIndex].cartDetail.filter(object => object.id === productId);
  if(thisCartObject.length === 0){
    return res.status(400).json({ error: 'This user doesn\' have this object in the actual cart' });
  }
  const cartDetailIndex = carts[cartIndex].cartDetail.findIndex(object => object.id === productId);
  deletedItem = carts[cartIndex].cartDetail.splice(cartDetailIndex, 1)[0];
  res.status(200).json({"message" : "Sucesfully deleted ","deletedItem" : deletedItem});
})

console.log('starting...');
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
updateDatabase()