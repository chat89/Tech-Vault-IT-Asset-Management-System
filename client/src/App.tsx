import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LandingPage }     from './pages/landing/LandingPage';
import { LoginPage }       from './pages/auth/LoginPage';
import { DashboardPage }   from './pages/dashboard/DashboardPage';
import { AssetsPage }      from './pages/assets/AssetsPage';
import { RequestsPage }    from './pages/requests/RequestsPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { UsersPage }       from './pages/users/UsersPage';
import { AuditLogsPage }   from './pages/audit/AuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:            1,
      staleTime:        30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assets"    element={<AssetsPage />} />
                <Route path="/requests"  element={<RequestsPage />} />

                {/* Admin-only routes */}
                <Route element={<ProtectedRoute allowedRoles={['super_admin','it_admin']} />}>
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/audit-logs"  element={<AuditLogsPage />} />
                </Route>

                {/* Super admin only */}
                <Route element={<ProtectedRoute allowedRoles={['super_admin','it_admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color:      '#f1f5f9',
              border:     '1px solid #334155',
              borderRadius: '12px',
              fontSize:   '13px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
