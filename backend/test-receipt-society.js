const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const StockReceipt = require('./models/StockReceipt');
  const StockBalance = require('./models/StockBalance');
  
  // Get receipts
  const receipts = await StockReceipt.find({}).limit(3);
  
  console.log('Stock Receipts:');
  receipts.forEach(r => {
    console.log(`Receipt: ${r.receiptNumber}, Society: ${r.society}`);
  });
  
  // Get balances
  const balances = await StockBalance.find({}).limit(5);
  
  console.log('\nStock Balances:');
  balances.forEach(b => {
    console.log(`Product: ${b.product}, Society: ${b.society}, Qty: ${b.quantityOnHand}`);
  });
  
  mongoose.disconnect();
}

test();
