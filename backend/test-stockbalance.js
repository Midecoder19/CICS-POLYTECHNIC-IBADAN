// Test stock balance calculation
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
    console.log('Connected to MongoDB');
    
    // Require all models
    require('./models/Product');
    require('./models/StockReceipt');
    require('./models/StockSales');
    
    const StockReceipt = require('./models/StockReceipt');
    const StockSales = require('./models/StockSales');
    
    const societyId = '698de8471c412087d505272c';
    
    // Get all stock receipts with populated products
    const receipts = await StockReceipt.find({ society: societyId })
      .populate('items.product', 'code name unit');
    
    console.log('\n=== Stock Balance Test ===');
    console.log('Society:', societyId);
    console.log('Receipts found:', receipts.length);
    
    const productBalances = {};
    
    receipts.forEach((receipt, rIdx) => {
      console.log(`\nReceipt ${rIdx + 1}: ${receipt.receiptNumber}, isActive: ${receipt.isActive}`);
      
      if (receipt.items && receipt.items.length > 0) {
        receipt.items.forEach(item => {
          const productObj = item.product;
          // Handle both populated and non-populated cases
          const productId = productObj?._id?.toString() || item.product?.toString();
          const productCode = productObj?.code || 'N/A';
          const productName = productObj?.name || 'N/A';
          const qty = item.quantity || 0;
          
          console.log(`  Product: ${productCode} - ${productName}`);
          console.log(`  Product ID: ${productId}`);
          console.log(`  Quantity: ${qty}`);
          
          if (!productBalances[productId]) {
            productBalances[productId] = {
              productCode,
              productName,
              quantityOnHand: 0
            };
          }
          productBalances[productId].quantityOnHand += qty;
        });
      }
    });
    
    console.log('\n=== Final Stock Balances ===');
    Object.entries(productBalances).forEach(([prodId, data]) => {
      console.log(`${data.productCode} - ${data.productName}: ${data.quantityOnHand}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
