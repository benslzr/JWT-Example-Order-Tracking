import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, Role, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.DEFAULT_ADMIN_USERNAME ?? 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.localUser.upsert({
    where: { username },
    update: { passwordHash, role: Role.ADMIN },
    create: { username, email: 'admin@example.test', passwordHash, role: Role.ADMIN }
  });

  await prisma.oidcSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      issuerUrl: 'http://localhost:8080/realms/order-tracker',
      authorizationEndpoint: 'http://localhost:8080/realms/order-tracker/protocol/openid-connect/auth',
      tokenEndpoint: 'http://localhost:8080/realms/order-tracker/protocol/openid-connect/token',
      jwksEndpoint: 'http://localhost:8080/realms/order-tracker/protocol/openid-connect/certs',
      clientId: 'order-tracker',
      redirectUri: 'http://localhost:4000/api/auth/oidc/callback',
      postLogoutRedirectUri: 'http://localhost:5173/login',
      scopes: 'openid profile email'
    }
  });

  await prisma.smtpSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      host: 'localhost',
      port: 1025,
      secure: false,
      fromEmail: 'orders@example.test',
      fromDisplayName: 'Website Order Tracker'
    }
  });

  const count = await prisma.customerOrder.count();
  if (count === 0) {
    await prisma.customerOrder.createMany({
      data: [
        {
          customerName: 'Ada Lovelace',
          customerEmail: 'ada@example.test',
          websitePackage: 'Starter Website',
          status: OrderStatus.NEW,
          description: 'Five-page brochure site with contact form.',
          assignedUserId: admin.id
        },
        {
          customerName: 'Grace Hopper',
          customerEmail: 'grace@example.test',
          websitePackage: 'E-commerce Launch',
          status: OrderStatus.IN_PROGRESS,
          description: 'Small storefront with product catalog and checkout.',
          assignedUserId: admin.id
        }
      ]
    });
  }

  console.log(`Seeded default admin: ${username} / ${password}`);
  console.log('Change this password immediately in any real deployment.');
}

main().finally(() => prisma.$disconnect());
