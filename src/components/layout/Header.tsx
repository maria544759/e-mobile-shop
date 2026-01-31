import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useCartStore } from '@/lib/store';
import { CartSheet } from '@/components/cart/CartSheet';

export function Header() {
    const { user, logout } = useAuthStore();
    const { items: cartItems } = useCartStore();
    const navigate = useNavigate();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
        setIsMobileMenuOpen(false);
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const NavLinks = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
        <nav className={className}>
            <Link to="/" className="text-sm font-medium hover:text-slate-600" onClick={onClick}>Home</Link>
            <Link to="/shop" className="text-sm font-medium hover:text-slate-600" onClick={onClick}>Shop</Link>
            <Link to="/about" className="text-sm font-medium hover:text-slate-600" onClick={onClick}>About</Link>
        </nav>
    );

    return (
        <>
            <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white p-6 shadow-xl flex flex-col gap-6 animate-in slide-in-from-left duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-slate-900">eShop</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <NavLinks className="flex flex-col gap-4 text-lg" onClick={() => setIsMobileMenuOpen(false)} />
                            <hr />
                            {user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold">
                                            {user.name?.[0]}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.role === 'seller' && (
                                        <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full">Seller Dashboard</Button>
                                        </Link>
                                    )}
                                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start px-0">My Orders</Button>
                                    </Link>
                                    <Button variant="ghost" className="w-full justify-start px-0 text-red-500" onClick={handleLogout}>
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" onClick={() => { navigate('/auth/login'); setIsMobileMenuOpen(false); }}>Sign In</Button>
                                    <Button onClick={() => { navigate('/auth/register'); setIsMobileMenuOpen(false); }}>Register</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="border-b bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>

                        <Link to="/" className="text-xl font-bold text-slate-900">
                            eShop
                        </Link>
                        <NavLinks className="hidden md:flex gap-6 mt-1" />
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {totalItems}
                                </span>
                            )}
                        </Button>

                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">
                                        {user.name}
                                    </span>
                                    {user.role === 'seller' ? (
                                        <Link to="/seller">
                                            <Button variant="outline" size="sm">Seller Dashboard</Button>
                                        </Link>
                                    ) : (
                                        <Link to="/auth/register" state={{ role: 'seller' }}>
                                            <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:opacity-90">
                                                Become a Seller
                                            </Button>
                                        </Link>
                                    )}
                                    <Link to="/orders">
                                        <Button variant="ghost" size="sm">Orders</Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                        <LogOut className="h-5 w-5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => navigate('/auth/login')}>Sign In</Button>
                                    <Button onClick={() => navigate('/auth/register')}>Register</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
