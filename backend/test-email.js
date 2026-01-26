require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

async function testEmailService() {
  console.log('Testing email service...');
  console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? 'SET' : 'NOT SET');
  console.log('BREVO_SMTP_PASSWORD:', process.env.BREVO_SMTP_PASSWORD ? 'SET' : 'NOT SET');
  console.log('BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || 'NOT SET');

  try {
    console.log('Attempting to send test email...');
    const result = await sendVerificationEmail('test@example.com', 'test-token-123');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmailService();
