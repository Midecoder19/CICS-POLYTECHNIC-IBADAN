const mongoose = require('mongoose');

const User = require('../models/User');
const Ledger = require('../models/Ledger');
const Society = require('../models/Society');

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const deleteImportedMembers = async () => {
  try {
    console.log('🗑️ Starting deletion of imported members...');

    // Find all imported members (role: 'member')
    const importedMembers = await User.find({ role: 'member' });

    console.log(`📊 Found ${importedMembers.length} imported members to delete`);

    let deletedUsers = 0;
    let deletedLedgers = 0;
    let deletedSocieties = 0;

    for (const member of importedMembers) {
      // Delete ledger entries for this member
      const ledgerResult = await Ledger.deleteMany({ member: member._id });
      deletedLedgers += ledgerResult.deletedCount;

      // Delete the user
      await User.findByIdAndDelete(member._id);
      deletedUsers++;

      console.log(`✅ Deleted member ${member.memberNumber} (${member.username})`);
    }

    // Optionally delete societies that were created during import and have no members
    // Find societies that have no members
    const societiesToDelete = await Society.find({
      $and: [
        { _id: { $nin: await User.distinct('society') } }, // No users reference this society
        { code: { $exists: true } } // Assuming imported societies have code
      ]
    });

    for (const society of societiesToDelete) {
      await Society.findByIdAndDelete(society._id);
      deletedSocieties++;
      console.log(`✅ Deleted society ${society.code}`);
    }

    // Summary
    console.log('\n📋 DELETION SUMMARY');
    console.log('==================');
    console.log(`✅ Users deleted: ${deletedUsers}`);
    console.log(`✅ Ledger entries deleted: ${deletedLedgers}`);
    console.log(`✅ Societies deleted: ${deletedSocieties}`);

    console.log('\n🎉 Deletion completed!');

  } catch (error) {
    console.error('💥 Fatal error during deletion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run deletion
deleteImportedMembers();
