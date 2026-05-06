import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>();
  const [error, setError] = useState('');
  const load = () => api<any[]>(`/api/users?search=${encodeURIComponent(search)}`).then(setUsers).catch(e => setError(JSON.stringify(e)));
  useEffect(() => { load(); }, [search]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api('/api/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    load();
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: any = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.password) delete data.password;
    await api(`/api/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    setEditing(undefined);
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this local user?')) return;
    await api(`/api/users/${id}`, { method: 'DELETE' });
    load();
  }
  return <section><h2>Local Users</h2><p>ADMIN only. Local users authenticate with username/password and receive app-issued JWTs.</p><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username, email, or role" /><form onSubmit={create} className="form"><input name="username" placeholder="Username" required /><input name="email" type="email" placeholder="Email" /><input name="password" type="password" placeholder="Temporary password" required /><select name="role" defaultValue="VIEWER"><option>ADMIN</option><option>USER</option><option>VIEWER</option></select><button>Create local user</button></form>{editing && <form onSubmit={save} className="form panel"><h3>Edit {editing.username}</h3><input name="username" defaultValue={editing.username} /><input name="email" type="email" defaultValue={editing.email ?? ''} /><input name="password" type="password" placeholder="Leave blank to keep password" /><select name="role" defaultValue={editing.role}><option>ADMIN</option><option>USER</option><option>VIEWER</option></select><button>Save user</button><button type="button" onClick={() => setEditing(undefined)}>Cancel</button></form>}{error && <pre>{error}</pre>}<table><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.username}</td><td>{user.email}</td><td>{user.role}</td><td><button onClick={() => setEditing(user)}>Edit</button><button className="danger" onClick={() => remove(user.id)}>Delete</button></td></tr>)}</tbody></table></section>;
}
