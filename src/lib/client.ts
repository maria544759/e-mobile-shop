import type { ApiService } from './api';
import { MockService } from './mock-service';
import { AppwriteService } from './appwrite';

console.log('Logic: client.ts logic evaluating...');

// Helper to safely check environment
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

let client: ApiService;

console.log('Logic: client.ts initializing service...');

try {
    if (useMock) {
        console.log('Logic: Instantiating MockService');
        client = new MockService();
    } else {
        console.log('Logic: Instantiating AppwriteService');
        client = new AppwriteService();
    }
} catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize API client:', error);
    // Fallback to dummy to prevent white screen
    client = {
        login: async () => { throw new Error('Client Failed'); },
        logout: async () => { },
        getCurrentUser: async () => null,
        getProducts: async () => [],
        getProduct: async () => null,
        createProduct: async () => ({}) as any,
        updateProduct: async () => ({}) as any,
        deleteProduct: async () => { },
        getMyProducts: async () => [],
        createOrder: async () => ({}) as any,
        getMyOrders: async () => [],
        getSellerOrders: async () => [],
        uploadFile: async () => 'mock_id',
        getFilePreview: () => '',
        deleteFile: async () => { },
    };
}

export const apiClient = client;
