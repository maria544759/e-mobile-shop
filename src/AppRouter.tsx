import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import About from './pages/public/About';
import Seeder from './pages/admin/Seeder';
import Login from './pages/auth/Login'; // Assuming Login component path
import Register from './pages/auth/Register';
import Checkout from './pages/customer/Checkout';
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import Orders from './pages/customer/Orders';
import AddProduct from './pages/seller/AddProduct';
import SellerProfile from './pages/seller/SellerProfile';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export const AppRouter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/seed" element={<Seeder />} />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Seller Routes */}
            <Route
                path="/seller"
                element={
                    <ProtectedRoute allowedRoles={['seller']}>
                        <SellerLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<SellerDashboard />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<AddProduct />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="products/edit/:id" element={<AddProduct />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="orders" element={<SellerOrders />} />
            </Route>

            <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['customer', 'seller']}>
                    <Orders />
                </ProtectedRoute>
            } />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
        </Routes>
    );
};
