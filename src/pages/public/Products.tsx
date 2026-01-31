import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Link, useSearchParams } from 'react-router-dom';

const CATEGORIES = ['All', 'Electronics', 'Home', 'Books'];

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'All';

    // We pass undefined if 'All' to fetch everything
    const { data: products, isLoading } = useProducts(activeCategory === 'All' ? undefined : activeCategory);
    const { addItem } = useCartStore();

    const handleCategoryChange = (cat: string) => {
        if (cat === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat}
                                variant={activeCategory === cat ? 'default' : 'ghost'}
                                className={cn("w-full justify-start", activeCategory === cat ? "" : "text-slate-600")}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-6">{activeCategory === 'All' ? 'All Products' : activeCategory}</h1>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products?.length === 0 && <p>No products found.</p>}
                        {products?.map((product) => (
                            <Card key={product.$id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <Link to={`/products/${product.$id}`} className="block aspect-square relative bg-slate-100 overflow-hidden rounded-t-lg">
                                    <img
                                        src={product.imageUrls[0]}
                                        alt={product.name}
                                        className="object-cover w-full h-full mix-blend-multiply hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-base line-clamp-2 h-10">
                                        <Link to={`/products/${product.$id}`}>{product.name}</Link>
                                    </CardTitle>
                                    <p className="text-sm text-slate-500 capitalize">{product.category}</p>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1 flex items-end">
                                    <div className="font-bold text-lg">{formatPrice(product.price)}</div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button
                                        className="w-full"
                                        onClick={() => addItem({ productId: product.$id, quantity: 1, product })}
                                    >
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
