import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { randomBytes, createHash } from 'node:crypto';
import { signLocalJwt } from '../auth/localJwt.js';
import { authenticate } from '../auth/guards.js';
import { toRole } from '../auth/roles.js';

const pkceStore = new Map<string, { verifier: string; createdAt: number }>();

function base64Url(input: Buffer) {
  return input.toString('base64url');
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/local/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    const user = await app.prisma.localUser.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }
    const role = toRole(user.role);
    const token = signLocalJwt(app, { id: user.id, username: user.username, role });
    return { token, user: { id: user.id, username: user.username, role } };
  });

  app.post('/local/logout', async () => ({ ok: true, note: 'JWT logout is client-side in this demo. Production apps often use secure cookies/sessions.' }));

  app.get('/me', { preHandler: authenticate }, async (request) => ({ user: request.authUser }));

  app.get('/oidc/login', async (_request, reply) => {
    const settings = await app.prisma.oidcSettings.findUnique({ where: { id: 1 } });
    if (!settings) return reply.code(400).send({ error: 'OIDC settings missing' });
    const state = base64Url(randomBytes(24));
    const verifier = base64Url(randomBytes(48));
    const challenge = base64Url(createHash('sha256').update(verifier).digest());
    pkceStore.set(state, { verifier, createdAt: Date.now() });
    const url = new URL(settings.authorizationEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', settings.clientId);
    url.searchParams.set('redirect_uri', settings.redirectUri);
    url.searchParams.set('scope', settings.scopes);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    return reply.redirect(url.toString());
  });

  app.get('/oidc/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };
    const pkce = state ? pkceStore.get(state) : undefined;
    if (!code || !state || !pkce) return reply.code(400).send({ error: 'Invalid OIDC callback' });
    pkceStore.delete(state);
    const settings = await app.prisma.oidcSettings.findUnique({ where: { id: 1 } });
    if (!settings) return reply.code(400).send({ error: 'OIDC settings missing' });

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: settings.redirectUri,
      client_id: settings.clientId,
      code_verifier: pkce.verifier
    });
    if (settings.clientSecret) body.set('client_secret', settings.clientSecret);

    const response = await fetch(settings.tokenEndpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
    const tokenSet = await response.json();
    if (!response.ok) return reply.code(502).send(tokenSet);
    const front = new URL(`${process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173'}/oidc/callback`);
    front.searchParams.set('access_token', tokenSet.access_token);
    if (tokenSet.id_token) front.searchParams.set('id_token', tokenSet.id_token);
    if (tokenSet.expires_in) front.searchParams.set('expires_in', String(tokenSet.expires_in));
    return reply.redirect(front.toString());
  });

  app.post('/oidc/logout', async () => ({ ok: true, note: 'Clear local demo tokens; optionally redirect to Keycloak end-session endpoint.' }));
}
