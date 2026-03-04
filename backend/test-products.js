// Quick test to check products
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
    console.log('Connected to MongoDB');
    
    const Product = require('./models/Product');
    
    // Find the products
    const products = await Product.find({ 
      _id: { $in: ['69971e050dbf20b4a68dd6fd', '69889c498aca90cf8ac50185'] }
    });
    
    console.log('Products found:', products.length);
    products.forEach(p => {
      console.log('- ID:', p._id, 'Code:', p.code, 'Name:', p.name);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
