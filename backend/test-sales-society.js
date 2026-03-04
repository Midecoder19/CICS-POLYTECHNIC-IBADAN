const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const StockSales = require('./models/StockSales');
  const Society = require('./models/Society');
  
  // Get all societies
  const societies = await Society.find({}).limit(5);
  
  console.log('Societies:');
  societies.forEach(s => {
    console.log(`ID: ${s._id}, Code: ${s.code}, Name: ${s.name}`);
  });
  
  // Get sales grouped by society
  const sales = await StockSales.aggregate([
    { $group: { _id: "$society", count: { $sum: 1 } } }
  ]);
  
  console.log('\nSales by society:');
  sales.forEach(s => {
    console.log(`Society: ${s._id}, Count: ${s.count}`);
  });
  
  mongoose.disconnect();
}

test();
