import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

/**
 * Send Real Email using Explicit SMTP Protocol Transporter
 * @param {object} options - { email, subject, mailGenContent }
 */
export const sendMail = async (options) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Homely Hub Stays',
        link: 'http://localhost:5173',
      },
    });

    const emailBody = mailGenerator.generate(options.mailGenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    // Explicit SMTP Protocol Connection Transporter
    const smtpHost = process.env.SMTP_HOST || process.env.MAILTRAP_SMTP_HOST || 'sandbox.smtp.mailtrap.io';
    const smtpPort = Number(process.env.SMTP_PORT || process.env.MAILTRAP_SMTP_PORT || 2525);
    const isSecure = smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER || process.env.MAILTRAP_SMTP_USER || '9626b0267becee',
        pass: process.env.SMTP_PASS || process.env.MAILTRAP_SMTP_PASS || 'ba00f853facf71',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Homely Hub Stays" <${process.env.SMTP_USER || 'hello@homelyhub.in'}>`,
      to: options.email,
      subject: options.subject,
      text: emailText,
      html: emailBody,
    };

    console.log(`📡 Sending OTP via SMTP Protocol to ${options.email} [Server: ${smtpHost}:${smtpPort}]...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP Email Dispatched Successfully to ${options.email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ SMTP Protocol Transmission Error:', error.message);
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