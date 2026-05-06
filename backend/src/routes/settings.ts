import type { FastifyInstance } from 'fastify';
import { requireRole } from '../auth/guards.js';
import { createTransport } from '../services/smtp.js';

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/oidc', { preHandler: requireRole('ADMIN') }, async () => app.prisma.oidcSettings.findUnique({ where: { id: 1 } }));
  app.put('/oidc', { preHandler: requireRole('ADMIN') }, async (request) => {
    return app.prisma.oidcSettings.upsert({ where: { id: 1 }, update: request.body as any, create: { id: 1, ...(request.body as any) } });
  });
  app.post('/oidc/test-discovery', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
    const { issuerUrl } = request.body as { issuerUrl: string };
    const response = await fetch(`${issuerUrl.replace(/\/$/, '')}/.well-known/openid-configuration`);
    const json = await response.json();
    if (!response.ok) return reply.code(502).send(json);
    return json;
  });

  app.get('/smtp', { preHandler: requireRole('ADMIN') }, async () => {
    const settings = await app.prisma.smtpSettings.findUnique({ where: { id: 1 } });
    return settings ? { ...settings, password: settings.password ? '********' : '' } : null;
  });
  app.put('/smtp', { preHandler: requireRole('ADMIN') }, async (request) => {
    const body = request.body as any;
    if (body.password === '********') delete body.password;
    return app.prisma.smtpSettings.upsert({ where: { id: 1 }, update: body, create: { id: 1, ...body } });
  });
  app.post('/smtp/test', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { toEmail } = request.body as { toEmail?: string };
    const { settings, transporter } = await createTransport(app);
    await transporter.verify();
    if (toEmail) {
      await transporter.sendMail({
        from: `"${settings.fromDisplayName}" <${settings.fromEmail}>`,
        to: toEmail,
        subject: 'SMTP test from Website Order Tracker',
        text: 'If you received this, SMTP is configured.'
      });
    }
    return { ok: true };
  });
}
