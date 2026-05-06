import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import formbody from '@fastify/formbody';
import { prismaPlugin } from './plugins/prisma.js';
import { authRoutes } from './routes/auth.js';
import { settingsRoutes } from './routes/settings.js';
import { orderRoutes } from './routes/orders.js';
import { demoRoutes } from './routes/demo.js';
import { userRoutes } from './routes/users.js';
import { externalUserRoutes } from './routes/externalUsers.js';
import './auth/types.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173', credentials: true });
await app.register(formbody);
await app.register(sensible);
await app.register(jwt, { secret: process.env.LOCAL_JWT_SECRET ?? 'dev-only-change-me' });
await app.register(prismaPlugin);

app.get('/health', async () => ({ ok: true }));
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(settingsRoutes, { prefix: '/api/settings' });
await app.register(orderRoutes, { prefix: '/api/orders' });
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(externalUserRoutes, { prefix: '/api/external-users' });
await app.register(demoRoutes, { prefix: '/api/demo' });

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });
