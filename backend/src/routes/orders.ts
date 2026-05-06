import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../auth/guards.js';
import { sendOrderUpdate } from '../services/smtp.js';

export async function orderRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: authenticate }, async () => app.prisma.customerOrder.findMany({ include: { assignedUser: true }, orderBy: { updatedAt: 'desc' } }));
  app.post('/', { preHandler: requireRole('USER') }, async (request) => app.prisma.customerOrder.create({ data: request.body as any }));
  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = await app.prisma.customerOrder.findUnique({ where: { id }, include: { notes: { include: { author: true }, orderBy: { createdAt: 'desc' } }, emailLogs: true, assignedUser: true } });
    return order ?? reply.code(404).send({ error: 'Order not found' });
  });
  app.put('/:id', { preHandler: requireRole('USER') }, async (request) => {
    const { id } = request.params as { id: string };
    return app.prisma.customerOrder.update({ where: { id }, data: request.body as any });
  });
  app.post('/:id/notes', { preHandler: requireRole('USER') }, async (request) => {
    const { id } = request.params as { id: string };
    const { body } = request.body as { body: string };
    const authorId = request.authUser?.method === 'local' ? request.authUser.sub : undefined;
    return app.prisma.orderNote.create({ data: { orderId: id, body, authorId } });
  });
  app.post('/:id/email-update', { preHandler: requireRole('USER') }, async (request) => {
    const { id } = request.params as { id: string };
    const { message } = request.body as { message?: string };
    const info = await sendOrderUpdate(app, id, message);
    return { ok: true, response: info.response };
  });
}
