import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { OidcCallback } from './pages/OidcCallback';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { OrderForm } from './pages/OrderForm';
import { OidcSettings } from './pages/OidcSettings';
import { SmtpSettings } from './pages/SmtpSettings';
import { LearningLab } from './pages/LearningLab';
import { Users } from './pages/Users';
import { ExternalUsers } from './pages/ExternalUsers';
import { RequireRole } from './components/RequireRole';
import './styles.css';

const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'login', element: <Login /> },
    { path: 'admin-login', element: <Login /> },
    { path: 'oidc/callback', element: <OidcCallback /> },
    { path: 'dashboard', element: <RequireRole role="VIEWER"><Dashboard /></RequireRole> },
    { path: 'orders', element: <RequireRole role="VIEWER"><Orders /></RequireRole> },
    { path: 'orders/new', element: <RequireRole role="USER"><OrderForm /></RequireRole> },
    { path: 'orders/:id', element: <RequireRole role="VIEWER"><OrderDetail /></RequireRole> },
    { path: 'orders/:id/edit', element: <RequireRole role="USER"><OrderForm /></RequireRole> },
    { path: 'settings/oidc', element: <RequireRole role="ADMIN"><OidcSettings /></RequireRole> },
    { path: 'settings/smtp', element: <RequireRole role="ADMIN"><SmtpSettings /></RequireRole> },
    { path: 'users', element: <RequireRole role="ADMIN"><Users /></RequireRole> },
    { path: 'external-users', element: <RequireRole role="ADMIN"><ExternalUsers /></RequireRole> },
    { path: 'learning', element: <RequireRole role="VIEWER"><LearningLab /></RequireRole> }
  ] }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthProvider><RouterProvider router={router} /></AuthProvider></React.StrictMode>);
