import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/client';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['All', 'Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'OnePlus', 'Sony'];

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.getProducts(
                    category,
                    minPrice === '' ? undefined : Number(minPrice),
                    maxPrice === '' ? undefined : Number(maxPrice)
                );
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [category, minPrice, maxPrice]);

    const FilterContent = ({ className }: { className?: string }) => (
        <div className={className}>
            <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setCategory(cat); setIsFilterOpen(false); }}
                            className={`block w-full text-left text-sm py-1 px-2 rounded-md transition-colors ${category === cat
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-4 mt-8 md:mt-0">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="min">Min</Label>
                        <Input
                            id="min"
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="max">Max</Label>
                        <Input
                            id="max"
                            type="number"
                            placeholder="1000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>
                </div>
            </div>
            <Button className="w-full mt-8 md:hidden" onClick={() => setIsFilterOpen(false)}>
                Show Results
            </Button>
        </div>
    );

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            {/* Mobile Filter Overlay */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
                    <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white p-6 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-lg font-bold">Filters</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}

            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 space-y-8 sticky top-24 h-fit">
                <FilterContent />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
                        <p className="text-slate-500">
                            {isLoading ? 'Loading products...' : `Showing ${products.length} results`}
                        </p>
                    </div>
                    <Button variant="outline" className="md:hidden w-full sm:w-auto" onClick={() => setIsFilterOpen(true)}>
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed text-slate-500">
                        No products found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Card key={product.$id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="p-0">
                                    <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img
                                                src={product.imageUrls[0]}
                                                alt={product.name}
                                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <span className="text-slate-400">No Image</span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-6">
                                    <CardTitle className="line-clamp-1 mb-2 text-lg">{product.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">{product.description}</CardDescription>
                                    <p className="font-bold text-xl mt-4 text-slate-900">${product.price.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Button className="w-full" onClick={() => addItem({ productId: product.$id, quantity: 1, product })}>
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
