const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const StoreInformation = require('../models/StoreInformation');
const FinancialPeriod = require('../models/FinancialPeriod');
const DefaultParameter = require('../models/DefaultParameter');
const Security = require('../models/Security');
const Society = require('../models/Society');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Connected to MongoDB');

    // ==================== USERS ====================
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    const users = [
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
        isActive: true,
        status: 'approved'
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
        isActive: true,
        status: 'approved'
      }
    ];

    for (const userData of users) {
      await new User(userData).save();
    }
    console.log('✅ Users created');

    // ==================== STORES ====================
    await StoreInformation.deleteMany({});
    console.log('🗑️ Cleared existing stores');

    const stores = [
      {
        code: 'MAIN',
        name: 'Main Store',
        address: 'Polytechnic Campus',
        phone: '+2348012345678',
        isActive: true
      },
     
    ];

    for (const storeData of stores) {
      await new StoreInformation(storeData).save();
    }
    console.log('✅ Stores created');

    // ==================== FINANCIAL PERIODS ====================
    await FinancialPeriod.deleteMany({});
    console.log('🗑️ Cleared existing financial periods');

    const currentYear = new Date().getFullYear();
    const financialPeriods = [
      {
        code: `${currentYear}`,
        name: `Financial Year ${currentYear}`,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
        isActive: true,
        isClosed: false
      }
    ];

    for (const fpData of financialPeriods) {
      await new FinancialPeriod(fpData).save();
    }
    console.log('✅ Financial periods created');

    // ==================== DEFAULT PARAMETERS ====================
    await DefaultParameter.deleteMany({});
    console.log('🗑️ Cleared existing default parameters');

    const defaultParams = [
      {
        parameterName: 'VAT_RATE',
        parameterValue: '7.5',
        description: 'VAT Rate Percentage'
      },
      {
        parameterName: 'DISCOUNT_RATE',
        parameterValue: '0',
        description: 'Default Discount Rate Percentage'
      },
      {
        parameterName: 'CURRENCY',
        parameterValue: 'NGN',
        description: 'Currency Code'
      },
      {
        parameterName: 'COMPANY_NAME',
        parameterValue: 'CICS Polytechnic Ibadan',
        description: 'Company Name'
      },
      {
        parameterName: 'COMPANY_ADDRESS',
        parameterValue: 'Polytechnic Campus, Ibadan',
        description: 'Company Address'
      }
    ];

    for (const paramData of defaultParams) {
      await new DefaultParameter(paramData).save();
    }
    console.log('✅ Default parameters created');

    // ==================== SECURITY ====================
    await Security.deleteMany({});
    console.log('🗑️ Cleared existing security settings');

    const security = new Security({
      utility: true,
      sales: true,
      purchase: true,
      ledger: true,
      reports: true,
      members: true,
      accounts: true
    });
    await security.save();
    console.log('✅ Security settings created');

    // ==================== SOCIETY ====================
    await Society.deleteMany({});
    console.log('🗑️ Cleared existing societies');

    // Get admin user for createdBy
    const adminUser = await User.findOne({ username: 'admin' });

    const societies = [
      {
        code: 'CICS',
        name: 'CICS Polytechnic Ibadan Cooperative Society',
        street: 'Polytechnic Campus',
        town: 'Ibadan',
        state: 'Oyo',
        country: 'Nigeria',
        phone: '+2348033333333',
        email: 'cicscoop@polyibadan.edu.ng',
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    for (const societyData of societies) {
      await new Society(societyData).save();
    }
    console.log('✅ Societies created');

    // ==================== MEMBERS ====================
    await User.deleteMany({ role: 'member' });
    console.log('🗑️ Cleared existing members');

    const society = await Society.findOne({ code: 'CICS' });

    const members = [
      {
        username: 'MEM001',
        memberNumber: 'MEM001',
        password: 'member123',
        email: 'adebayo@example.com',
        firstName: 'Adebayo',
        lastName: 'Ayodele',
        phone: '+2348051111111',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM002',
        memberNumber: 'MEM002',
        password: 'member123',
        email: 'oladipo@example.com',
        firstName: 'Oladipo',
        lastName: 'Babatunde',
        phone: '+2348052222222',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM003',
        memberNumber: 'MEM003',
        password: 'member123',
        email: 'adekemi@example.com',
        firstName: 'Adekemi',
        lastName: 'Oloruntobi',
        phone: '+2348053333333',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM004',
        memberNumber: 'MEM004',
        password: 'member123',
        email: 'olumide@example.com',
        firstName: 'Olumide',
        lastName: 'Adesina',
        phone: '+2348054444444',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM005',
        memberNumber: 'MEM005',
        password: 'member123',
        email: 'fatima@example.com',
        firstName: 'Fatima',
        lastName: 'Abubakar',
        phone: '+2348055555555',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM006',
        memberNumber: 'MEM006',
        password: 'member123',
        email: 'tunde@example.com',
        firstName: 'Tunde',
        lastName: 'Akindele',
        phone: '+2348056666666',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM007',
        memberNumber: 'MEM007',
        password: 'member123',
        email: 'grace@example.com',
        firstName: 'Grace',
        lastName: 'Ojo',
        phone: '+2348057777777',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM008',
        memberNumber: 'MEM008',
        password: 'member123',
        email: 'ismail@example.com',
        firstName: 'Ismail',
        lastName: 'Lawal',
        phone: '+2348058888888',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM009',
        memberNumber: 'MEM009',
        password: 'member123',
        email: 'mercy@example.com',
        firstName: 'Mercy',
        lastName: 'Samuel',
        phone: '+2348059999999',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      },
      {
        username: 'MEM010',
        memberNumber: 'MEM010',
        password: 'member123',
        email: 'david@example.com',
        firstName: 'David',
        lastName: 'Okonkwo',
        phone: '+2348060000000',
        role: 'member',
        status: 'approved',
        activated: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        society: society._id
      }
    ];

    for (const memberData of members) {
      await new User(memberData).save();
    }
    console.log('✅ Members created');

    // ==================== PRODUCTS ====================
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    const products = [
      {
        code: 'RICE',
        name: 'Rice',
        category: 'Grains',
        unit: 'bag',
        costPerUnit: 25000,
        sellingPrice: 28000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'GARRI',
        name: 'Garri',
        category: 'Grains',
        unit: 'bag',
        costPerUnit: 15000,
        sellingPrice: 18000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'BEANS',
        name: 'Beans',
        category: 'Grains',
        unit: 'bag',
        costPerUnit: 20000,
        sellingPrice: 23000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'MAIZE',
        name: 'Maize',
        category: 'Grains',
        unit: 'bag',
        costPerUnit: 12000,
        sellingPrice: 15000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'SUGAR',
        name: 'Sugar',
        category: 'Condiments',
        unit: 'bag',
        costPerUnit: 18000,
        sellingPrice: 21000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'SALT',
        name: 'Salt',
        category: 'Condiments',
        unit: 'carton',
        costPerUnit: 5000,
        sellingPrice: 6500,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'MAGGI',
        name: 'Maggi Cubes',
        category: 'Condiments',
        unit: 'carton',
        costPerUnit: 3000,
        sellingPrice: 4000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'TOMATO_PASTE',
        name: 'Tomato Paste',
        category: 'Condiments',
        unit: 'carton',
        costPerUnit: 8000,
        sellingPrice: 10000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'PALM_OIL',
        name: 'Palm Oil',
        category: 'Oils',
        unit: 'drum',
        costPerUnit: 35000,
        sellingPrice: 40000,
        measure: 'PIECE',
        isActive: true
      },
      {
        code: 'GROUNDNUT_OIL',
        name: 'Groundnut Oil',
        category: 'Oils',
        unit: 'drum',
        costPerUnit: 40000,
        sellingPrice: 45000,
        measure: 'PIECE',
        isActive: true
      }
    ];

    for (const productData of products) {
      await new Product(productData).save();
    }
    console.log('✅ Products created');

    // ==================== SUPPLIERS ====================
    await Supplier.deleteMany({});
    console.log('🗑️ Cleared existing suppliers');

    const suppliers = [
      {
        code: 'SUP001',
        name: 'ABC Grain Suppliers',
        contactPerson: 'Mr. Adebola',
        phone: '+2348011111111',
        email: 'abcgrains@gmail.com',
        address: 'Mokola Market, Ibadan',
        isActive: true
      },
      {
        code: 'SUP002',
        name: 'XYZ Commodities',
        contactPerson: 'Mrs. Folake',
        phone: '+2348022222222',
        email: 'xyzcomm@yahoo.com',
        address: 'Bodija Market, Ibadan',
        isActive: true
      },
      {
        code: 'SUP003',
        name: 'Global Foods Ltd',
        contactPerson: 'Mr. Chidi',
        phone: '+2348033333333',
        email: 'globalfoods@gmail.com',
        address: 'Ring Road, Ibadan',
        isActive: true
      }
    ];

    for (const supplierData of suppliers) {
      await new Supplier(supplierData).save();
    }
    console.log('✅ Suppliers created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Staff: staff1 / staff123');
    console.log('\n📋 Sample Members (for testing sales):');
    console.log('   MEM001: member123');
    console.log('   MEM002: member123');
    console.log('   MEM003: member123');
    console.log('   (and more...)');
    console.log('\n🚀 You can now start the server and login.');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the seeding function
seedDatabase();
