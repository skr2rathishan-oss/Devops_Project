const { MailtrapClient } = require("mailtrap");

const client = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });

const sender = {
  email: process.env.MAILTRAP_SENDER_EMAIL,
  name: process.env.MAILTRAP_SENDER_NAME || "No Reply",
};

async function sendResetPasswordEmail(to, resetUrl) {
  await client.send({
    from: sender,
    to: [{ email: to }],
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password. This link expires in ${process.env.RESET_TOKEN_EXPIRES_MINUTES} minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
    category: "Password Reset",
  });
}

module.exports = { sendResetPasswordEmail };
