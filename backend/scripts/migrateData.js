/**
 * Data Migration Script
 * 
 * This script helps migrate Essential Commodity and Product data
 * from the previous database to the new MongoDB structure.
 * 
 * Usage:
 * 1. Export your data from the previous database to JSON/CSV
 * 2. Update the data arrays below with your actual data
 * 3. Ensure you have a Society created first
 * 4. Run: node scripts/migrateData.js
 */

const mongoose = require('mongoose');
const EssentialCommodity = require('../models/EssentialCommodity');
const Product = require('../models/Product');
const Society = require('../models/Society');
require('dotenv').config();

// ============================================
// STEP 1: UPDATE THIS WITH YOUR SOCIETY CODE
// ============================================
const SOCIETY_CODE = 'YOUR_SOCIETY_CODE'; // Change this to your society code

// ============================================
// STEP 2: ADD YOUR ESSENTIAL COMMODITY DATA
// ============================================
const essentialCommoditiesData = [
  // Example structure - replace with your actual data
  {
    code: 'EC001',
    name: 'Rice',
    description: 'Premium quality rice',
    category: 'FOOD', // 'FOOD', 'MEDICINE', 'HOUSEHOLD', 'OTHER'
    unit: 'KG', // Unit of measurement
    minimumStock: 100,
    maximumStock: 1000,
    reorderPoint: 200,
    isActive: true
    // glAccount: 'GL_CODE_HERE' // Optional: GL account code
  },
  // Add more commodities here...
];

// ============================================
// STEP 3: ADD YOUR PRODUCT DATA
// ============================================
const productsData = [
  // Example structure - replace with your actual data
  {
    code: 'PROD001',
    name: 'Lux Soap',
    description: 'Premium bathing soap',
    category: 'PERSONAL_CARE', // 'FOOD', 'BEVERAGE', 'HOUSEHOLD', 'PERSONAL_CARE', 'OTHER'
    unit: 'PIECE',
    brand: 'Lux',
    barcode: '8901234567890', // Optional
    hsnCode: '34011100', // Optional
    gstRate: 18, // 0-100
    purchasePrice: 25.50,
    sellingPrice: 30.00,
    mrp: 35.00,
    minimumStock: 50,
    maximumStock: 500,
    reorderPoint: 100,
    openingStock: 200,
    currentStock: 150,
    isActive: true,
    isEssential: false
    // supplier: 'SUPPLIER_CODE', // Optional: Supplier code
    // store: 'STORE_CODE', // Optional: Store code
    // glAccount: 'GL_CODE' // Optional: GL account code
  },
  // Add more products here...
];

