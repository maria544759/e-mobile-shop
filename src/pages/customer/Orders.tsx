import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/client';
import type { Order, CartItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Orders() {
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
            const data = await apiClient.getMyOrders(user!.$id);
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'shipped': return <Truck className="h-4 w-4" />;
            case 'delivered': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'shipped': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    // Helper to render timeline
    const Timeline = ({ status, createdAt }: { status: string, createdAt: string }) => {
        const steps = [
            { id: 'pending', label: 'Order Placed', icon: Clock },
            { id: 'shipped', label: 'Shipped', icon: Truck },
            { id: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        const currentStepIndex = steps.findIndex(s => s.id === status);
        const isCancelled = status === 'cancelled';

        // Mock dates for display
        const orderDate = new Date(createdAt);
        const shipDate = new Date(orderDate);
        shipDate.setDate(orderDate.getDate() + 1); // Mock: ships next day
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(orderDate.getDate() + 5); // Mock: delivers in 5 days

        if (isCancelled) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 flex items-center gap-3 text-red-700">
                    <XCircle className="h-6 w-6" />
                    <div>
                        <p className="font-semibold">Order Cancelled</p>
                        <p className="text-sm text-red-600">This order has been cancelled. Please contact support if you have questions.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full mt-6 px-2">
                <div className="relative flex justify-between">
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-0 rounded-full" />

                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-5 left-0 h-1 bg-primary -z-0 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const Icon = step.icon;
                        let dateDisplay = null;

                        if (index === 0) dateDisplay = orderDate.toLocaleDateString();
                        if (index === 1 && currentStepIndex >= 1) dateDisplay = shipDate.toLocaleDateString();
                        if (index === 2 && currentStepIndex >= 2) dateDisplay = deliveryDate.toLocaleDateString();
                        if (index === 2 && currentStepIndex < 2) dateDisplay = `Est. ${deliveryDate.toLocaleDateString()}`;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                                    ${isCompleted ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' : 'bg-white border-slate-200 text-slate-300'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="text-center mt-2">
                                    <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                        {dateDisplay}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>
                <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
                    <p className="text-slate-500">Go shopping to create your first order!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        let items: CartItem[] = [];
                        try {
                            items = JSON.parse(order.items);
                        } catch (e) { console.error("Error parsing items", e); }

                        return (
                            <Card key={order.$id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Order #{order.$id.substring(0, 8)}</CardTitle>
                                            <CardDescription>Placed on {new Date(order.$createdAt).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                        </Badge>
                                    </div>
                                    <Timeline status={order.status} createdAt={order.$createdAt} />
                                </CardHeader>
                                <CardContent>
                                    <div className="border-t pt-4 mt-2">
                                        <h4 className="text-sm font-medium mb-3">Items</h4>
                                        <div className="space-y-3">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                                                            {/* Use optional chaining safely in case product snapshot is missing */}
                                                            {item.product?.imageUrls?.[0] ? (
                                                                <img src={item.product.imageUrls[0]} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Package className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                                                            <p className="text-slate-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t font-bold">
                                            <span>Total Amount</span>
                                            <span>{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
