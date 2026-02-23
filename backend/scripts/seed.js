const mongoose = require('mongoose');
const User = require('../models/User');
const Society = require('../models/Society');
const EssentialCommodity = require('../models/EssentialCommodity');

// Sample society for testing
const sampleSociety = {
  code: 'POLYIBADAN',
  name: 'Polytechnic Ibadan Cooperative Society',
  street: '123 Main Street',
  town: 'Ibadan',
  state: 'Oyo',
  country: 'Nigeria',
  phone: '+2348012345678',
  email: 'info@polyibadan.edu.ng',
  website: 'https://polyibadan.edu.ng',
  bank: 'First Bank Nigeria',
  bankTitle: 'Polytechnic Ibadan Coop Account',
  smtpPassword: 'smtp_password_here',
  logo: null,
  isActive: true
};

// Sample users for testing
const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@polyibadan.com',
    phone: '+2348012345678',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'staff1',
    password: 'staff123',
    email: 'staff@polyibadan.com',
    phone: '+2348023456789',
    firstName: 'John',
    lastName: 'Staff',
    role: 'staff',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'member1',
    password: 'member123',
    email: 'member@polyibadan.com',
    phone: '+2348034567890',
    firstName: 'Jane',
    lastName: 'Member',
    memberNumber: 'MEM001',
    role: 'member',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'student1',
    password: 'student123',
    email: 'student@polyibadan.com',
    phone: '+2348067890123',
    firstName: 'John',
    lastName: 'Student',
    memberNumber: 'STU001',
    role: 'member',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'teacher1',
    password: 'teacher123',
    email: 'teacher@polyibadan.com',
    phone: '+2348078901234',
    firstName: 'Dr. Mary',
    lastName: 'Teacher',
    memberNumber: 'TEA001',
    role: 'member',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'demo',
    password: 'demo123',
    email: 'demo@polyibadan.com',
    phone: '+2348045678901',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'demomember',
    password: 'demo123',
    email: 'demomember@polyibadan.com',
    phone: '+2348056789012',
    firstName: 'Demo',
    lastName: 'Member',
    memberNumber: 'DEMO001',
    role: 'member',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  }
];

async function seedDatabase() {
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

    const dbName = mongoose.connection.db.databaseName;
    const dbHost = mongoose.connection.host;
    const dbPort = mongoose.connection.port;

    console.log('🌱 Connected to MongoDB');
    console.log(`   📊 Database: ${dbName}`);
    console.log(`   🌐 Host: ${dbHost}:${dbPort}`);
    console.log(`   💡 MongoDB Compass: mongodb://${dbHost}:${dbPort}/${dbName}`);

    // Clear existing data
    await Society.deleteMany({});
    await User.deleteMany({});
    await EssentialCommodity.deleteMany({});
    console.log('🗑️ Cleared existing societies, users, and essential commodities');

    // Create a temporary admin user first for society creation
    const tempAdmin = new User({
      username: 'temp_admin',
      password: 'temp123',
      email: 'temp@polyibadan.com',
      phone: '+2348000000000',
      firstName: 'Temp',
      lastName: 'Admin',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true
    });
    await tempAdmin.save();

    // Create society with temp admin as creator
    const societyData = {
      ...sampleSociety,
      createdBy: tempAdmin._id
    };
    const society = new Society(societyData);
    await society.save();
    console.log('✅ Sample society created successfully');
    console.log(`   📍 Society: ${society.name} (${society.code})`);

    // Create users with society reference
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        society: society._id
      });
      await user.save();
      createdUsers.push({
        username: user.username,
        email: user.email,
        role: user.role
      });
    }

    // Update society createdBy to the first admin user
    const firstAdmin = await User.findOne({ role: 'admin', username: { $ne: 'temp_admin' } });
    if (firstAdmin) {
      society.createdBy = firstAdmin._id;
      await society.save();
    }

    // Remove temp admin
    await User.deleteOne({ username: 'temp_admin' });

    // Create sample essential commodities
    const sampleCommodities = [
      {
        code: 'RICE',
        name: 'Premium Rice',
        description: 'High quality long grain rice',
        category: 'FOOD',
        unit: 'KG',
        minimumStock: 100,
        maximumStock: 1000,
        reorderPoint: 200,
        glAccount: { code: '1001', name: 'Inventory Account' }
      },
      {
        code: 'SUGAR',
        name: 'Refined Sugar',
        description: 'White refined sugar',
        category: 'FOOD',
        unit: 'KG',
        minimumStock: 50,
        maximumStock: 500,
        reorderPoint: 100,
        glAccount: { code: '1001', name: 'Inventory Account' }
      },
      {
        code: 'OIL',
        name: 'Cooking Oil',
        description: 'Vegetable cooking oil',
        category: 'FOOD',
        unit: 'LTR',
        minimumStock: 20,
        maximumStock: 200,
        reorderPoint: 40,
        glAccount: { code: '1001', name: 'Inventory Account' }
      },
      {
        code: 'SOAP',
        name: 'Laundry Soap',
        description: 'Household laundry soap',
        category: 'HOUSEHOLD',
        unit: 'PCS',
        minimumStock: 30,
        maximumStock: 300,
        reorderPoint: 60,
        glAccount: { code: '1001', name: 'Inventory Account' }
      },
      {
        code: 'PARA',
        name: 'Paracetamol',
        description: 'Pain relief medication',
        category: 'MEDICINE',
        unit: 'PCS',
        minimumStock: 10,
        maximumStock: 100,
        reorderPoint: 20,
        glAccount: { code: '1001', name: 'Inventory Account' }
      }
    ];

    for (const commodityData of sampleCommodities) {
      const commodity = new EssentialCommodity(commodityData);
      await commodity.save();
    }

    console.log('✅ Sample essential commodities created successfully');
    console.log('✅ Sample users created successfully');
    console.log('\n📋 Created Users:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.email}`);
    });

    console.log('\n🔐 Login Credentials:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.username}: ${user.password}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now start the server and login with any of the above credentials.');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the seeding function
seedDatabase();