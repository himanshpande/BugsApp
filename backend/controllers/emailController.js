const nodemailer = require('nodemailer');

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASS in your environment.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'hp4758646@gmail.com',
    port: SMTP_PORT ? Number(SMTP_PORT) : 465,
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  cachedTransporter = transporter;
  return transporter;
};

exports.handleLandingSignup = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const transporter = getTransporter();
    const recipient = process.env.LANDING_SIGNUP_RECIPIENT || 'hp4758646@gmail.com';
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"BugMarker" <${fromAddress}>`,
      to: recipient,
      subject: 'New Landing Page Signup',
      text: `A new user has submitted their email on the landing page:\n\n${email}`,
      html: `<p>A new user has submitted their email on the landing page:</p><p style="font-size:16px;"><strong>${email}</strong></p>`,
    });

    return res.status(200).json({ message: 'Thanks! We will be in touch soon.' });
  } catch (error) {
    console.error('Failed to send landing signup email:', error);
    return res.status(500).json({
      message: 'Unable to process your request right now. Please try again later.',
    });
  }
};



