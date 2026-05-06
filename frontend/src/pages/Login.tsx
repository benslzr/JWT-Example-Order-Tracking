import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const { loginLocal, loginKeycloak } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await loginLocal(String(form.get('username')), String(form.get('password')));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.error ?? 'Login failed');
    }
  }
  return <section><h2>Login</h2><div className="grid2"><form onSubmit={submit} className="panel"><h3>Local admin login</h3><input name="username" placeholder="admin" /><input name="password" type="password" placeholder="ChangeMe123!" /><button><KeyRound size={16} /> Sign in locally</button>{error && <p className="error">{error}</p>}</form><div className="panel"><h3>Keycloak OIDC login</h3><p>Uses Authorization Code Flow with PKCE. Tokens are returned through the backend callback for demonstration.</p><button onClick={loginKeycloak}>Login with Keycloak</button></div></div></section>;
}
