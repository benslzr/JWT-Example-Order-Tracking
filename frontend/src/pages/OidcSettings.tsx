import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

const fields = ['issuerUrl', 'authorizationEndpoint', 'tokenEndpoint', 'jwksEndpoint', 'clientId', 'clientSecret', 'redirectUri', 'postLogoutRedirectUri', 'scopes'];

export function OidcSettings() {
  const [settings, setSettings] = useState<any>({});
  const [result, setResult] = useState('');
  useEffect(() => { api<any>('/api/settings/oidc').then(setSettings).catch(e => setResult(JSON.stringify(e))); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await api('/api/settings/oidc', { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    setResult(JSON.stringify(saved, null, 2));
  }
  async function testDiscovery() {
    const discovery = await api('/api/settings/oidc/test-discovery', { method: 'POST', body: JSON.stringify({ issuerUrl: settings.issuerUrl }) });
    setResult(JSON.stringify(discovery, null, 2));
  }
  return <section><h2>Authentication Settings</h2><p>ADMIN only. Keycloak values are stored in SQLite instead of environment variables so learners can change them from the UI.</p><form onSubmit={save} className="form">{fields.map(field => <label key={field}>{field}<input name={field} value={settings[field] ?? ''} onChange={e => setSettings({ ...settings, [field]: e.target.value })} /></label>)}<button>Save OIDC settings</button></form><button onClick={testDiscovery}>Test OIDC discovery</button><pre>{result}</pre></section>;
}
