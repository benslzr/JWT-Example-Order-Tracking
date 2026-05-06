import type { FastifyInstance } from 'fastify';
import { requireRole } from '../auth/guards.js';
import { toRole } from '../auth/roles.js';

export async function externalUserRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { search } = request.query as { search?: string };
    return app.prisma.externalUser.findMany({
      where: search ? {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { displayName: { contains: search } },
          { issuer: { contains: search } },
          { subject: { contains: search } },
          { role: { contains: search } }
        ]
      } : undefined,
      orderBy: { updatedAt: 'desc' }
    });
  });

  app.put('/:id', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { id } = request.params as { id: string };
    const { username, email, displayName, role } = request.body as { username?: string; email?: string; displayName?: string; role?: 'ADMIN' | 'USER' | 'VIEWER' };
    return app.prisma.externalUser.update({
      where: { id },
      data: { username, email, displayName, ...(role ? { role: toRole(role) } : {}) }
    });
  });

  app.delete('/:id', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { id } = request.params as { id: string };
    await app.prisma.externalUser.delete({ where: { id } });
    return { ok: true };
  });
}
