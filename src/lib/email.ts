import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Ensure you have SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: `"Shop Admin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export const sendOrderConfirmation = async (email: string, orderNumber: string, totalAmount: number) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Order Confirmation</h2>
      <p>Thank you for your purchase!</p>
      <p>Your order <strong>#${orderNumber}</strong> has been received and is being processed.</p>
      <p>Total Amount: <strong>$${totalAmount.toFixed(2)}</strong></p>
      <p>We will notify you when your order ships.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Order Confirmation #${orderNumber}`, html });
};

export const sendShippingNotification = async (email: string, orderNumber: string, trackingNumber: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Your Order has Shipped!</h2>
      <p>Order <strong>#${orderNumber}</strong> is on its way.</p>
      <p>Tracking Number: <strong>${trackingNumber}</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Order Shipped #${orderNumber}`, html });
};
