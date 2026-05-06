import type { Role } from './roles.js';

export type LoginMethod = 'local' | 'keycloak';

export type AuthUser = {
  sub: string;
  username?: string;
  email?: string;
  role: Role;
  method: LoginMethod;
  exp?: number;
  rawClaims?: Record<string, unknown>;
};

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}
