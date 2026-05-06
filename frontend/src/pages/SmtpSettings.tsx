import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

export function SmtpSettings() {
  const [settings, setSettings] = useState<any>({});
  const [result, setResult] = useState('');
  useEffect(() => { api<any>('/api/settings/smtp').then(setSettings); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: any = Object.fromEntries(new FormData(event.currentTarget));
    data.port = Number(data.port);
    data.secure = data.secure === 'on';
    setResult(JSON.stringify(await api('/api/settings/smtp', { method: 'PUT', body: JSON.stringify(data) }), null, 2));
  }
  async function test(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const toEmail = String(new FormData(event.currentTarget).get('toEmail'));
    setResult(JSON.stringify(await api('/api/settings/smtp/test', { method: 'POST', body: JSON.stringify({ toEmail }) }), null, 2));
  }
  return <section><h2>SMTP Settings</h2><form onSubmit={save} className="form"><input name="host" placeholder="SMTP host" defaultValue={settings.host} /><input name="port" type="number" placeholder="SMTP port" defaultValue={settings.port} /><label className="check"><input name="secure" type="checkbox" defaultChecked={settings.secure} /> Secure TLS</label><input name="username" placeholder="Username" defaultValue={settings.username} /><input name="password" type="password" placeholder="Password" defaultValue={settings.password} /><input name="fromEmail" placeholder="From email" defaultValue={settings.fromEmail} /><input name="fromDisplayName" placeholder="From display name" defaultValue={settings.fromDisplayName} /><button>Save SMTP settings</button></form><form onSubmit={test} className="inline"><input name="toEmail" type="email" placeholder="test@example.com" /><button>Test SMTP</button></form><pre>{result}</pre></section>;
}
