// Quick test script to check StockReceipts in MongoDB
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
    console.log('Connected to MongoDB');
    
    const StockReceipt = require('./models/StockReceipt');
    const societyId = '698de8471c412087d505272c';
    
    // Get receipts for this society
    const receipts = await StockReceipt.find({ society: societyId });
    console.log('Receipts found:', receipts.length);
    
    // Show items in each receipt
    receipts.forEach(r => {
      console.log('\nReceipt:', r.receiptNumber);
      console.log('  isActive:', r.isActive);
      console.log('  Items:', r.items?.length || 0);
      if (r.items && r.items.length > 0) {
        r.items.forEach(item => {
          console.log('    Item product:', item.product, 'qty:', item.quantity, 'unitPrice:', item.unitPrice);
        });
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
