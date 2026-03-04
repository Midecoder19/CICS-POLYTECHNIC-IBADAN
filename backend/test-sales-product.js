const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const StockSales = require('./models/StockSales');
  const items = await StockSales.findOne({ sivNo: { $exists: true } }).select('items');
  
  if (items && items.items.length > 0) {
    console.log('First item product:', items.items[0].product);
    console.log('Type:', typeof items.items[0].product);
    console.log('Is ObjectId:', mongoose.Types.ObjectId.isValid(items.items[0].product));
  } else {
    console.log('No items found');
  }
  
  mongoose.disconnect();
}

test();
