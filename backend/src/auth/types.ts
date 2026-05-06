import type { Role } from '@prisma/client';

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
