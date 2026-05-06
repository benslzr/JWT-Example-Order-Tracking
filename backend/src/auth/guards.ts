import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyKeycloakJwt } from './oidcJwt.js';
import type { Role } from './roles.js';
import { toRole } from './roles.js';

const rank: Record<Role, number> = { VIEWER: 1, USER: 2, ADMIN: 3 };

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) return reply.code(401).send({ error: 'Missing Bearer token' });

  try {
    /*
     * Local tokens are validated with the app secret. Keycloak access tokens are
     * validated with OIDC issuer metadata and JWKS. Keeping those paths separate
     * is the point of this learning app.
     */
    const decoded = await request.server.jwt.verify<{ sub: string; username: string; role: string; method: string; exp?: number }>(token);
    request.authUser = {
      sub: decoded.sub,
      username: decoded.username,
      role: toRole(decoded.role),
      method: 'local',
      exp: decoded.exp
    };
  } catch {
    try {
      request.authUser = await verifyKeycloakJwt(request.server, token);
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid or expired token', detail: String(error) });
    }
  }
}

export function requireRole(role: Role) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    if (!request.authUser || rank[request.authUser.role] < rank[role]) {
      return reply.code(403).send({ error: `Requires ${role} role` });
    }
  };
}
