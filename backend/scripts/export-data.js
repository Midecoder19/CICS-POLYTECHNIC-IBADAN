// Simple data export script
// Run: node scripts/export-data.js
// This will create a data.json file with all database data

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function exportData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const data = {};
    let totalDocs = 0;

    for (const coll of collections) {
      const name = coll.name;
      if (name.startsWith('system.')) continue;
      
      const documents = await db.collection(name).find({}).toArray();
      data[name] = documents;
      totalDocs += documents.length;
      console.log(`- ${name}: ${documents.length} documents`);
    }

    // Write to file
    const outputPath = path.join(__dirname, '..', 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Exported ${totalDocs} documents to: ${outputPath}`);
    console.log('Transfer this file to the client computer!');
    
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

exportData();
