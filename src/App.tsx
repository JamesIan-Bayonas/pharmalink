import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './features/auth/Login';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'));
const POSTerminalPage = lazy(() => import('./features/pos/POSTerminalPage'));
const SalesHistoryPage = lazy(() => import('./features/sales/SalesHistoryPage'));
const UserManagementPage = lazy(() => import('./features/users/UserManagementPage'));
const CategoryManagementPage = lazy(() => import('./features/categories/CategoryManagementPage'));
const ProfilePage = lazy(() => import('./features/users/ProfilePage'));

const Unauthorized = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--canvas)] p-8 text-center text-[var(--text-primary)]">
    <h1 className="text-2xl font-bold">Access denied</h1>
    <p className="max-w-md text-[var(--text-secondary)]">Your account does not have permission to open this page.</p>
    <Link to="/dashboard" className="rounded-lg bg-[var(--action-primary)] px-4 py-2 font-semibold text-[var(--action-on-primary)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]">Return to overview</Link>
  </main>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            {/* The Layout now handles the Skeleton showing up! */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Shared Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Role Specific Routes */}
              <Route element={<RoleRoute allowedRoles={['Admin', 'Pharmacist']} />}>
                <Route path="/sales" element={<POSTerminalPage />} />
                <Route path="/history" element={<SalesHistoryPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/categories" element={<CategoryManagementPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
