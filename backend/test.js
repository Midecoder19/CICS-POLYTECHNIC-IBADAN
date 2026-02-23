console.log('Node.js is working!');
console.log('Testing basic functionality...');

// Test if express can be loaded
try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
} catch (error) {
  console.log('❌ Express failed to load:', error.message);
}

// Test if mongoose can be loaded
try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded successfully');
} catch (error) {
  console.log('❌ Mongoose failed to load:', error.message);
}

// Test if twilio can be loaded (optional)
try {
  const twilio = require('twilio');
  console.log('✅ Twilio loaded successfully');
} catch (error) {
  console.log('⚠️  Twilio not available (expected):', error.message);
}

console.log('Basic test completed!');