import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../state';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 * Token presence (from localStorage via userSlice) determines auth state.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
