import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/client';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default function Dashboard() {
    const { user } = useAuthStore();

    // Fetch seller's products and orders
    const { data: products } = useQuery({
        queryKey: ['my-products', user?.$id],
        queryFn: () => apiClient.getMyProducts(user!.$id),
        enabled: !!user,
    });

    const { data: orders } = useQuery({
        queryKey: ['seller-orders', user?.$id],
        queryFn: () => apiClient.getSellerOrders(user!.$id),
        enabled: !!user,
    });

    const totalSales = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remote Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
