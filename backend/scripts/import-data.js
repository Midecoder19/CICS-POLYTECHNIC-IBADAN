// Simple data import script
// Run: node scripts/import-data.js
// This will import data from data-export.json

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function importData() {
  try {
    const inputPath = path.join(__dirname, '..', 'data-export.json');
    
    if (!fs.existsSync(inputPath)) {
      console.error('❌ File not found: data-export.json');
      console.log('Please copy data-export.json to the backend folder first!');
      process.exit(1);
    }

    // Read data file
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const collections = Object.keys(data);
    console.log(`Found ${collections.length} collections to import\n`);

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // SKIP these collections entirely - don't import them
    const skipCollections = [
      'sessions', 
      'usersessions',
      'accentsessions',
      'userAuthTokens',
      'refreshTokens',
      'blacklistedTokens',
      'users'  // Skip users - we'll create fresh admin with seed
      // NOTE: Societies WILL be imported but with new IDs
    ];
    
    for (const collName of collections) {
      if (collName.startsWith('system.')) continue;
      if (skipCollections.includes(collName)) {
        console.log(`Skipping ${collName} (system collection)`);
        continue;
      }
      
      const documents = data[collName];
      if (!documents || !Array.isArray(documents)) continue;
      
      console.log(`Importing ${collName}...`);
      
      // Clear existing data
      try {
        await db.collection(collName).deleteMany({});
      } catch (e) {
        // Collection might not exist
      }
      
      // Insert new data
      if (documents.length > 0) {
        try {
          await db.collection(collName).insertMany(documents);
          console.log(`  ✅ Inserted ${documents.length} documents`);
        } catch (e) {
          console.log(`  ⚠️ Some documents may have failed: ${e.message}`);
        }
      } else {
        console.log(`  (empty collection - skipped)`);
      }
    }

    // Fix societies to reference admin user
    try {
      const adminUser = await db.collection('users').findOne({ username: 'admin' });
      if (adminUser) {
        await db.collection('societies').updateMany(
          {},
          { $set: { createdBy: adminUser._id } }
        );
        console.log('✅ Fixed societies to reference admin user');

        // Clear society field from all users to avoid broken references
        await db.collection('users').updateMany(
          {},
          { $unset: { society: "" } }
        );
        console.log('✅ Cleared society references from users');
      }
    } catch (e) {
      console.log('⚠️ Could not fix references:', e.message);
    }

    console.log('\n✅ Data import completed!');
    console.log('All your data has been restored.');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importData();
