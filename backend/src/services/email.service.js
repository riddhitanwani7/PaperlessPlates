import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

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
  const transporter = createTransporter();

  if (!transporter) {
    console.error("[password-reset] Email provider was not called: SMTP is not configured");
    throw new AppError("Password reset email service is not configured", 503);
  }

  console.info("[password-reset] Email provider called", {
    hostConfigured: Boolean(env.smtp.host),
    port: env.smtp.port,
    resetUrlOrigin: new URL(env.clientUrl).origin,
  });

  try {
    const result = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject: "Reset your PaperlessPlates password",
      text: `Hi ${name},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Hi ${name},</p><p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
    console.info("[password-reset] Email provider accepted message", {
      messageId: result.messageId,
      accepted: result.accepted.length,
      rejected: result.rejected.length,
    });
  } catch (error) {
    console.error("[password-reset] Email provider error", {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });
    throw new AppError("Password reset email could not be sent", 502);
  }
}
