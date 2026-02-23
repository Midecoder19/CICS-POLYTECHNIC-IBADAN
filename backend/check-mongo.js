const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoConnection() {
  try {
    console.log('🔍 Checking MongoDB connection...');

    // Set connection timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Try to connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', options);

    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);

    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');

    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB service is started');
      console.log('3. Try running: npm run start-mongodb');
      console.log('4. Or run: scripts\\fix-mongodb-service.bat');
    }

    process.exit(1);
  }
}

checkMongoConnection();
