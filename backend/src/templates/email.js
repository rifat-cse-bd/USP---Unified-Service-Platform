/** Simple HTML email bodies — wire to SMTP in production */

export function bookingConfirmationEmail({ customerName, serviceTitle, scheduledAt, address }) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
    <h2 style="color:#2563eb">WorkSure booking confirmed</h2>
    <p>Hi ${customerName},</p>
    <p>Your booking for <strong>${serviceTitle}</strong> is recorded.</p>
    <ul>
      <li><strong>When:</strong> ${scheduledAt}</li>
      <li><strong>Where:</strong> ${address}</li>
    </ul>
    <p>You will receive updates in the app and by notification.</p>
    <p style="color:#64748b;font-size:12px">This is a template — connect nodemailer/SendGrid for delivery.</p>
  </div>`;
}

export function passwordResetEmail({ resetLink }) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
    <h2>Reset your WorkSure password</h2>
    <p><a href="${resetLink}">Click here to set a new password</a></p>
    <p style="color:#64748b;font-size:12px">If you did not request this, ignore this email.</p>
  </div>`;
}
