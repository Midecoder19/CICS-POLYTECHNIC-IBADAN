const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const StockBalance = require('./models/StockBalance');
  
  // Get all stock balances
  const balances = await StockBalance.find({ isActive: true }).limit(5);
  
  console.log('Stock Balances found:', balances.length);
  balances.forEach(b => {
    console.log(`Product: ${b.product}, Quantity: ${b.quantityOnHand}, Society: ${b.society}`);
  });
  
  mongoose.disconnect();
}

test();
