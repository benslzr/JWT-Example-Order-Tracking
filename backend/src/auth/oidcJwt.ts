import { createRemoteJWKSet, jwtVerify, decodeJwt } from 'jose';
import type { FastifyInstance } from 'fastify';
import type { Role } from '@prisma/client';
import type { AuthUser } from './types.js';

let cachedJwksUrl = '';
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function extractRole(claims: Record<string, unknown>): Role {
  const realmRoles = (claims.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
  const groups = Array.isArray(claims.groups) ? claims.groups.map(String) : [];
  const roles = [...realmRoles, ...groups].map((role) => role.toUpperCase());
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('USER')) return 'USER';
  return 'VIEWER';
}

export async function verifyKeycloakJwt(app: FastifyInstance, token: string): Promise<AuthUser> {
  const settings = await app.prisma.oidcSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error('OIDC settings are not configured');

  if (!jwks || cachedJwksUrl !== settings.jwksEndpoint) {
    cachedJwksUrl = settings.jwksEndpoint;
    jwks = createRemoteJWKSet(new URL(settings.jwksEndpoint));
  }

  /*
   * A JWT has three Base64URL parts: header, payload, and signature.
   * The header names the algorithm/key id, the payload contains claims such as
   * issuer, subject, audience, roles, and expiration, and the signature proves
   * the token was signed by the identity provider.
   *
   * The API validates JWTs because frontend login state is only a client-side
   * hint. Attackers can forge browser state, but they cannot forge a valid
   * Keycloak signature without the private key. JWKS exposes public keys that
   * let APIs verify signatures without knowing Keycloak's private key.
   */
  const { payload } = await jwtVerify(token, jwks, {
    issuer: settings.issuerUrl,
    audience: settings.clientId
  });

  return {
    sub: payload.sub ?? 'unknown',
    username: String(payload.preferred_username ?? payload.name ?? ''),
    email: typeof payload.email === 'string' ? payload.email : undefined,
    role: extractRole(payload as Record<string, unknown>),
    method: 'keycloak',
    exp: payload.exp,
    rawClaims: payload as Record<string, unknown>
  };
}

export function decodeTokenUnsafe(token: string) {
  return decodeJwt(token);
}
