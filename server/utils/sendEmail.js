const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to, subject, html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't throw — email failure shouldn't break order flow
  }
};

// ── Email Templates ──────────────────────────────────────────────────────────

const orderConfirmationEmail = (order, user) => ({
  to: user.email,
  subject: `Order Confirmed #${order._id}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Thanks for your order, ${user.name}!</h2>
      <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px;">Order Summary</h3>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd;">
            <span>${item.name} × ${item.qty}</span>
            <span>₹${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        <div style="margin-top: 10px; font-weight: bold;">
          <div style="display: flex; justify-content: space-between;">
            <span>Total:</span>
            <span>₹${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
        <h3 style="margin: 0 0 10px;">Shipping To</h3>
        <p style="margin: 0;">
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
          ${order.shippingAddress.state} - ${order.shippingAddress.zip}
        </p>
      </div>

      <p style="margin-top: 20px; color: #666;">We'll send you another email when your order ships.</p>
      <p style="color: #666;">Questions? Reply to this email.</p>
    </div>
  `,
});

const shippingUpdateEmail = (order, user) => ({
  to: user.email,
  subject: `Your Order #${order._id} Has Shipped!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Your order is on its way, ${user.name}!</h2>
      <p>Order <strong>#${order._id}</strong> has been shipped.</p>
      ${order.trackingNumber ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong></p>` : ''}
      <p>Expected delivery in 3-5 business days.</p>
    </div>
  `,
});

const passwordResetEmail = (resetUrl, user) => ({
  to: user.email,
  subject: 'Password Reset Request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Password Reset</h2>
      <p>Hi ${user.name}, you requested a password reset.</p>
      <a href="${resetUrl}" style="background: #333; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666;">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `,
});

module.exports = { sendEmail, orderConfirmationEmail, shippingUpdateEmail, passwordResetEmail };
