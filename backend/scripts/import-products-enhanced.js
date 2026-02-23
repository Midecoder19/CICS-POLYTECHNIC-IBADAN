const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Product = require('../models/Product');
const Society = require('../models/Society');
const StoreInformation = require('../models/StoreInformation');
require('dotenv').config();

// Expected Excel columns based on requirements
const EXPECTED_COLUMNS = {
  'S/NO': 'serialNumber',
  'STORE CODE': 'storeCode',
  'DESCRIPTION': 'description',
  'CATEGORY': 'category',
  'MEASURE': 'measure',
  'FRACTION': 'fraction',
  'PRICE': 'price'
};

async function importProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get or create default society
    let society = await Society.findOne({ code: 'POLYIBADAN' });
    if (!society) {
      society = await Society.create({
        name: 'PolyIbadan Cooperative',
        code: 'POLYIBADAN',
        address: 'PolyIbadan Campus, Ibadan, Nigeria',
        phone: '+2348000000000',
        email: 'info@polyibadan.edu',
        isActive: true
      });
      console.log('✅ Created default society');
    }

    // Get or create default store
    let store = await StoreInformation.findOne({ code: 'MAIN' });
    if (!store) {
      store = await StoreInformation.create({
        name: 'Main Store',
        code: 'MAIN',
        address: 'Main Store Building',
        society: society._id,
        isActive: true
      });
      console.log('✅ Created default store');
    }

    // Check if products file exists
    const filePath = process.argv[2];
    if (!filePath) {
      console.log('❌ Please provide the path to the Excel file');
      console.log('Usage: node import-products.js <path-to-excel-file>');
      return;
    }

    console.log(`📖 Reading Excel file: ${filePath}`);

    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        console.log('❌ No data found in Excel file');
        return;
      }

      console.log(`📊 Found ${data.length} rows in Excel file`);

      // Clear existing products (optional - comment out if you want to preserve)
      console.log('🗑️  Clearing existing products...');
      await Product.deleteMany({});

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          // Map Excel columns to product fields
          const productData = {
            code: row['STORE CODE'] || row['STORE_CODE'] || `PROD${String(i + 1).padStart(4, '0')}`,
            description: row['DESCRIPTION'] || row['DESCRIPTION'] || '',
            category: row['CATEGORY'] || row['CATEGORY'] || 'General',
            measure: row['MEASURE'] || row['MEASURE'] || 'Units',
            fraction: row['FRACTION'] || row['FRACTION'] || 1,
            price: parseFloat(row['PRICE']) || row['PRICE'] || 0,
            unitPrice: parseFloat(row['PRICE']) || row['PRICE'] || 0,
            society: society._id,
            store: store._id,
            isActive: true,
            createdBy: null // Will be set by the system
          };

          // Validate required fields
          if (!productData.description || !productData.code) {
            console.log(`⚠️  Row ${i + 1}: Missing required fields (description or code)`);
            errorCount++;
            continue;
          }

          // Create product
          const product = new Product(productData);
          await product.save();
          
          console.log(`✅ Imported: ${productData.code} - ${productData.description}`);
          successCount++;
          
        } catch (error) {
          console.log(`❌ Row ${i + 1}: ${error.message}`);
          errorCount++;
        }
      }

      console.log('\n🎉 Product import completed!');
      console.log(`✅ Successfully imported: ${successCount} products`);
      console.log(`❌ Failed to import: ${errorCount} products`);
      console.log(`📊 Total processed: ${data.length} rows`);

    } catch (fileError) {
      console.error('❌ Error reading Excel file:', fileError.message);
      console.log('💡 Make sure the file is a valid Excel (.xlsx, .xls) file');
    }

  } catch (error) {
    console.error('❌ Import error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Create a sample Excel template
async function createSampleTemplate() {
  try {
    const sampleData = [
      {
        'S/NO': 1,
        'STORE CODE': 'PROD0001',
        'DESCRIPTION': 'Sample Product 1',
        'CATEGORY': 'Food Items',
        'MEASURE': 'Pieces',
        'FRACTION': 1,
        'PRICE': 150.50
      },
      {
        'S/NO': 2,
        'STORE CODE': 'PROD0002',
        'DESCRIPTION': 'Sample Product 2',
        'CATEGORY': 'Stationery',
        'MEASURE': 'Units',
        'FRACTION': 1,
        'PRICE': 75.00
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const fileName = 'product-import-template.xlsx';
    xlsx.writeFile(workbook, fileName);
    
    console.log(`✅ Sample template created: ${fileName}`);
    console.log('📝 Fill this template with your product data and use it for import');
  } catch (error) {
    console.error('❌ Error creating template:', error);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === '--template') {
  createSampleTemplate();
} else if (command && !command.startsWith('--')) {
  importProducts();
} else {
  console.log('Product Import Tool');
  console.log('');
  console.log('Usage:');
  console.log('  node import-products.js <path-to-excel-file>    Import products from Excel file');
  console.log('  node import-products.js --template              Create sample Excel template');
  console.log('');
  console.log('Excel file format (columns must be named exactly as shown):');
  console.log('  S/NO - Serial number (optional)');
  console.log('  STORE CODE - Product code (required)');
  console.log('  DESCRIPTION - Product description (required)');
  console.log('  CATEGORY - Product category (optional)');
  console.log('  MEASURE - Unit of measure (optional)');
  console.log('  FRACTION - Fraction value (optional, default: 1)');
  console.log('  PRICE - Unit price (required)');
}

module.exports = { importProducts, createSampleTemplate };
