import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testSMTP() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`Connecting to SMTP server ${smtpHost}:${smtpPort} as ${user}...`);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection & Authentication Successful!');

    const info = await transporter.sendMail({
      from: `"Homely Hub Stays" <${user}>`,
      to: user,
      subject: '[Homely Hub] SMTP Test Notification',
      text: 'Your Homely Hub SMTP email configuration is active and working properly!',
      html: '<h3>Homely Hub SMTP Configuration</h3><p>Your Gmail App Password has been successfully configured and verified!</p>',
    });

    console.log('✅ Test Email Sent Successfully! Message ID:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('❌ SMTP Test Failed:', err.message);
    process.exit(1);
  }
}

testSMTP();
