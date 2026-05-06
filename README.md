# Website Customer Order Tracker: OIDC and JWT Learning App

This is a simple full-stack TypeScript learning application for understanding:

- Keycloak OpenID Connect login with Authorization Code Flow and PKCE
- JWT structure: header, payload, signature
- JWT validation with issuer, audience, expiration, and JWKS
- Local username/password admin login with application-issued JWTs
- Fastify protected routes and role-based access
- React Bearer token API calls
- SQLite persistence with Prisma
- SMTP testing and customer order update email with Nodemailer

This project is intentionally educational and not production-ready.

## Stack

- Frontend: React, Vite, React Router, TypeScript
- Backend: Fastify, TypeScript, `@fastify/jwt`, `jose`
- Identity provider: Keycloak
- Database: SQLite with Prisma ORM
- Password hashing: bcrypt
- Email: Nodemailer SMTP

## Project Structure

```text
/backend
  /src
    /routes
    /auth
    /plugins
    /services
  /prisma
/frontend
  /src
    /pages
    /components
    /auth
    /api
```

## How OIDC Works Here

The React app sends users to `GET /api/auth/oidc/login`. Fastify creates a PKCE verifier/challenge and redirects to Keycloak. Keycloak authenticates the user and redirects back to `GET /api/auth/oidc/callback` with an authorization code. Fastify exchanges that code for tokens at the configured token endpoint.

The app keeps Keycloak OIDC settings in SQLite so ADMIN users can edit them through the Authentication Settings page. Required fields include issuer URL, authorization endpoint, token endpoint, JWKS endpoint, client ID, optional client secret, redirect URI, post logout redirect URI, and scopes.

## How JWT Validation Works

A JWT has:

- Header: algorithm and key id
- Payload: claims such as issuer, subject, audience, roles, and expiration
- Signature: cryptographic proof that the token was signed by the issuer

Fastify must validate tokens on the API because frontend state can be edited by users. For Keycloak access tokens, the backend uses `jose` and Keycloak JWKS to verify the signature, issuer, audience/client ID, and expiration. For local username/password login, the backend issues a separate app JWT and verifies it with `LOCAL_JWT_SECRET`.

ID tokens describe the authenticated user for the client. Access tokens are intended for APIs. This app displays both for learning, but protected API routes should rely on validated access tokens.

## Roles

- `ADMIN`: configure OIDC/JWT/SMTP and use admin-only demo routes
- `USER`: create and update orders, add notes, send customer updates
- `VIEWER`: view orders only

Keycloak users map to roles from `realm_access.roles` or `groups`. Local users store their role in SQLite.

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Default local login:

```text
username: admin
password: ChangeMe123!
```

Change this password before using the app outside local learning.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Keycloak Setup

Create a realm, for example:

```text
order-tracker
```

Create a client:

```text
Client ID: order-tracker
Client type: OpenID Connect
Access type: public for PKCE learning, or confidential if using a client secret
Standard flow: enabled
PKCE: S256
```

Configure redirect URIs:

```text
http://localhost:4000/api/auth/oidc/callback
```

Configure web origins:

```text
http://localhost:5173
```

Example issuer URL:

```text
http://localhost:8080/realms/order-tracker
```

Use the Authentication Settings page as ADMIN to save the issuer URL and endpoints. The Test OIDC Discovery button calls:

```text
{issuer}/.well-known/openid-configuration
```

Copy the authorization, token, and JWKS endpoints from the discovery response if needed.

## SMTP Testing

For local testing, a tool such as MailHog or Mailpit works well:

```text
SMTP host: localhost
SMTP port: 1025
Secure: false
```

Use the SMTP Settings page to save settings, test the SMTP connection, send a test email, and send customer order update emails. Email send results are logged in `EmailLog`.

## API Examples

Public:

```text
GET /api/demo/public
```

Authenticated:

```text
GET /api/demo/protected
Authorization: Bearer <token>
```

Admin only:

```text
GET /api/demo/admin
Authorization: Bearer <token>
```

Token helpers:

```text
POST /api/demo/decode-token
POST /api/demo/validate-token
```

## Security Notes

This is a learning application. Production systems should:

- Use HTTPS everywhere
- Prefer secure, HttpOnly, SameSite cookies where appropriate
- Avoid exposing client secrets to the frontend
- Rotate secrets and use a real secret manager
- Store SMTP credentials securely
- Add CSRF protections where cookies are used
- Validate token issuer, audience, expiration, and signature
- Use short token lifetimes and refresh-token rotation
- Add audit logs and careful operational logging
- Avoid logging raw tokens or sensitive claims
- Harden CORS and content security policy
