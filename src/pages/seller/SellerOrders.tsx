
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/client';
import type { Order, CartItem, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Truck, Package } from 'lucide-react';

export default function SellerOrders() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getSellerOrders(user!.$id);
            setOrders(data);
        } catch (error) {
            console.error("Failed to load seller orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await apiClient.updateOrderStatus(orderId, newStatus);
            // Optimistic update or reload
            setOrders(orders.map(o => o.$id === orderId ? { ...o, status: newStatus } : o));
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading orders...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No orders found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            {orders.map((order) => {
                let items: CartItem[] = [];
                try {
                    // Filter items that belong to this seller
                    const allItems = JSON.parse(order.items) as CartItem[];
                    items = allItems.filter(item => item.product?.sellerId === user!.$id || (item as any).sellerId === user!.$id);
                } catch (e) { console.error(e); }

                return (
                    <Card key={order.$id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Order #{order.$id.substring(0, 8)}</CardTitle>
                                    <CardDescription>
                                        Customer ID: {order.customerId} • Placed: {new Date(order.$createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge>{order.status}</Badge>
                                    <Select
                                        defaultValue={order.status}
                                        onValueChange={(value) => handleStatusUpdate(order.$id, value as OrderStatus)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Update Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Detailed Items (Your Products)</h4>
                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                {item.product?.imageUrls?.[0] && (
                                                    <img src={item.product.imageUrls[0]} className="h-8 w-8 rounded object-cover" />
                                                )}
                                                <span>{item.product?.name} (x{item.quantity})</span>
                                            </div>
                                            <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-slate-500">
                                <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
