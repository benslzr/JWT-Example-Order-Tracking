import { useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

function decode(token?: string) {
  if (!token) return {};
  const [header, payload] = token.split('.');
  const parse = (part: string) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  try { return { header: parse(header), payload: parse(payload) }; } catch { return {}; }
}

export function LearningLab() {
  const { user, token, idToken } = useAuth();
  const [result, setResult] = useState('');
  const decoded = useMemo(() => decode(token), [token]) as any;
  async function call(path: string) {
    try { setResult(JSON.stringify(await api(path), null, 2)); } catch (error) { setResult(JSON.stringify(error, null, 2)); }
  }
  return <section><h2>OIDC and JWT Learning Lab</h2><div className="grid2"><div><h3>Current token</h3><p><strong>Login method:</strong> {user?.method ?? 'none'}</p><p><strong>Subject:</strong> {decoded.payload?.sub}</p><p><strong>Issuer:</strong> {decoded.payload?.iss}</p><p><strong>Audience:</strong> {JSON.stringify(decoded.payload?.aud)}</p><p><strong>Role/groups:</strong> {JSON.stringify(decoded.payload?.role ?? decoded.payload?.realm_access?.roles ?? decoded.payload?.groups)}</p><p><strong>Expiration:</strong> {decoded.payload?.exp ? new Date(decoded.payload.exp * 1000).toLocaleString() : 'n/a'}</p><textarea readOnly value={token ?? ''} /></div><div><h3>How Fastify validates it</h3><p>Local JWTs are verified with LOCAL_JWT_SECRET. Keycloak access tokens are verified with the issuer URL, expected audience/client ID, expiration, and Keycloak JWKS public keys. The API performs this validation on every protected route because browser state can be changed by a user.</p><button onClick={() => call('/api/demo/public')}>Call public endpoint</button><button onClick={() => call('/api/demo/protected')}>Call protected endpoint</button><button onClick={() => call('/api/demo/admin')}>Call admin endpoint</button></div></div><h3>Decoded JWT header</h3><pre>{JSON.stringify(decoded.header, null, 2)}</pre><h3>Decoded JWT payload</h3><pre>{JSON.stringify(decoded.payload, null, 2)}</pre><h3>ID token from Keycloak</h3><textarea readOnly value={idToken ?? ''} /><h3>API response</h3><pre>{result}</pre></section>;
}
