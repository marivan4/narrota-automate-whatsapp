
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Settings from '@/pages/Settings';
import Invoices from '@/pages/Invoices';
import InvoiceEdit from '@/pages/InvoiceEdit';
import InvoicePrint from '@/pages/InvoicePrint';
import Clients from '@/pages/Clients';
import Vehicles from '@/pages/Vehicles';
import Contracts from '@/pages/Contracts';
import UsersManagement from '@/pages/UsersManagement';
import Profile from '@/pages/Profile';
import Documentation from '@/pages/Documentation';
import Help from '@/pages/Help';
import WhatsAppSettings from '@/pages/WhatsAppSettings';
import WhatsAppConnect from '@/pages/WhatsAppConnect';
import ContractSignature from '@/pages/ContractSignature';
import AsaasPaymentsList from '@/pages/AsaasPaymentsList';
import AsaasPayments from '@/pages/AsaasPayments';
import Reports from '@/pages/Reports';
import Alerts from '@/pages/Alerts';
import Appointments from '@/pages/Appointments';
import Checklists from '@/pages/Checklists';

// Define the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/invoices',
    element: <Invoices />,
  },
  {
    path: '/invoices/edit/:id',
    element: <InvoiceEdit />,
  },
  {
    path: '/invoices/new',
    element: <InvoiceEdit />,
  },
  {
    path: '/invoices/print/:id',
    element: <InvoicePrint />,
  },
  {
    path: '/asaas-payments',
    element: <AsaasPayments />,
  },
  {
    path: '/asaas-payments-list',
    element: <AsaasPaymentsList />,
  },
  {
    path: '/clients',
    element: <Clients />,
  },
  {
    path: '/vehicles',
    element: <Vehicles />,
  },
  {
    path: '/contracts',
    element: <Contracts />,
  },
  {
    path: '/contract-signature/:id',
    element: <ContractSignature />,
  },
  {
    path: '/whatsapp',
    element: <WhatsAppSettings />,
  },
  {
    path: '/whatsapp-settings',
    element: <WhatsAppSettings />,
  },
  {
    path: '/whatsapp/connect',
    element: <WhatsAppConnect />,
  },
  {
    path: '/reports',
    element: <Reports />,
  },
  {
    path: '/alerts',
    element: <Alerts />,
  },
  {
    path: '/appointments',
    element: <Appointments />,
  },
  {
    path: '/checklists',
    element: <Checklists />,
  },
  {
    path: '/users',
    element: <UsersManagement />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/docs',
    element: <Documentation />,
  },
  {
    path: '/help',
    element: <Help />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// The main router component
export default function Router() {
  return <RouterProvider router={router} />;
}
