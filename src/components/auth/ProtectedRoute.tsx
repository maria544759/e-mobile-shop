import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import type { Role } from '@/lib/types';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isLoading, checkSession } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