// ============================================
// MIGRATION FUNCTION
// ============================================
async function migrateData() {
  try {
    console.log('🔄 Starting data migration...\n');

    // Build MongoDB URI - same logic as server.js
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      const dbName = process.env.MONGODB_DB_NAME || 'polyibadan';
      const dbHost = process.env.MONGODB_HOST || 'localhost';
      const dbPort = process.env.MONGODB_PORT || '27017';
      
      if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
        mongoURI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
      } else {
        mongoURI = `mongodb://${dbHost}:${dbPort}/${dbName}`;
      }
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    const dbName = mongoose.connection.db.databaseName;
    const dbHost = mongoose.connection.host;
    const dbPort = mongoose.connection.port;
    
    console.log('✅ Connected to MongoDB');
    console.log(`   📊 Database: ${dbName}`);
    console.log(`   🌐 Host: ${dbHost}:${dbPort}`);
    console.log(`   💡 MongoDB Compass: mongodb://${dbHost}:${dbPort}/${dbName}\n`);

    // Get society
    const society = await Society.findOne({ 
      code: SOCIETY_CODE.toUpperCase(),
      isActive: true 
    });
    
    if (!society) {
      throw new Error(`❌ Society with code "${SOCIETY_CODE}" not found. Please create a society first.`);
    }

    console.log(`✅ Found Society: ${society.name} (${society.code})\n`);

    // Import Essential Commodities
    console.log('📦 Migrating Essential Commodities...');
    let commoditiesCreated = 0;
    let commoditiesSkipped = 0;

    for (const data of essentialCommoditiesData) {
      try {
        // Check if already exists
        const existing = await EssentialCommodity.findOne({ 
          society: society._id, 
          code: data.code.toUpperCase() 
        });
        
        if (existing) {
          console.log(`⚠️  Essential Commodity already exists: ${data.code} - ${data.name}`);
          commoditiesSkipped++;
          continue;
        }

        // Handle GL account if provided
        let glAccountId = null;
        if (data.glAccount) {
          const DefaultParameter = require('../models/DefaultParameter');
          const glAccount = await DefaultParameter.findOne({
            society: society._id,
            'cashAccount.code': data.glAccount
          });
          if (glAccount) {
            glAccountId = glAccount._id;
          }
        }

        // Create commodity
        const commodity = await EssentialCommodity.create({
          society: society._id,
          code: data.code.toUpperCase(),
          name: data.name,
          description: data.description || '',
          category: data.category || 'OTHER',
          unit: data.unit,
          minimumStock: data.minimumStock || 0,
          maximumStock: data.maximumStock || 0,
          reorderPoint: data.reorderPoint || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          glAccount: glAccountId
        });

        console.log(`✅ Created: ${commodity.code} - ${commodity.name}`);
        commoditiesCreated++;
      } catch (error) {
        console.error(`❌ Error creating commodity ${data.code}:`, error.message);
      }
    }

    console.log(`\n📊 Essential Commodities Summary:`);
    console.log(`   Created: ${commoditiesCreated}`);
    console.log(`   Skipped: ${commoditiesSkipped}\n`);

    // Import Products
    console.log('📦 Migrating Products...');
    let productsCreated = 0;
    let productsSkipped = 0;

    for (const data of productsData) {
      try {
        // Check if already exists
        const existing = await Product.findOne({ 
          society: society._id, 
          code: data.code.toUpperCase() 
        });
        
        if (existing) {
          console.log(`⚠️  Product already exists: ${data.code} - ${data.name}`);
          productsSkipped++;
          continue;
        }

        // Handle supplier if provided
        let supplierId = null;
        if (data.supplier) {
          const Supplier = require('../models/Supplier');
          const supplier = await Supplier.findOne({
            society: society._id,
            code: data.supplier.toUpperCase()
          });
          if (supplier) {
            supplierId = supplier._id;
          } else {
            console.log(`⚠️  Supplier not found: ${data.supplier}`);
          }
        }

        // Handle store if provided
        let storeId = null;
        if (data.store) {
          const StoreInformation = require('../models/StoreInformation');
          const store = await StoreInformation.findOne({
            society: society._id,
            storeCode: data.store.toUpperCase()
          });
          if (store) {
            storeId = store._id;
          } else {
            console.log(`⚠️  Store not found: ${data.store}`);
          }
        }

        // Handle GL account if provided
        let glAccountId = null;
        if (data.glAccount) {
          const DefaultParameter = require('../models/DefaultParameter');
          const glAccount = await DefaultParameter.findOne({
            society: society._id,
            'cashAccount.code': data.glAccount
          });
          if (glAccount) {
            glAccountId = glAccount._id;
          }
        }

        // Create product
        const product = await Product.create({
          society: society._id,
          code: data.code.toUpperCase(),
          name: data.name,
          description: data.description || '',
          category: data.category || 'OTHER',
          unit: data.unit,
          brand: data.brand || '',
          barcode: data.barcode || '',
          hsnCode: data.hsnCode || '',
          gstRate: data.gstRate || 0,
          purchasePrice: data.purchasePrice || 0,
          sellingPrice: data.sellingPrice || 0,
          mrp: data.mrp || 0,
          minimumStock: data.minimumStock || 0,
          maximumStock: data.maximumStock || 0,
          reorderPoint: data.reorderPoint || 0,
          openingStock: data.openingStock || 0,
          currentStock: data.currentStock || data.openingStock || 0,
          supplier: supplierId,
          store: storeId,
          glAccount: glAccountId,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isEssential: data.isEssential || false,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          batchNumber: data.batchNumber || '',
          notes: data.notes || ''
        });

        console.log(`✅ Created: ${product.code} - ${product.name}`);
        productsCreated++;
      } catch (error) {
        console.error(`❌ Error creating product ${data.code}:`, error.message);
      }
    }

    console.log(`\n📊 Products Summary:`);
    console.log(`   Created: ${productsCreated}`);
    console.log(`   Skipped: ${productsSkipped}\n`);

    console.log('✅ Migration completed successfully!');
    console.log(`\n📈 Total Summary:`);
    console.log(`   Essential Commodities: ${commoditiesCreated} created, ${commoditiesSkipped} skipped`);
    console.log(`   Products: ${productsCreated} created, ${productsSkipped} skipped`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
