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
import './styles.css';

const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'login', element: <Login /> },
    { path: 'admin-login', element: <Login /> },
    { path: 'oidc/callback', element: <OidcCallback /> },
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'orders', element: <Orders /> },
    { path: 'orders/new', element: <OrderForm /> },
    { path: 'orders/:id', element: <OrderDetail /> },
    { path: 'orders/:id/edit', element: <OrderForm /> },
    { path: 'settings/oidc', element: <OidcSettings /> },
    { path: 'settings/smtp', element: <SmtpSettings /> },
    { path: 'users', element: <Users /> },
    { path: 'learning', element: <LearningLab /> }
  ] }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthProvider><RouterProvider router={router} /></AuthProvider></React.StrictMode>);
