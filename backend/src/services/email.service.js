import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function createTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

export async function sendPasswordResetEmail({ to, name, resetToken }) {
  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;

  if (env.nodeEnv === "development") {
    console.log(`[password-reset] ${to}: ${resetUrl}`);
  }

  const transporter = createTransporter();
  if (!transporter) {
    if (env.nodeEnv !== "development") {
      console.warn("SMTP not configured — password reset email was not sent.");
    }
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your PaperlessPlates password",
    text: `Hi ${name},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${name},</p><p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}
