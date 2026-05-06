import { createRemoteJWKSet, jwtVerify, decodeJwt } from 'jose';
import type { FastifyInstance } from 'fastify';
import type { AuthUser } from './types.js';
import type { Role } from './roles.js';
import { toRole } from './roles.js';

let cachedJwksUrl = '';
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function extractRole(claims: Record<string, unknown>): Role {
  const realmRoles = (claims.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
  const groups = Array.isArray(claims.groups) ? claims.groups.map(String) : [];
  const customRoles = Array.isArray(claims.role) ? claims.role.map(String) : [];
  const roles = [...realmRoles, ...groups, ...customRoles].map((role) => role.toUpperCase());
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('USER')) return 'USER';
  return 'VIEWER';
}

function hasExpectedAudienceOrAuthorizedParty(claims: Record<string, unknown>, clientId: string) {
  const audience = claims.aud;
  const audiences = Array.isArray(audience) ? audience.map(String) : audience ? [String(audience)] : [];
  const authorizedParty = typeof claims.azp === 'string' ? claims.azp : undefined;
  return audiences.includes(clientId) || authorizedParty === clientId;
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
  const { payload } = await jwtVerify(token, jwks, { issuer: settings.issuerUrl });
  const claims = payload as Record<string, unknown>;
  if (!hasExpectedAudienceOrAuthorizedParty(claims, settings.clientId)) {
    throw new Error(`Token was not issued for this client. Expected aud or azp to include ${settings.clientId}.`);
  }
  const tokenRole = extractRole(claims);
  const username = String(payload.preferred_username ?? payload.name ?? '');
  const email = typeof payload.email === 'string' ? payload.email : undefined;

  const externalUser = await app.prisma.externalUser.upsert({
    where: { issuer_subject: { issuer: settings.issuerUrl, subject: payload.sub ?? 'unknown' } },
    update: {
      username,
      email,
      displayName: typeof payload.name === 'string' ? payload.name : username,
      lastLoginAt: new Date()
    },
    create: {
      issuer: settings.issuerUrl,
      subject: payload.sub ?? 'unknown',
      username,
      email,
      displayName: typeof payload.name === 'string' ? payload.name : username,
      role: tokenRole,
      lastLoginAt: new Date()
    }
  });
  const appRole = toRole(externalUser.role);

  return {
    sub: payload.sub ?? 'unknown',
    username,
    email,
    role: appRole,
    method: 'keycloak',
    exp: payload.exp,
    rawClaims: claims
  };
}

export function decodeTokenUnsafe(token: string) {
  return decodeJwt(token);
}
