import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductEditor() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // If editing, fetch existing
    const { data: product } = useQuery({
        queryKey: ['product', id],
        queryFn: () => apiClient.getProduct(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        image: '',
    });

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                category: product.category,
                stock: product.stock.toString(),
                image: product.images[0] || '',
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const productData = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                category: form.category,
                stock: parseInt(form.stock),
                images: [form.image],
                sellerId: user!.$id, // In real app, backend assigns this from session
            };

            if (isEdit) {
                await apiClient.updateProduct(id!, productData);
            } else {
                await apiClient.createProduct(productData);
            }
            navigate('/seller/products');
        } catch (error) {
            alert('Failed to save product');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price</label>
                                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                <option>Electronics</option>
                                <option>Home</option>
                                <option>Books</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Image URL</label>
                            <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." required />
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => navigate('/seller/products')}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
