const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
let actualID = 15;
let orderID = 0;
app.use(express.json()); // => to parse request body with http header "content-type": "application/json"

function generateUniqueId() {
  actualID ++;
  return actualID;
}

function generateUniqueIdOrder() {
  orderID ++;
  return orderID;
}

let products = [
  {
    id: 1,
    name: 'Canon EOS 5D Mark IV',
    description: '30.4MP Full-Frame DSLR Camera',
    price: 2499.99,
    category: 'Cameras',
    inStock: true,
  },
  {
    id: 2,
    name: 'Sony Alpha a7 III',
    description: '24.2MP Mirrorless Camera with 28-70mm Lens',
    price: 1999.99,
    category: 'Cameras',
    inStock: true,
  },
  {
    id: 3,
    name: 'Nikon Z6',
    description: '24.5MP Mirrorless Camera with NIKKOR Z 24-70mm Lens',
    price: 2399.99,
    category: 'Cameras',
    inStock: false,
  },
  {
    id: 4,
    name: 'Fujifilm X-T4',
    description: '26.1MP Mirrorless Camera with XF 18-55mm Lens',
    price: 1799.99,
    category: 'Cameras',
    inStock: true,
  },
  {
    id: 5,
    name: 'Panasonic Lumix GH5',
    description: '20.3MP Mirrorless Camera with 12-60mm Lens',
    price: 1799.99,
    category: 'Cameras',
    inStock: true,
  },
  {
    id: 6,
    name: 'Canon EF 50mm f/1.8 STM Lens',
    description: 'Prime Lens for Canon DSLR Cameras',
    price: 125.99,
    category: 'Lenses',
    inStock: true,
  },
  {
    id: 7,
    name: 'Sigma 70-200mm f/2.8 DG OS HSM Sports Lens',
    description: 'Telephoto Zoom Lens for Nikon DSLR Cameras',
    price: 1299.99,
    category: 'Lenses',
    inStock: true,
  },
  {
    id: 8,
    name: 'Sony FE 24mm f/1.4 GM Lens',
    description: 'Wide-Angle Prime Lens for Sony Alpha Cameras',
    price: 1399.99,
    category: 'Lenses',
    inStock: false,
  },
  {
    id: 9,
    name: 'Nikon AF-S DX NIKKOR 35mm f/1.8G Lens',
    description: 'Wide-Angle Prime Lens for Nikon DSLR Cameras',
    price: 199.99,
    category: 'Lenses',
    inStock: true,
  },
  {
    id: 10,
    name: 'Tamron 24-70mm f/2.8 Di VC USD G2 Lens',
    description: 'Standard Zoom Lens for Canon DSLR Cameras',
    price: 1199.99,
    category: 'Lenses',
    inStock: true,
  },{
    id: 11,
    name: 'Manfrotto Befree Advanced Travel Tripod',
    description: 'Carbon Fiber 4-Section Tripod',
    price: 349.99,
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 12,
    name: 'SanDisk Extreme PRO 128GB SDXC Memory Card',
    description: 'High-Speed UHS-I U3 V30 SD Card',
    price: 39.99,
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 13,
    name: 'Peak Design Everyday Sling 5L',
    description: 'Compact Camera Bag',
    price: 89.99,
    category: 'Accessories',
    inStock: false,
  },
  {
    id: 14,
    name: 'Godox AD200Pro TTL Pocket Flash',
    description: 'Portable Strobe with Built-in Battery',
    price: 299.99,
    category: 'Lighting',
    inStock: true,
  },
  {
    id: 15,
    name: 'Wacom Intuos Pro Digital Graphic Drawing Tablet',
    description: 'Professional Pen Tablet for Digital Art',
    price: 349.99,
    category: 'Accessories',
    inStock: true,
  },
];

orders = [];

carts = [];


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
      const inStockValue = inStock.toLowerCase() === 'true'; // Convert string to boolean
      filteredProducts = filteredProducts.filter(product => product.inStock === inStockValue);
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
app.post('/products', (req, res) => {
  // Extract product information from the request body
  const { name, description, price, category, inStock } = req.body;
  // Generate a unique identifier for the new product
  const newProductId = generateUniqueId(category);
  // Create a new product object
  const newProduct = {
    id: newProductId,
    name,
    description,
    price,
    category,
    inStock,
  };

  // Add the new product to the products array
  products.push(newProduct);

  // Respond with the created product
  res.status(201).json(newProduct);
});

//Modify a product
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10); // Parse the ID as an integer
  const productIndex = products.findIndex(product => product.id === productId);
  //check index is valid
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Extract the updated product information from the request body
  const updatedFields = req.body;
  // Update only the fields that are provided in the request body
  Object.keys(updatedFields).forEach(key => {
    if (key in products[productIndex]) {
      products[productIndex][key] = updatedFields[key];
    }
  });
  // Respond with the updated product details
  res.status(200).json(products[productIndex]);
});

//Delete a product
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10); // Parse the ID as an integer
  const productIndex = products.findIndex(product => product.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Remove the product from the products array
  products.splice(productIndex, 1)[0];
  // Respond with a confirmation message
  res.status(200).json({ message: 'Product deleted successfully', productIndex });
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