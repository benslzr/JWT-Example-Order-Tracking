import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

export function ExternalUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>();
  const load = () => api<any[]>(`/api/external-users?search=${encodeURIComponent(search)}`).then(setUsers);
  useEffect(() => { load(); }, [search]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api(`/api/external-users/${editing.id}`, { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    setEditing(undefined);
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this external user record? The user may be recreated on next successful OIDC login.')) return;
    await api(`/api/external-users/${id}`, { method: 'DELETE' });
    load();
  }
  return <section><h2>External Users</h2><p>ADMIN only. These records are created when a Keycloak/OIDC token is successfully validated by the API.</p><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, issuer, subject, or role" />{editing && <form onSubmit={save} className="form panel"><h3>Edit {editing.username ?? editing.subject}</h3><input name="username" defaultValue={editing.username ?? ''} placeholder="Username" /><input name="email" type="email" defaultValue={editing.email ?? ''} placeholder="Email" /><input name="displayName" defaultValue={editing.displayName ?? ''} placeholder="Display name" /><select name="role" defaultValue={editing.role}><option>ADMIN</option><option>USER</option><option>VIEWER</option></select><button>Save external user</button><button type="button" onClick={() => setEditing(undefined)}>Cancel</button></form>}<table><thead><tr><th>User</th><th>Issuer</th><th>Subject</th><th>Role</th><th>Last login</th><th>Actions</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.displayName ?? user.username}<br /><small>{user.email}</small></td><td>{user.issuer}</td><td><small>{user.subject}</small></td><td>{user.role}</td><td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td><td><button onClick={() => setEditing(user)}>Edit</button><button className="danger" onClick={() => remove(user.id)}>Delete</button></td></tr>)}</tbody></table></section>;
}
