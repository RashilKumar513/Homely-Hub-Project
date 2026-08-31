import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

/**
 * Send Real Email using Gmail Service
 * @param {object} options - { email, subject, mailGenContent }
 */
export const sendMail = async (options) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Homely Hub Stays',
        link: 'https://homely-hub-project-lake.vercel.app',
      },
    });

    const emailBody = mailGenerator.generate(options.mailGenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const smtpUser = (process.env.SMTP_USER || 'rashilromeo@gmail.com').trim();
    let rawPass = process.env.SMTP_PASS || 'iikmuxivdhfqmqej';
    if (rawPass.includes('phmaedtrfbphyddx') || !rawPass) {
      rawPass = 'iikmuxivdhfqmqej';
    }
    const smtpPass = rawPass.replace(/\s+/g, '').trim();

    // Standard Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Homely Hub Stays" <${smtpUser}>`,
      to: options.email,
      subject: options.subject,
      text: emailText,
      html: emailBody,
    };

    console.log(`📡 Sending OTP via Gmail to ${options.email} [User: ${smtpUser}]...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Gmail Email Dispatched Successfully to ${options.email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Gmail Protocol Transmission Error:', error.message);
    throw error;
  }
};

export const forgotPasswordMailGenContent = (name, resetLink) => {
  return {
    body: {
      name: name,
      intro: 'Welcome to Homely Hub! We are sending you the link to reset your password.',
      action: {
        instructions: 'To reset your password, please click the button below:',
        button: {
          color: '#ff385c',
          text: 'Reset your password',
          link: resetLink,
        },
      },
      outro: 'If you did not request a password reset, no further action is required.',
    },
  };
};