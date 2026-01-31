import { useState } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
    const { items, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalAmount = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            navigate('/auth/login?redirect=/checkout');
            return;
        }

        if (items.length === 0) {
            setError("Your cart is empty");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simplified Order Creation: storing items as JSON string as per schema
            const fullAddress = `${address}, ${city}, ${zip}`;
            const itemsString = JSON.stringify(items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                // Include snapshot of product details if needed, but for now ID and Qty + Price snapshot
                price: item.product?.price,
                name: item.product?.name,
                sellerId: item.product?.sellerId
            })));

            const orderData = {
                customerId: user.$id,
                totalAmount: totalAmount,
                status: 'pending' as const,
                items: itemsString,
                shippingAddress: fullAddress,
                paymentMethod: 'bank_transfer' // Valid schema value
            };

            await apiClient.createOrder(orderData);
            clearCart();
            navigate('/orders'); // Or success page
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-screen-xl mx-auto py-20 text-center space-y-4">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <Button onClick={() => navigate('/shop')}>Go Shopping</Button>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <div key={item.productId} className="flex justify-between text-sm">
                                <span>{item.product?.name} x {item.quantity}</span>
                                <span className="font-medium">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Select your payment method</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="cod"
                                    name="paymentMethod"
                                    value="bank_transfer" // Mapping COD to 'bank_transfer' to satisfy schema constraint for now
                                    defaultChecked
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="cod">Cash on Delivery (Bank Transfer)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="card"
                                    name="paymentMethod"
                                    value="credit_card"
                                    disabled
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="card" className="text-slate-400">Credit Card (Coming Soon)</Label>
                            </div>
                        </div>
                        {/* Future: Add Stripe/PayPal here */}
                    </CardContent>
                </Card>

                {/* Shipping Form (merged with payment/submit) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Details</CardTitle>
                        <CardDescription>Enter your delivery address</CardDescription>
                    </CardHeader>
                    <form onSubmit={handlePlaceOrder}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="123 Main St"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        placeholder="New York"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input
                                        id="zip"
                                        placeholder="10001"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Placing Order...' : `Pay $${totalAmount.toFixed(2)}`}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
