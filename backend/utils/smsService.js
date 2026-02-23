// Twilio client - lazy loaded only when needed
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (error) {
      console.warn('Twilio not available. SMS functionality will be disabled.');
      twilioClient = null;
    }
  }
  return twilioClient;
};

// Send SMS using Twilio
const sendSMS = async ({ to, message }) => {
  const client = getTwilioClient();

  if (!client) {
    const error = new Error('SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables.');
    console.error('SMS Service Error:', error.message);
    throw error;
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    const error = new Error('TWILIO_PHONE_NUMBER is not configured in environment variables.');
    console.error('SMS Service Error:', error.message);
    throw error;
  }

  try {
    const phoneNumber = to.startsWith('+') ? to : `+234${to.replace(/^0/, '')}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent successfully to:', phoneNumber);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send WhatsApp message using Twilio
const sendWhatsApp = async ({ to, message }) => {
  const client = getTwilioClient();

  if (!client) {
    const error = new Error('WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in your environment variables.');
    console.error('WhatsApp Service Error:', error.message);
    throw error;
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    const error = new Error('TWILIO_WHATSAPP_NUMBER is not configured in environment variables.');
    console.error('WhatsApp Service Error:', error.message);
    throw error;
  }

  try {
    const phoneNumber = to.startsWith('+') ? to : `+234${to.replace(/^0/, '')}`;

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });

    console.log('WhatsApp message sent successfully to:', phoneNumber);
    return result;
  } catch (error) {
    console.error('WhatsApp message sending failed:', error.message);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};

// Send verification SMS
const sendVerificationSMS = async (to, code) => {
  const message = `🔐 Polyibadan Verification Code

Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this message.

📱 Polyibadan Cooperative`;

  return sendSMS({ to, message });
};

// Send WhatsApp verification
const sendVerificationWhatsApp = async (to, code) => {
  const message = `🔐 *Polyibadan Cooperative*

*Verification Code:* ${code}

This code will expire in *10 minutes*.

If you didn't request this code, please ignore this message.

📱 *Secure Login System*`;

  return sendWhatsApp({ to, message });
};

// Send password reset SMS
const sendPasswordResetSMS = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `🔑 Password Reset - Polyibadan

You requested a password reset.

Reset Link: ${resetUrl}

This link expires in 1 hour.

If you didn't request this, ignore this message.

🛡️ Polyibadan Cooperative`;

  return sendSMS({ to, message });
};

// Send password reset WhatsApp
const sendPasswordResetWhatsApp = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `🔑 *Polyibadan Cooperative*

*Password Reset Request*

You requested a password reset for your account.

*Reset Link:* ${resetUrl}

⏰ *Expires in 1 hour*

If you didn't request this, please ignore this message.

🛡️ *Secure System*`;

  return sendWhatsApp({ to, message });
};

// Send welcome SMS after successful registration
const sendWelcomeSMS = async (to, username) => {
  const message = `🎉 Welcome to Polyibadan Cooperative!

Hello ${username},

Your account has been successfully created and verified.

You can now access all cooperative services through our platform.

📱 Happy Banking!

Polyibadan Cooperative Team`;

  return sendSMS({ to, message });
};

// Send welcome WhatsApp message
const sendWelcomeWhatsApp = async (to, username) => {
  const message = `🎉 *Welcome to Polyibadan Cooperative!*

Hello *${username}*,

Your account has been successfully created and verified.

You can now access all cooperative services through our platform.

📱 *Happy Banking!*

*Polyibadan Cooperative Team*`;

  return sendWhatsApp({ to, message });
};

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendVerificationSMS,
  sendVerificationWhatsApp,
  sendPasswordResetSMS,
  sendPasswordResetWhatsApp,
  sendWelcomeSMS,
  sendWelcomeWhatsApp
};