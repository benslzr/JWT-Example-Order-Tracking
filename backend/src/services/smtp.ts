import nodemailer from 'nodemailer';
import type { FastifyInstance } from 'fastify';

export async function createTransport(app: FastifyInstance) {
  const settings = await app.prisma.smtpSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error('SMTP settings are not configured');

  return {
    settings,
    transporter: nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: settings.username ? { user: settings.username, pass: settings.password ?? '' } : undefined
    })
  };
}

export async function sendOrderUpdate(app: FastifyInstance, orderId: string, message?: string) {
  const order = await app.prisma.customerOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');
  const { settings, transporter } = await createTransport(app);
  const subject = `Order update: ${order.websitePackage}`;
  const text = message ?? `Your order status is now ${order.status}.`;

  try {
    const info = await transporter.sendMail({
      from: `"${settings.fromDisplayName}" <${settings.fromEmail}>`,
      to: order.customerEmail,
      subject,
      text
    });
    await app.prisma.emailLog.create({ data: { orderId, toEmail: order.customerEmail, subject, success: true, response: info.response } });
    return info;
  } catch (error) {
    await app.prisma.emailLog.create({ data: { orderId, toEmail: order.customerEmail, subject, success: false, error: String(error) } });
    throw error;
  }
}
