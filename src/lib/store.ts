import { create } from 'zustand';
import { apiClient } from './client';

interface AuthState {
    user: any;
    isLoading: boolean;
    login: (u: string, p?: string) => Promise<void>;
    register: (email: string, password: string, name: string, role: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null, // Start with no user
    isLoading: true, // Start loading until session check
    login: async (username, password) => {
        set({ isLoading: true });
        try {
            const user = await apiClient.login(username, password);
            set({ user, isLoading: false });
        } catch (e) {
            console.error('Login Failed', e);
            set({ isLoading: false });
            throw e; // Re-throw to handle UI errors
        }
    },
    register: async (email, password, name, role) => {
        set({ isLoading: true });
        try {
            const user = await apiClient.register(email, password, name, role as any);
            set({ user, isLoading: false });
        } catch (e) {
            console.error('Registration Failed', e);
            set({ isLoading: false });
            throw e;
        }
    },
    logout: async () => {
        set({ isLoading: true });
        await apiClient.logout();
        set({ user: null, isLoading: false });
    },
    // ... (AuthState)
    checkSession: async () => {
        set({ isLoading: true });
        try {
            const user = await apiClient.getCurrentUser();
            console.log('Session Checked:', user);
            set({ user, isLoading: false });
        } catch (error) {
            console.error('Session check failed', error);
            set({ user: null, isLoading: false });
        }
    },
}));

interface CartState {
    items: any[];
    addItem: (item: any) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
            return {
                items: state.items.map((i) =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                ),
            };
        }
        return { items: [...state.items, item] };
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
    })),
    updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
        ),
    })),
    clearCart: () => set({ items: [] }),
}));
