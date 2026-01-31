import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/client';
import { useAuthStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function SellerProducts() {
    const { user } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.$id) {
            loadProducts();
        }
    }, [user]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getMyProducts(user!.$id);
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await apiClient.deleteProduct(id);
            loadProducts();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link to="/seller/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : products.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <p className="mb-4">You haven't listed any products yet.</p>
                        <Link to="/seller/products/new">
                            <Button variant="outline">Create your first product</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.$id} className="overflow-hidden group">
                            <div className="aspect-video bg-slate-100 relative">
                                {product.imageUrls?.[0] ? (
                                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link to={`/seller/products/edit/${product.$id}`}>
                                        <Button size="icon" variant="secondary">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(product.$id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                <p className="text-slate-500 text-sm mb-2">{product.category}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
