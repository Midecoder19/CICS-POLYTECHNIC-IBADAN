const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polyibadan');
  
  const User = require('./models/User');
  
  // Get users with their society
  const users = await User.find({}).select('username firstName lastName society').limit(5);
  
  console.log('Users:');
  users.forEach(u => {
    console.log(`User: ${u.username}, Society: ${u.society}`);
  });
  
  mongoose.disconnect();
}

test();
