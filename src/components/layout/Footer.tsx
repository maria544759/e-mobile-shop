
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Technest</h2>
                    <p className="text-sm text-slate-400">
                        Your one-stop shop for the latest tech gadgets and accessories.
                        Quality products, best prices.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link to="/seller" className="hover:text-white transition-colors">Sell with Us</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Support</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                        <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                        <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                    </ul>
                </div>

                {/* Contact/Social */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
                    <div className="flex space-x-4 mb-4">
                        <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>support@technest.com</span>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Technest. All rights reserved.
            </div>
        </footer>
    );
};
