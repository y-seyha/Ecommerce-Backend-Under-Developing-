import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  if (!token) throw new Error("Email verification token is missing");

  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, ""); // remove trailing slash if any
  const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  console.log("Token inside email function:", token);

  const mailOptions = {
    from: `"MyApp" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email",
    html: `
      <h2>Welcome to MyApp!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Construct reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // Email content
  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password. This link is valid for 30 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
