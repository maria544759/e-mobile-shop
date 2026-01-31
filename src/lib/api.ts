import type { User, Product, Order, Role } from './types';

export interface AuthApi {
    login(username: string, password?: string): Promise<User>;
    register(email: string, password: string, name: string, role: Role): Promise<User>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    updateUserRole(userId: string, role: Role): Promise<User>;
}

export interface ProductApi {
    getProducts(category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]>;
    getProduct(id: string): Promise<Product | null>;
    createProduct(data: Omit<Product, '$id' | '$createdAt' | '$updatedAt'>): Promise<Product>;
    updateProduct(id: string, data: Partial<Product>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
    getMyProducts(sellerId: string): Promise<Product[]>;
}

export interface OrderApi {
    createOrder(order: Omit<Order, '$id' | '$createdAt' | '$updatedAt'>): Promise<Order>;
    getMyOrders(userId: string): Promise<Order[]>;
    getSellerOrders(sellerId: string): Promise<Order[]>;
    updateOrderStatus(orderId: string, status: 'pending' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order>;
}

export interface StorageApi {
    uploadFile(file: File): Promise<string>; // Returns file ID
    getFilePreview(fileId: string): string; // Returns URL
    deleteFile(fileId: string): Promise<void>;
}

export interface ApiService extends AuthApi, ProductApi, OrderApi, StorageApi { }
