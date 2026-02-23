const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');

const User = require('../models/User');
const Ledger = require('../models/Ledger');
const Society = require('../models/Society');

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const importMembersFromExcel = async (filePath) => {
  try {
    console.log('🚀 Starting member import from Excel file...');
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} rows in Excel file`);

    // Log first row to see available columns
    if (data.length > 0) {
      console.log('📋 First row columns:', Object.keys(data[0]));
    }

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)
      
      try {
        // Validate required fields
        if (!row.fileno && !row.employeeNo) {
          errors.push(`Row ${rowNum}: Missing member ID (fileno/employeeNo)`);
          errorCount++;
          continue;
        }

        if (!row.surname || !row.firstname) {
          errors.push(`Row ${rowNum}: Missing name (surname/firstname)`);
          errorCount++;
          continue;
        }

        // Use employeeNo as primary, fileno as fallback for memberNumber
        const memberNumber = String(row.employeeNo || row.fileno).trim();

        // Username is padded member ID to meet min length
        const username = memberNumber.padStart(3, '0');

        // Check for existing member
        const existingUser = await User.findOne({
          $or: [
            { memberNumber: memberNumber },
            { username: username }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  Row ${rowNum}: Member ${memberNumber} already exists - skipping`);
          duplicateCount++;
          continue;
        }

        // Get or create society
        let society = null;
        if (row.societycode) {
          society = await Society.findOne({ code: row.societycode });
          if (!society) {
            // Try to find an admin user to use as createdBy
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
              society = await Society.create({
                code: row.societycode,
                name: `Society ${row.societycode}`,
                isActive: true,
                createdBy: adminUser._id
              });
              console.log(`✅ Created society ${row.societycode}`);
            } else {
              console.log(`⚠️  Cannot create society ${row.societycode} - no admin user found`);
              // Continue without society
            }
          }
        }

        // Create User record with existing User model fields
        const user = await User.create({
          username: username,
          memberNumber: memberNumber,
          email: null, // Email will be provided during signup
          password: null, // No password during import
          role: 'member',
          status: 'approved', // Members are approved by default for import
          activated: false, // Not activated until signup
          isActive: true, // Active but not activated
          isEmailVerified: false,
          isPhoneVerified: false,
          society: society?._id,

          // Existing User model fields
          firstName: row.firstname || '',
          lastName: row.surname || '',
          phone: row.teleno || '',

          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Create opening ledger entry if balance exists
        if (row.openbal || row.debit || row.credit) {
          const openingBalance = parseFloat(row.openbal) || 0;
          const debit = parseFloat(row.debit) || 0;
          const credit = parseFloat(row.credit) || 0;
          
          await Ledger.create({
            member: user._id, // Required field - reference to User
            date: new Date(), // Required field
            description: 'Opening Balance - Import',
            debit: debit,
            credit: credit,
            balance: openingBalance + debit - credit,
            transactionType: 'contribution', // Valid enum value
            reference: `IMPORT-${memberNumber}`,
            society: society?._id, // Required field
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        console.log(`✅ Row ${rowNum}: Member ${memberNumber} imported successfully`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Row ${rowNum}: Error processing member`, error.message);
        errors.push(`Row ${rowNum}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📋 IMPORT SUMMARY');
    console.log('==================');
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`⚠️  Duplicates skipped: ${duplicateCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${data.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n🎉 Import completed!');
    
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run import if file path provided
if (process.argv.length < 3) {
  console.log('Usage: node importMembers.js <excel-file-path>');
  console.log('Example: node importMembers.js ./members.xlsx');
  process.exit(1);
}

importMembersFromExcel(process.argv[2]);
