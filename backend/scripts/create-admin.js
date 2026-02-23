const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
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

    // Get society
    const Society = require('../models/Society');
    const society = await Society.findOne({ code: 'POLYIBADAN' });
    if (!society) {
      console.log('❌ Society not found');
      return;
    }

    // Admin user data
    const adminData = {
      username: 'admin',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2tq', // bcrypt hash for 'admin123'
      email: 'admin@polyibadan.edu.ng',
      phone: '+2348010000000',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      status: 'approved',
      activated: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      society: society._id
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Password: admin123`);
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: admin123`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the function
createAdmin();
