require('dotenv').config();
const { sendVerificationWhatsApp } = require('./utils/smsService');

async function testWhatsAppService() {
  console.log('Testing WhatsApp service...');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'NOT SET');
  console.log('WHATSAPP_ENABLED:', process.env.WHATSAPP_ENABLED);

  try {
    // Test with your phone number - replace with your actual number
    const testPhoneNumber = '+234xxxxxxxxxx'; // Replace with your phone number
    console.log(`Attempting to send test WhatsApp message to: ${testPhoneNumber}`);

    const result = await sendVerificationWhatsApp(testPhoneNumber, 'TEST123');
    console.log('✅ WhatsApp message sent successfully:', result);
  } catch (error) {
    console.error('❌ WhatsApp message sending failed:', error.message);
    console.error('Full error:', error);

    if (error.message.includes('not configured')) {
      console.log('\n📝 To fix this:');
      console.log('1. Sign up for Twilio: https://www.twilio.com/');
      console.log('2. Get your Account SID and Auth Token from the dashboard');
      console.log('3. Get a WhatsApp-enabled phone number');
      console.log('4. Update the .env file with your credentials');
    }
  }
}

testWhatsAppService();