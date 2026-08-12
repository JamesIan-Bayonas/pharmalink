import { lazy } from 'react'; // No need to import Suspense here anymore
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './features/auth/Login';

// --- DEMO HELPER: ROBUST DELAY ---
// We use Promise.all to ensure we wait for the timer AND the import.
// This is more robust than the previous chaining method.
const delayForDemo = (importPromise: Promise<any>) => {
  return Promise.all([
    importPromise,
    new Promise(resolve => setTimeout(resolve, 1500)) // 1.5s Wait
  ]).then(([module]) => module);
};

// --- LAZY IMPORTS ---
const DashboardPage = lazy(() => delayForDemo(import('./features/dashboard/DashboardPage')));
const InventoryPage = lazy(() => delayForDemo(import('./features/inventory/InventoryPage')));
const POSTerminalPage = lazy(() => delayForDemo(import('./features/pos/POSTerminalPage')));
const SalesHistoryPage = lazy(() => delayForDemo(import('./features/sales/SalesHistoryPage')));
const UserManagementPage = lazy(() => delayForDemo(import('./features/users/UserManagementPage')));
const CategoryManagementPage = lazy(() => delayForDemo(import('./features/categories/CategoryManagementPage')));
const ProfilePage = lazy(() => delayForDemo(import('./features/users/ProfilePage')));

const Unauthorized = () => <div className="p-8 text-center text-red-600 font-bold text-xl">Access Denied</div>;

function App() {
  return (
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
              </Route>

              <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/categories" element={<CategoryManagementPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;