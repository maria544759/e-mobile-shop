import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload } from 'lucide-react';

export default function AddProduct() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [stock, setStock] = useState('1');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalFiles = imageFiles.length + files.length;

            if (totalFiles > 4) {
                alert("You can only upload a maximum of 4 images.");
                return;
            }

            // Note: In Edit mode, this replaces previews but we only upload new files
            // Ideally we should merge, but simplest for now is: 
            // If user uploads files, we will use ONLY these new files to replace old ones.

            const newPreviews = files.map(file => URL.createObjectURL(file));

            // If we are editing and user adds files, we assume they want to REPLACE or ADD?
            // "Add to exiting" is complex without old IDs. 
            // Let's implement REPLACE logic if files are added.

            setImageFiles(prev => [...prev, ...files]);
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Edit Mode Logic
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode && id) {
            loadProduct(id);
        }
    }, [isEditMode, id]);

    const loadProduct = async (productId: string) => {
        setLoading(true);
        try {
            const product = await apiClient.getProduct(productId);
            if (product) {
                setName(product.name);
                setPrice(product.price.toString());
                setCategory(product.category);
                setDescription(product.description);
                setStock(product.stock.toString());
                if (product.imageUrls) {
                    setPreviews(product.imageUrls);
                }
            }
        } catch (error) {
            console.error("Failed to load product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            console.error("No user found.");
            alert("You must be logged in to add a product.");
            return;
        }

        if (imageFiles.length === 0 && !isEditMode && previews.length === 0) {
            alert("Please upload at least one image.");
            return;
        }

        if (!name || !price || !category || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        const stockNum = parseInt(stock);
        const priceNum = parseFloat(price);

        if (isNaN(stockNum) || stockNum < 0) {
            alert("Please enter a valid stock number.");
            return;
        }
        if (isNaN(priceNum) || priceNum < 0) {
            alert("Please enter a valid price.");
            return;
        }

        setLoading(true);
        try {
            let imageUrls: string[] | undefined = undefined;

            // Only upload images if there are new files to upload
            if (imageFiles.length > 0) {
                console.log("Uploading images...", imageFiles);
                const uploadedImageIds = await Promise.all(
                    imageFiles.map(file => apiClient.uploadFile(file))
                );
                // Store IDs, not URLs, to satisfy Appwrite string length limits
                imageUrls = uploadedImageIds;
            }

            const productData = {
                name,
                price: priceNum,
                category,
                description,
                imageUrls: imageUrls,
                sellerId: user.$id,
                stock: stockNum
            };

            if (isEditMode && id) {
                console.log("Updating product...", id);
                await apiClient.updateProduct(id, productData);
                alert("Product updated successfully!");
            } else {
                if (!imageUrls) throw new Error("Image is required for new products");
                console.log("Creating product...");

                await apiClient.createProduct({
                    ...productData,
                    imageUrls: imageUrls
                });
                alert("Product created successfully!");
            }

            navigate('/seller/products');
        } catch (error: any) {
            console.error('Failed to save product:', error);
            alert(`Failed to save product: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-12">
            <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. iPhone 15 Pro"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="999.99"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="1"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Apple">Apple</SelectItem>
                                    <SelectItem value="Samsung">Samsung</SelectItem>
                                    <SelectItem value="Google">Google</SelectItem>
                                    <SelectItem value="Huawei">Huawei</SelectItem>
                                    <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                                    <SelectItem value="OnePlus">OnePlus</SelectItem>
                                    <SelectItem value="Sony">Sony</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your product..."
                                className="h-32"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Product Images (Max 4)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {imageFiles.length < 4 && (
                                    <label className="border-2 border-dashed border-slate-200 rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                        <Upload className="h-6 w-6 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
