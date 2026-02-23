const mongoose = require('mongoose');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Ledger = require('../models/Ledger');

async function seedMemberData() {
  try {
    // Build MongoDB URI
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

    // Get demo members
    const members = await User.find({
      role: 'member',
      society: society._id,
      memberNumber: { $exists: true }
    });

    if (members.length === 0) {
      console.log('❌ No demo members found. Run create-demo-members.js first.');
      return;
    }

    console.log(`📋 Found ${members.length} members`);

    // Seed loans and ledger for each member
    for (const member of members) {
      // Create a loan
      const loan = new Loan({
        member: member._id,
        loanType: 'personal',
        principal: 50000 + Math.floor(Math.random() * 50000), // 50k-100k
        balance: 30000 + Math.floor(Math.random() * 30000), // 30k-60k
        status: 'active',
        interestRate: 12,
        termMonths: 12,
        society: society._id
      });
      await loan.save();

      // Create ledger entries
      const ledgerEntries = [
        {
          member: member._id,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          description: 'Loan Disbursement',
          credit: loan.principal,
          balance: loan.principal,
          transactionType: 'loan_disbursement',
          reference: `LOAN-${loan._id.toString().slice(-6)}`,
          society: society._id
        },
        {
          member: member._id,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          description: 'Monthly Contribution',
          debit: 5000,
          balance: loan.principal - 5000,
          transactionType: 'contribution',
          reference: 'CONTRIB-001',
          society: society._id
        },
        {
          member: member._id,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          description: 'Loan Payment',
          debit: 8000,
          balance: loan.principal - 5000 - 8000,
          transactionType: 'loan_payment',
          reference: `PAY-${loan._id.toString().slice(-6)}`,
          society: society._id
        }
      ];

      for (const entry of ledgerEntries) {
        const ledgerEntry = new Ledger(entry);
        await ledgerEntry.save();
      }

      console.log(`✅ Seeded data for member ${member.memberNumber}: ${member.firstName} ${member.lastName}`);
    }

    console.log('🎉 Member data seeding completed successfully');

  } catch (error) {
    console.error('❌ Failed to seed member data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the function
seedMemberData();
