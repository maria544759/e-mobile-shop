import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/client';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { Hero } from '@/components/home/Hero';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all for now, but really "Featured" should be a query
                const data = await apiClient.getProducts();
                // Take first 4 as featured
                setProducts(data.slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div>
            <Hero />

            <section className="max-w-screen-xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold tracking-tight mb-8">Featured Products</h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center text-slate-500">No products found.</div>
                        ) : (
                            products.map((product) => (
                                <Card key={product.$id} className="flex flex-col h-full hover:shadow-md transition-shadow">
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
                                    <CardContent className="flex-grow p-4">
                                        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm mt-1">{product.description}</CardDescription>
                                        <p className="font-bold text-lg mt-2">${product.price.toFixed(2)}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button className="w-full" onClick={() => addItem({ productId: product.$id, quantity: 1, product })}>
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
