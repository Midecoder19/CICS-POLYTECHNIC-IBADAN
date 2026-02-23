const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  try {
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

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('🔗 Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password hashed: ${admin.password ? 'Yes' : 'No'}`);
    console.log(`   Password starts with $2b$: ${admin.password.startsWith('$2b$')}`);
    console.log(`   Is Active: ${admin.isActive}`);
    console.log(`   Activated: ${admin.activated}`);

    // Test password comparison
    const isValid = await admin.comparePassword('admin123');
    console.log(`   Password 'admin123' valid: ${isValid}`);

  } catch (error) {
    console.error('❌ Error checking admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the function
checkAdmin();
