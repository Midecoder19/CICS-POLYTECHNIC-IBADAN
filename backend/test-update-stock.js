const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const StockSales = require('./models/StockSales');
  const StockBalance = require('./models/StockBalance');
  
  // Get first sales item
  const sale = await StockSales.findOne({ sivNo: { $exists: true } });
  
  if (!sale) {
    console.log('No sales found');
    mongoose.disconnect();
    return;
  }
  
  console.log('Sale:', sale.sivNo);
  console.log('Society:', sale.society);
  console.log('Items:', sale.items.length);
  
  if (sale.items.length > 0) {
    const item = sale.items[0];
    console.log('First item product:', item.product);
    console.log('Product type:', typeof item.product);
    
    // Try to find stock balance with this product
    const balance = await StockBalance.findOne({
      society: sale.society,
      product: item.product
    });
    
    if (balance) {
      console.log('Found balance:', balance.quantityOnHand);
    } else {
      console.log('No balance found for this product');
      
      // Check what products have balances
      const balances = await StockBalance.find({ society: sale.society });
      console.log('Balances for this society:', balances.length);
      balances.forEach(b => console.log(' - Product:', b.product, 'Qty:', b.quantityOnHand));
    }
  }
  
  mongoose.disconnect();
}

test();
