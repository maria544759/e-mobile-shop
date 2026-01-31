import type { ApiService } from './api';
import { MOCK_PRODUCTS, MOCK_USERS } from './mock-data';
import type { Product, User, Order } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

console.log('Logic: MockService module evaluating. MOCK_USERS:', MOCK_USERS);

export class MockService implements ApiService {
    private users: User[] = [];
    private products: Product[] = [];
    private orders: Order[] = [];
    private currentUser: User | null = null;

    constructor() {
        console.log('Logic: MockService constructor starting...');
        try {
            this.users = MOCK_USERS ? [...MOCK_USERS] : [];
            this.products = MOCK_PRODUCTS ? [...MOCK_PRODUCTS] : [];
            console.log('Logic: Data loaded. Users:', this.users.length, 'Products:', this.products.length);
        } catch (e) {
            console.error('Logic: Error loading mock data:', e);
        }

        // Restore session from localStorage if available
        const storedUser = localStorage.getItem('mock_session');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
            } catch (e) {
                console.error('Failed to parse mock session', e);
                localStorage.removeItem('mock_session');
            }
        }
    }

    // --- Auth ---
    async login(username: string, _password?: string): Promise<User> {
        await delay(500);
        const user = this.users.find((u) => u.name.toLowerCase() === username.toLowerCase());
        if (!user) throw new Error('Invalid credentials');

        this.currentUser = user;
        localStorage.setItem('mock_session', JSON.stringify(user));
        return user;
    }

    async register(email: string, _password: string, name: string, role: string): Promise<User> {
        await delay(500);
        const newUser: User = {
            $id: `user-${Date.now()}`,
            name,
            email,
            role: role as any,
        };
        this.users.push(newUser);
        this.currentUser = newUser;
        return newUser;
    }

    async updateUserRole(userId: string, role: string): Promise<User> {
        await delay(500);
        const user = this.users.find((u) => u.$id === userId);
        if (user) {
            user.role = role as any;
            if (this.currentUser && this.currentUser.$id === userId) {
                this.currentUser.role = role as any;
            }
        }
        return user || this.currentUser!;
    }

    async logout(): Promise<void> {
        await delay(200);
        this.currentUser = null;
        localStorage.removeItem('mock_session');
    }

    async getCurrentUser(): Promise<User | null> {
        await delay(200);
        return this.currentUser;
    }

    // --- Products ---
    async getProducts(category?: string): Promise<Product[]> {
        await delay(500);
        if (category) {
            return this.products.filter((p) => p.category === category);
        }
        return this.products;
    }

    async getProduct(id: string): Promise<Product | null> {
        await delay(300);
        return this.products.find((p) => p.$id === id) || null;
    }

    async createProduct(data: Omit<Product, '$id' | '$createdAt' | '$updatedAt'>): Promise<Product> {
        await delay(800);
        const newProduct: Product = {
            ...data,
            $id: `prod-${Date.now()}`,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };
        this.products.unshift(newProduct); // Add to top
        return newProduct;
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        await delay(600);
        const index = this.products.findIndex((p) => p.$id === id);
        if (index === -1) throw new Error('Product not found');

        const updatedProduct = {
            ...this.products[index],
            ...data,
            $updatedAt: new Date().toISOString(),
        };
        this.products[index] = updatedProduct;
        return updatedProduct;
    }

    async deleteProduct(id: string): Promise<void> {
        await delay(500);
        this.products = this.products.filter((p) => p.$id !== id);
    }

    async getMyProducts(sellerId: string): Promise<Product[]> {
        await delay(400);
        return this.products.filter((p) => p.sellerId === sellerId);
    }

    // --- Orders ---
    async createOrder(orderData: Omit<Order, '$id' | '$createdAt' | '$updatedAt'>): Promise<Order> {
        await delay(1000);
        const newOrder: Order = {
            ...orderData,
            $id: `ord-${Date.now()}`,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };
        this.orders.unshift(newOrder); // Add to top
        return newOrder;
    }

    async getMyOrders(userId: string): Promise<Order[]> {
        await delay(500);
        return this.orders.filter((o) => o.customerId === userId);
    }

    async getSellerOrders(sellerId: string): Promise<Order[]> {
        await delay(600);
        // Find products owned by seller
        const sellerProductIds = this.products.filter(p => p.sellerId === sellerId).map(p => p.$id);

        // Find orders that contain any of these products
        // Note: items is a JSON string, need to parse
        return this.orders.filter(order => {
            try {
                const items = JSON.parse(order.items) as { productId: string }[];
                return items.some(item => sellerProductIds.includes(item.productId));
            } catch {
                return false;
            }
        });
    }

    async updateOrderStatus(orderId: string, status: 'pending' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order> {
        await delay(500);
        const order = this.orders.find(o => o.$id === orderId);
        if (!order) throw new Error('Order not found');
        order.status = status;
        order.$updatedAt = new Date().toISOString();
        return order;
    }

    async uploadFile(_file: File): Promise<string> {
        await delay(1000);
        return `mock-file-${Date.now()}`;
    }

    getFilePreview(fileId: string): string {
        return `https://via.placeholder.com/300?text=Mock+Image+${fileId}`;
    }

    async deleteFile(fileId: string): Promise<void> {
        await delay(500);
        console.log(`Deleted mock file ${fileId}`);
    }
}
