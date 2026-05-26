import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from '@/components/Shell';
import RequireAuth from '@/components/RequireAuth';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import PipelinePage from '@/pages/PipelinePage';
import CampaignsPage from '@/pages/CampaignsPage';
import AdminUsersPage from '@/pages/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="clientes/:id" element={<CustomerDetailPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="campanas" element={<CampaignsPage />} />
        <Route path="admin/usuarios" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
