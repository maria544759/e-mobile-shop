import { Client, Account, Databases, Storage, ID, Query, type Models } from 'appwrite';
import type { ApiService } from './api';
import type { Order, Product, User, Role } from './types';

// Environment variables
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PRODUCTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;
const ORDERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export class AppwriteService implements ApiService {
    private client: Client;
    private account: Account;
    private databases: Databases;
    private storage: Storage;

    constructor() {
        this.client = new Client()
            .setEndpoint(ENDPOINT)
            .setProject(PROJECT_ID);
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.storage = new Storage(this.client);
    }

    private mapProduct(doc: Product & Models.Document): Product {
        // Map DB 'imageIds' (Array of Strings) to Domain 'imageUrls' (Array of URLs)
        const dbProduct = doc as unknown as { imageIds?: string[] };
        const imageIds = dbProduct.imageIds || [];

        return {
            ...doc,
            imageUrls: imageIds.map((id: string) => this.getFilePreview(id))
        };
    }

    // --- Auth ---

    async login(username: string, password?: string): Promise<User> {
        if (!password) throw new Error('Password is required for Appwrite login');

        try {
            await this.account.createEmailPasswordSession(username, password);
            return await this.getCurrentUser() as User;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(email: string, password: string, name: string, role: Role): Promise<User> {
        try {
            // 1. Create Account
            const account = await this.account.create(ID.unique(), email, password, name);

            // 2. Login immediately to create the document with permissions
            await this.account.createEmailPasswordSession(email, password);

            // 3. Create User Document
            await this.databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                account.$id,
                {
                    name: name,
                    email: email,
                    role: role,
                    passwordHash: 'managed_by_appwrite_auth',
                    isActive: true
                }
            );

            return await this.getCurrentUser() as User;
        } catch (error) {
            console.error('Registration error:', error);
            // Cleanup: If session was created but doc failed, maybe logout? 
            // If account created but login failed?
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await this.account.deleteSession('current');
        } catch (error) {
            console.error('Logout error (session might be already deleted):', error);
            // Even if API fails, we should let the store clear the local state
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const user = await this.account.get();
            let role: Role = 'customer';
            let avatarId: string | undefined;

            try {
                const userDoc = await this.databases.getDocument<Models.Document & { role: Role, avatarId?: string }>(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    user.$id
                );
                role = userDoc.role;
                avatarId = userDoc.avatarId;
            } catch (docError) {
                // Fallback (e.g. if user doc not created yet or getting doc fails)
                const prefs = await this.account.getPrefs();
                role = (prefs.role as Role) || 'customer';
            }

            return {
                $id: user.$id,
                name: user.name,
                email: user.email,
                role: role,
                avatarUrl: avatarId ? this.getFilePreview(avatarId) : undefined
            };
        } catch (error) {
            return null;
        }
    }

    async updateUserRole(userId: string, role: Role): Promise<User> {
        await this.databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { role: role }
        );
        return await this.getCurrentUser() as User;
    }

    // --- Products ---

    async getProducts(category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
        const queries = [Query.orderDesc('$createdAt')];

        if (category && category !== 'All') {
            queries.push(Query.equal('category', category));
        }

        if (minPrice !== undefined) {
            queries.push(Query.greaterThanEqual('price', minPrice));
        }

        if (maxPrice !== undefined) {
            queries.push(Query.lessThanEqual('price', maxPrice));
        }

        try {
            const response = await this.databases.listDocuments<Product & Models.Document>(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                queries
            );
            return response.documents.map(doc => this.mapProduct(doc));
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }

    async getProduct(id: string): Promise<Product | null> {
        try {
            const doc = await this.databases.getDocument<Product & Models.Document>(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                id
            );
            return this.mapProduct(doc);
        } catch (error) {
            return null;
        }
    }

    async createProduct(data: Omit<Product, '$id' | '$createdAt' | '$updatedAt'>): Promise<Product> {
        // Transform Domain 'imageUrls' (which actually holds IDs from AddProduct) to DB 'imageId'
        const payload: any = {
            ...data,
            imageIds: data.imageUrls, // Map to new schema field
        };
        // Explicitly remove the old field from the payload object
        delete payload.imageUrls;

        const doc = await this.databases.createDocument<Product & Models.Document>(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID,
            ID.unique(),
            payload
        );
        return this.mapProduct(doc);
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        const payload = { ...data };
        if (data.imageUrls) {
            // If updating images, assume new payload contains IDs
            (payload as any).imageIds = data.imageUrls;
            delete (payload as any).imageUrls;
        }

        const doc = await this.databases.updateDocument<Product & Models.Document>(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID,
            id,
            payload
        );
        return this.mapProduct(doc);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.databases.deleteDocument(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID,
            id
        );
    }

    async getMyProducts(sellerId: string): Promise<Product[]> {
        const response = await this.databases.listDocuments<Product & Models.Document>(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID,
            [
                Query.equal('sellerId', sellerId),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents.map(doc => this.mapProduct(doc));
    }

    // --- Orders ---

    async createOrder(order: Omit<Order, '$id' | '$createdAt' | '$updatedAt'>): Promise<Order> {
        return await this.databases.createDocument<Order & Models.Document>(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            ID.unique(),
            order
        );
    }

    async getMyOrders(userId: string): Promise<Order[]> {
        const response = await this.databases.listDocuments<Order & Models.Document>(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            [
                Query.equal('customerId', userId),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    }

    async getSellerOrders(sellerId: string): Promise<Order[]> {
        // NOTE: This logic assumes orders have a 'sellerId' field or we query items inside orders.
        // But Order type doesn't have sellerId directly, it has items which might contain sellerId implicitly.
        // However, the interface asks for `getSellerOrders`.
        // If the database schema for Order doesn't have sellerId (it's per item usually), this might be tricky.
        // FOR NOW: I will skip strict implementation or assume there's a loose schema or we filter in memory if needed, 
        // OR better, we simply query by 'items' if possible (Appwrite doesn't support deep query in JSON).
        // Let's assume for this MVP that Orders might have a 'sellerId' if it's a single-seller order, 
        // OR we just return empty or throw not implemented for this specific method if not critical yet.
        // Actually, looking at the types, Order has `items: string`.
        // I will return empty array for now to avoid errors, or try to query if I assume a field exists.
        // Let's check api.ts again. `getSellerOrders(sellerId: string)`.
        // I'll implement a basic query assuming there IS a filtering capability or I'll just list all and filter (bad performance but works for small app).

        // BETTER: Assume orders are split by seller or there's a field. 
        // Without schema change, I'll filter client side for now.
        const response = await this.databases.listDocuments<Order & Models.Document>(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );

        // Client-side filter (Parse JSON items) 
        // This is inefficient but safest without changing schema
        return response.documents.filter(order => {
            try {
                const items = JSON.parse(order.items);
                return items.some((item: any) => item.product?.sellerId === sellerId || item.sellerId === sellerId);
            } catch (e) { return false; }
        });
    }

    async updateOrderStatus(orderId: string, status: 'pending' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order> {
        const doc = await this.databases.updateDocument<Order & Models.Document>(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            orderId,
            { status }
        );
        return doc;
    }

    // --- Storage ---

    async uploadFile(file: File): Promise<string> {
        const response = await this.storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );
        return response.$id;
    }

    getFilePreview(fileId: string): string {
        return this.storage.getFilePreview(
            BUCKET_ID,
            fileId,
            400, // Width (optional)
            400  // Height (optional)
        );
    }

    async deleteFile(fileId: string): Promise<void> {
        await this.storage.deleteFile(
            BUCKET_ID,
            fileId
        );
    }
}
