import { Outlet, Link } from 'react-router-dom';

export const SellerLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="border-b bg-slate-900 text-white">
                <div className="container flex h-14 items-center px-4 mx-auto">
                    <span className="font-bold mr-4">Seller Portal</span>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link to="/seller" className="hover:text-slate-300">Dashboard</Link>
                        <Link to="/seller/products" className="hover:text-slate-300">My Products</Link>
                        <Link to="/seller/orders" className="hover:text-slate-300">Seller Orders</Link>
                        <Link to="/" className="ml-auto hover:text-slate-300">Back to Store</Link>
                    </nav>
                </div>
            </div>
            <main className="flex-1 container py-6 mx-auto px-4">
                <Outlet />
            </main>
        </div>
    );
};
