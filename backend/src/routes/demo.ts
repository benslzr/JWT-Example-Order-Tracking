import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../auth/guards.js';
import { decodeProtectedHeader, decodeJwt } from 'jose';
import { verifyKeycloakJwt } from '../auth/oidcJwt.js';

export async function demoRoutes(app: FastifyInstance) {
  app.get('/public', async () => ({ ok: true, message: 'Public endpoint: no token required.' }));
  app.get('/protected', { preHandler: authenticate }, async (request) => ({ ok: true, message: 'Authenticated endpoint: token was accepted.', user: request.authUser }));
  app.get('/admin', { preHandler: requireRole('ADMIN') }, async (request) => ({ ok: true, message: 'Admin endpoint: role check passed.', user: request.authUser }));
  app.post('/decode-token', async (request) => {
    const { token } = request.body as { token: string };
    return { header: decodeProtectedHeader(token), payload: decodeJwt(token) };
  });
  app.post('/validate-token', async (request, reply) => {
    const { token } = request.body as { token: string };
    try {
      const local = await app.jwt.verify(token);
      return { valid: true, kind: 'local', claims: local };
    } catch {
      try {
        return { valid: true, kind: 'keycloak', user: await verifyKeycloakJwt(app, token) };
      } catch (error) {
        return reply.code(401).send({ valid: false, error: String(error) });
      }
    }
  });
}
