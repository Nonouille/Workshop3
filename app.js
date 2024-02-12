const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
let actualID = 15;
app.use(express.json()); // => to parse request body with http header "content-type": "application/json"

function generateUniqueId() {
    actualID ++;
    return actualID;
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

app.get('/getServer', (req, res) => {
    const serverUrl = `localhost:${PORT}`;
    res.status(200).json({server: serverUrl });
  });

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

console.log('starting...');
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});