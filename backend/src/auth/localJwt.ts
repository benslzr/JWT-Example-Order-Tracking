import type { FastifyInstance } from 'fastify';
import type { Role } from './roles.js';

const expiresIn = '2h';

export function signLocalJwt(app: FastifyInstance, user: { id: string; username: string; role: Role }) {
  /*
   * Local application JWTs are issued by this Fastify app after username/password login.
   * They are separate from Keycloak tokens. The API verifies them with LOCAL_JWT_SECRET,
   * while Keycloak tokens are verified with Keycloak's JWKS public keys.
   */
  return app.jwt.sign(
    { username: user.username, role: user.role, method: 'local' },
    { sub: user.id, expiresIn }
  );
}
