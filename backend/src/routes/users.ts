import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { requireRole } from '../auth/guards.js';
import { toRole } from '../auth/roles.js';

export async function userRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { search } = request.query as { search?: string };
    return app.prisma.localUser.findMany({
      where: search ? {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { role: { contains: search } }
        ]
      } : undefined,
      select: { id: true, username: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { username: 'asc' }
    });
  });

  app.post('/', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { username, email, password, role } = request.body as { username: string; email?: string; password: string; role: 'ADMIN' | 'USER' | 'VIEWER' };
    const passwordHash = await bcrypt.hash(password, 12);
    return app.prisma.localUser.create({
      data: { username, email, passwordHash, role: toRole(role) },
      select: { id: true, username: true, email: true, role: true }
    });
  });

  app.put('/:id', { preHandler: requireRole('ADMIN') }, async (request) => {
    const { id } = request.params as { id: string };
    const { username, email, password, role } = request.body as { username?: string; email?: string; password?: string; role?: 'ADMIN' | 'USER' | 'VIEWER' };
    return app.prisma.localUser.update({
      where: { id },
      data: { username, email, ...(role ? { role: toRole(role) } : {}), ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
      select: { id: true, username: true, email: true, role: true }
    });
  });

  app.delete('/:id', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
    const { id } = request.params as { id: string };
    if (request.authUser?.method === 'local' && request.authUser.sub === id) {
      return reply.code(400).send({ error: 'You cannot delete your own active local admin account.' });
    }
    await app.prisma.localUser.delete({ where: { id } });
    return { ok: true };
  });
}
