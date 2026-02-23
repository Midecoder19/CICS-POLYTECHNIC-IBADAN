const mongoose = require('mongoose');
const fs = require('fs');
const pdf = require('pdf-parse');
const Product = require('../models/Product');
const StockBalance = require('../models/StockBalance');
const StoreInformation = require('../models/StoreInformation');
const Society = require('../models/Society');

async function importProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/polyibadan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get default society (assuming there's one)
    const society = await Society.findOne();
    if (!society) {
      throw new Error('No society found in database');
    }

    // Read PDF file
    const pdfPath = 'C:\\Users\\ayomi\\Downloads\\product.pdf';
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    console.log('PDF text extracted');

    // Parse the text to extract table rows
    // Assuming the PDF text is in a tabular format with lines like:
    // S/No | Store Code | Description | Type(Category) | Measure | Fraction | Price
    const lines = text.split('\n').filter(line => line.trim());
    const products = [];

    for (const line of lines) {
      // Skip header or empty lines
      if (line.includes('S/No') || line.includes('Store Code') || !line.trim()) continue;

      // Split by | or multiple spaces
      const columns = line.split(/\s*\|\s*|\s{2,}/).map(col => col.trim());
      if (columns.length < 7) continue; // Ensure enough columns

      const [sno, storeCode, description, type, measure, fraction, priceStr] = columns;

      // Parse price
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

      // Find store
      const store = await StoreInformation.findOne({ code: storeCode });
      if (!store) {
        console.warn(`Store with code ${storeCode} not found, skipping product: ${description}`);
        continue;
      }

      // Generate product code (assuming unique)
      const productCode = `PROD${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

      const product = {
        society: society._id,
        code: productCode,
        name: description,
        category: type.toUpperCase(),
        unit: measure,
        sellingPrice: price,
        store: store._id,
        isActive: true,
      };

      products.push(product);
    }

    console.log(`Parsed ${products.length} products`);

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);

    // Create StockBalance for each product
    const stockBalances = insertedProducts.map(product => ({
      society: society._id,
      product: product._id,
      productCode: product.code,
      productName: product.name,
      unit: product.unit,
      quantityOnHand: 0,
      isActive: true,
    }));

    await StockBalance.insertMany(stockBalances);
    console.log(`Created ${stockBalances.length} stock balance records`);

    console.log('Import completed successfully');

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

importProducts();
