const mongoose = require('mongoose');
const User = require('../models/User');

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const fixMemberStatus = async () => {
  try {
    console.log('🔧 Fixing member status...');

    // Update all members with status 'pending' to 'approved'
    const result = await User.updateMany(
      { role: 'member', status: 'pending' },
      { $set: { status: 'approved' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} members from 'pending' to 'approved'`);

    // Check how many members are now approved
    const approvedCount = await User.countDocuments({ role: 'member', status: 'approved' });
    console.log(`📊 Total approved members: ${approvedCount}`);

  } catch (error) {
    console.error('❌ Error fixing member status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

fixMemberStatus();
