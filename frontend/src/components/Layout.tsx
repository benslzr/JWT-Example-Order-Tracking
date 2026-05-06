import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { canAccess } from './RequireRole';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <aside>
        <h1>Order Tracker</h1>
        <Link to="/">Home</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/orders">Orders</Link>}
        {canAccess(user?.role, 'USER') && <Link to="/orders/new">Create Order</Link>}
        {canAccess(user?.role, 'ADMIN') && <Link to="/settings/oidc">Auth Settings</Link>}
        {canAccess(user?.role, 'ADMIN') && <Link to="/settings/smtp">SMTP Settings</Link>}
        {canAccess(user?.role, 'ADMIN') && <Link to="/users">Local Users</Link>}
        {canAccess(user?.role, 'ADMIN') && <Link to="/external-users">External Users</Link>}
        {user && <Link to="/learning">OIDC/JWT Lab</Link>}
      </aside>
      <main>
        <header>
          <div><ShieldCheck size={18} /> {user ? `${user.username ?? user.email ?? user.sub} (${user.role})` : 'Not logged in'}</div>
          {user ? <button onClick={() => { logout(); navigate('/login'); }}><LogOut size={16} /> Logout</button> : <Link className="button" to="/login">Login</Link>}
        </header>
        <Outlet />
      </main>
    </div>
  );
}
