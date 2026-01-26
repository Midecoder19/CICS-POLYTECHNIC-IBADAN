const nodemailer = require('nodemailer');

// Create transporter for Brevo (Sendinblue)
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    throw new Error('Email service not configured. Please set BREVO_SMTP_USER and BREVO_SMTP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,  
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Polyibadan Cooperative',
        address: process.env.BREVO_FROM_EMAIL || 'ayomidebabarinde07@gmail.com'
      },
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    return info;
  } catch (error) {
    if (error.message.includes('Email service not configured')) {
      const configError = new Error('Email service not configured. Please set BREVO_SMTP_USER and BREVO_SMTP_PASSWORD in your environment variables.');
      console.error('Email Service Error:', configError.message);
      throw configError;
    }
    console.error('Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send verification email
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: 'Verify Your Email - Polyibadan Cooperative',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Polyibadan!</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Cooperative Management Partner</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e40af; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
            Thank you for registering with Polyibadan Cooperative. To complete your registration,
            please verify your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
              Verify Email Address
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <span style="word-break: break-all; color: #1e40af;">${verificationUrl}</span>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This verification link will expire in 24 hours.
            <br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Polyibadan Cooperative. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

// Send password reset email
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

  return sendEmail({
    to,
    subject: 'Password Reset - Polyibadan Cooperative',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Reset your Polyibadan account password</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #dc2626; margin-top: 0;">Forgot Your Password?</h2>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password for your Polyibadan Cooperative account.
            Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
              Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <span style="word-break: break-all; color: #dc2626;">${resetUrl}</span>
          </p>

          <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #dc2626;">
            <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 500;">
              🔒 Security Notice: This link will expire in 1 hour for your security.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            If you didn't request a password reset, please ignore this email.
            <br>
            Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Polyibadan Cooperative. All rights reserved.</p>
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};