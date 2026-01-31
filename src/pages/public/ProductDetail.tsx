import { useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: product, isLoading } = useProduct(id!);
    const { addItem } = useCartStore();

    if (isLoading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery Mock */}
            <div className="space-y-4">
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="object-cover w-full h-full mix-blend-multiply"
                    />
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {/* Just repeating the image for now, later multiple images */}
                    <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200 overflow-hidden cursor-pointer ring-2 ring-slate-900">
                        <img src={product.imageUrls[0]} className="object-cover w-full h-full mix-blend-multiply" />
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-slate-500 mt-2 text-lg">{product.category}</p>
                </div>

                <div className="text-3xl font-bold text-slate-900">
                    {formatPrice(product.price)}
                </div>

                <div className="prose text-slate-600">
                    <p>{product.description}</p>
                </div>

                <div className="pt-6 border-t">
                    <Button
                        size="lg"
                        className="w-full md:w-auto min-w-[200px]"
                        onClick={() => addItem({ productId: product.$id, quantity: 1, product })}
                    >
                        Add to Cart
                    </Button>
                    <p className="text-sm text-slate-500 mt-4">
                        Free shipping on orders over $50. In stock: {product.stock}
                    </p>
                </div>
            </div>
        </div>
    );
}
