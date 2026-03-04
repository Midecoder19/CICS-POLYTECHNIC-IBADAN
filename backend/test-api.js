// Test the stock-balances API endpoint
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
    console.log('Connected to MongoDB');
    
    // Load all models
    require('./models/Product');
    require('./models/StockReceipt');
    require('./models/StockSales');
    
    const stockBalanceController = require('./controllers/stockBalanceController');
    
    // Create mock request
    const req = {
      query: {
        society: '698de8471c412087d505272c'
      }
    };
    
    // Create mock response
    const res = {
      json: (data) => {
        console.log('\n=== API Response ===');
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        console.log('Data:', JSON.stringify(data.data, null, 2));
        return data;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      }
    };
    
    await stockBalanceController.getStockBalances(req, res);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
