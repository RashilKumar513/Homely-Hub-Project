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
        link: 'https://homely-hub-project-lake.vercel.app',
      },
    });

    const emailBody = mailGenerator.generate(options.mailGenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    // Default to Gmail SMTP (smtp.gmail.com:465) unless explicitly overridden
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const isSecure = smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER || 'rashilromeo@gmail.com',
        pass: process.env.SMTP_PASS || 'phmaedtrfbphyddx',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Homely Hub Stays" <${process.env.SMTP_USER || 'rashilromeo@gmail.com'}>`,
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