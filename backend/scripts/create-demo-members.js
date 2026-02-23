const mongoose = require('mongoose');
const User = require('../models/User');

async function createDemoMembers() {
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

    // Demo members data
    const demoMembers = [
      {
        username: 'student_demo',
        password: 'demo123',
        email: 'student_demo@polyibadan.edu.ng',
        phone: '+2348010000001',
        firstName: 'Alice',
        lastName: 'Johnson',
        memberNumber: 'STU2024001',
        role: 'member',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        activated: true,
        status: 'approved'
      },
      {
        username: 'teacher_demo',
        password: 'demo123',
        email: 'teacher_demo@polyibadan.edu.ng',
        phone: '+2348010000002',
        firstName: 'Dr. Robert',
        lastName: 'Smith',
        memberNumber: 'TEA2024001',
        role: 'member',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        activated: true,
        status: 'approved'
      },
      {
        username: 'staff_demo',
        password: 'demo123',
        email: 'staff_demo@polyibadan.edu.ng',
        phone: '+2348010000003',
        firstName: 'Michael',
        lastName: 'Brown',
        memberNumber: 'STF2024001',
        role: 'member',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        activated: true,
        status: 'approved'
      }
    ];

    // Create demo members
    const createdMembers = [];
    for (const memberData of demoMembers) {
      const existingUser = await User.findOne({ username: memberData.username });
      if (existingUser) {
        console.log(`⚠️ User ${memberData.username} already exists, skipping...`);
        continue;
      }

      const user = new User({
        ...memberData,
        society: society._id
      });
      await user.save();
      createdMembers.push({
        username: user.username,
        memberNumber: user.memberNumber,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      });
    }

    console.log('✅ Demo members created successfully');
    console.log('\n📋 Created Demo Members:');
    createdMembers.forEach(member => {
      console.log(`   - ${member.name} (${member.username}) - Member No: ${member.memberNumber}`);
    });

    console.log('\n🔐 Login Credentials:');
    demoMembers.forEach(member => {
      console.log(`   ${member.username}: ${member.password}`);
    });

  } catch (error) {
    console.error('❌ Failed to create demo members:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the function
createDemoMembers();
