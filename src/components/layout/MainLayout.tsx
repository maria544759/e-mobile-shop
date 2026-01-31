import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
    const checkSession = useAuthStore((state) => state.checkSession);
    const isLoading = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading application...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
