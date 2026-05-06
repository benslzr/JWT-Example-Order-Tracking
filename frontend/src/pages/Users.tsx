import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const load = () => api<any[]>('/api/users').then(setUsers).catch(e => setError(JSON.stringify(e)));
  useEffect(() => { load(); }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api('/api/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    load();
  }
  return <section><h2>Local Users</h2><p>ADMIN only. Local users authenticate with username/password and receive app-issued JWTs.</p><form onSubmit={create} className="form"><input name="username" placeholder="Username" required /><input name="email" type="email" placeholder="Email" /><input name="password" type="password" placeholder="Temporary password" required /><select name="role" defaultValue="VIEWER"><option>ADMIN</option><option>USER</option><option>VIEWER</option></select><button>Create local user</button></form>{error && <pre>{error}</pre>}<table><thead><tr><th>Username</th><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.username}</td><td>{user.email}</td><td>{user.role}</td></tr>)}</tbody></table></section>;
}
