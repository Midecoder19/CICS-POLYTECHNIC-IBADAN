const mongoose = require('mongoose');
const User = require('./models/User');

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
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        username: user.username,
        email: user.email,
        role: user.role
      });
    }

    console.log('✅ Sample users created successfully');
    console.log('\n📋 Created Users:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.email}`);
    });

    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Staff: staff1 / staff123');
    console.log('   Demo: demo / demo');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
