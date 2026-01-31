import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CartSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
    const { items, updateQuantity, removeItem } = useCartStore();
    const navigate = useNavigate();
    const sheetRef = useRef<HTMLDivElement>(null);

    const totalAmount = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" onClick={onClose} />

            {/* Panel */}
            <div
                ref={sheetRef}
                className={cn(
                    "relative z-50 w-full max-w-sm h-full bg-white shadow-xl flex flex-col transition-transform duration-300 transform",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Shopping Cart ({items.length})</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                            <p>Your cart is empty</p>
                            <Button variant="outline" onClick={onClose}>Continue Shopping</Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.productId} className="flex gap-4 py-4 border-b last:border-0">
                                <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.product?.imageUrls?.[0] ? (
                                        <img src={item.product.imageUrls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-medium text-sm line-clamp-2">{item.product?.name}</h3>
                                    <p className="text-sm font-bold">${item.product?.price.toFixed(2)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center border rounded-md">
                                            <button
                                                className="p-1 hover:bg-slate-100"
                                                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                className="p-1 hover:bg-slate-100"
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(item.productId)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t bg-slate-50 space-y-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <Button className="w-full text-lg py-6" onClick={handleCheckout}>
                            Proceed to Checkout
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
