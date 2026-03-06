// Special script to import members from exported data
// This handles the circular reference between users and societies

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function importMembers() {
  try {
    const inputPath = path.join(__dirname, '..', 'data-export.json');
    
    if (!fs.existsSync(inputPath)) {
      console.error('❌ File not found: data-export.json');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    // Check if we have users and societies in the export
    const users = data.users || [];
    const societies = data.societies || [];
    
    console.log(`Found ${users.length} users and ${societies.length} societies in export\n`);

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // Get the admin user (created by seed)
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found! Run seed first.');
      process.exit(1);
    }
    console.log(`Found admin user: ${adminUser._id}`);

    // Map old society IDs to new IDs
    const societyIdMap = {};
    
    // Import societies with new IDs
    if (societies.length > 0) {
      console.log('\nImporting societies...');
      await db.collection('societies').deleteMany({});
      
      for (const society of societies) {
        const oldId = society._id;
        delete society._id;
        society.createdBy = adminUser._id;
        
        const result = await db.collection('societies').insertOne(society);
        societyIdMap[oldId] = result.insertedId;
        console.log(`  - ${society.name}: ${society.code}`);
      }
    }

    // Get the new society ID
    const newSociety = await db.collection('societies').findOne({ code: 'CICS' });
    const societyId = newSociety ? newSociety._id : null;

    // Import members (users with role: 'member')
    const members = users.filter(u => u.role === 'member');
    console.log(`\nImporting ${members.length} members...`);
    
    // Delete existing members
    await db.collection('users').deleteMany({ role: 'member' });
    
    let imported = 0;
    for (const member of members) {
      delete member._id;
      delete member.society;  // Remove old society reference
      
      // Link to the new society if we have one
      if (societyId) {
        member.society = societyId;
      }
      
      /* Make sure password is hashed (will be hashed by pre-save)
         But since we're inserting directly, let's keep the password as-is
         The user can reset password if needed */
      
      try {
        await db.collection('users').insertOne(member);
        imported++;
      } catch (e) {
        // Skip if duplicate username
        if (e.code !== 11000) {
          console.log(`  ⚠️ Failed to import ${member.username}: ${e.message}`);
        }
      }
    }

    console.log(`\n✅ Successfully imported ${imported} members!`);
    
    if (societyId) {
      console.log('Members linked to society: CICS');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importMembers();
