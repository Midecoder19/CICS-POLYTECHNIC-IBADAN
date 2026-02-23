/**
 * MongoDB Startup Helper Script
 * 
 * This script helps diagnose and start MongoDB on Windows
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function checkMongoDBService() {
  try {
    const { stdout } = await execAsync('sc query MongoDB');
    if (stdout.includes('RUNNING')) {
      return { status: 'running', message: 'MongoDB service is already running' };
    } else if (stdout.includes('STOPPED')) {
      return { status: 'stopped', message: 'MongoDB service is stopped' };
    } else {
      return { status: 'not_found', message: 'MongoDB service not found' };
    }
  } catch (error) {
    return { status: 'not_found', message: 'MongoDB service not found or not installed' };
  }
}

async function startMongoDBService() {
  try {
    console.log('🔄 Attempting to start MongoDB service...');
    await execAsync('net start MongoDB');
    console.log('✅ MongoDB service started successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to start MongoDB service:', error.message);
    return false;
  }
}

async function checkPort27017() {
  try {
    const { stdout } = await execAsync('netstat -ano | findstr :27017');
    if (stdout) {
      const lines = stdout.trim().split('\n');
      const pids = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(pid => pid && pid !== '0');
      
      return { inUse: true, pids: [...new Set(pids)] };
    }
    return { inUse: false, pids: [] };
  } catch (error) {
    return { inUse: false, pids: [] };
  }
}

async function findMongoDBInstallation() {
  const commonPaths = [
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\4.4\\bin\\mongod.exe',
    'C:\\mongodb\\bin\\mongod.exe',
  ];

  const fs = require('fs');
  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return null;
}

async function main() {
  console.log('🔍 MongoDB Diagnostic Tool\n');
  console.log('='.repeat(50));

  // Check MongoDB service
  console.log('\n1️⃣ Checking MongoDB Service...');
  const serviceStatus = await checkMongoDBService();
  console.log(`   Status: ${serviceStatus.status}`);
  console.log(`   ${serviceStatus.message}`);

  if (serviceStatus.status === 'stopped') {
    console.log('\n🔄 Attempting to start MongoDB service...');
    const started = await startMongoDBService();
    if (started) {
      console.log('\n✅ MongoDB should now be running!');
      console.log('💡 Try connecting again with: npm run check-mongo');
      return;
    }
  }

  // Check port 27017
  console.log('\n2️⃣ Checking Port 27017...');
  const portStatus = await checkPort27017();
  if (portStatus.inUse) {
    console.log(`   ⚠️  Port 27017 is in use by process(es): ${portStatus.pids.join(', ')}`);
    console.log('   This might be MongoDB or another application');
  } else {
    console.log('   ❌ Port 27017 is not in use - MongoDB is not running');
  }

  // Find MongoDB installation
  console.log('\n3️⃣ Searching for MongoDB Installation...');
  const mongoPath = await findMongoDBInstallation();
  if (mongoPath) {
    console.log(`   ✅ Found MongoDB at: ${mongoPath}`);
    console.log('\n💡 To start MongoDB manually, run:');
    console.log(`   "${mongoPath}" --dbpath "C:\\data\\db"`);
  } else {
    console.log('   ❌ MongoDB installation not found in common locations');
    console.log('   💡 You may need to install MongoDB or add it to PATH');
  }

  // Provide solutions
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Solutions:\n');

  if (serviceStatus.status === 'not_found') {
    console.log('❌ MongoDB is not installed or service is not set up');
    console.log('\n📥 Install MongoDB:');
    console.log('   1. Download from: https://www.mongodb.com/try/download/community');
    console.log('   2. Run the installer');
    console.log('   3. Choose "Install MongoDB as a Service"');
    console.log('   4. Restart this script after installation');
  } else if (serviceStatus.status === 'stopped') {
    console.log('✅ MongoDB service exists but is stopped');
    console.log('\n🚀 Start MongoDB:');
    console.log('   Option 1: Run as Administrator:');
    console.log('      net start MongoDB');
    console.log('\n   Option 2: Use Windows Services:');
    console.log('      1. Press Win + R, type "services.msc"');
    console.log('      2. Find "MongoDB" service');
    console.log('      3. Right-click → Start');
    console.log('      4. Set Startup Type to "Automatic"');
  } else if (serviceStatus.status === 'running') {
    console.log('✅ MongoDB service is running');
    console.log('   If you still get connection errors, try:');
    console.log('   1. Restart MongoDB service: net stop MongoDB && net start MongoDB');
    console.log('   2. Check firewall settings');
    console.log('   3. Verify MongoDB is listening on 127.0.0.1:27017');
  }

  console.log('\n💡 Alternative: Start MongoDB manually');
  if (mongoPath) {
    console.log(`   "${mongoPath}" --dbpath "C:\\data\\db"`);
  } else {
    console.log('   mongod.exe --dbpath "C:\\data\\db"');
    console.log('   (Make sure MongoDB bin directory is in PATH)');
  }

  console.log('\n📝 Create data directory if it doesn\'t exist:');
  console.log('   mkdir C:\\data\\db');

  console.log('\n' + '='.repeat(50));
}

main().catch(console.error);
