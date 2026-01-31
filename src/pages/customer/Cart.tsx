import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export default function Cart() {
    const { items, removeItem, updateQuantity } = useCartStore();
    const navigate = useNavigate();

    const total = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                <Link to="/products">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <Card key={item.productId} className="flex gap-4 p-4">
                            <div className="w-24 h-24 bg-slate-100 rounded flex-shrink-0 overflow-hidden border">
                                {item.product?.images?.[0] && (
                                    <img src={item.product.images[0]} className="w-full h-full object-cover mix-blend-multiply" alt={item.product.name} />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between">
                                    <h3 className="font-medium text-lg">{item.product?.name}</h3>
                                    <p className="font-bold">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>-</Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                                    </div>
                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(item.productId)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div>
                    <Card className="p-6 sticky top-24">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between mb-4 pb-4 border-b">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mb-6">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
