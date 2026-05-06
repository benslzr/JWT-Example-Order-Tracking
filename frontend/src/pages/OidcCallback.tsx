import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function OidcCallback() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access_token');
    const id = params.get('id_token');
    if (access) localStorage.setItem('access_token', access);
    if (id) localStorage.setItem('id_token', id);
    refreshMe().finally(() => navigate('/learning'));
  }, []);
  return <section><h2>Completing OIDC login...</h2></section>;
}
