import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Guard: Must be logged in
export const ProtectedRoute = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
};

// Guard: Must have specific role
// We use an Interface for the Props
interface RoleRouteProps {
    allowedRoles: string[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { user } = useAuth();
    
    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};