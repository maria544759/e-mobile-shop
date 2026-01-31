export type Role = 'customer' | 'seller';

export interface User {
    $id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
}

export interface Product {
    $id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrls: string[];
    sellerId: string;
    stock: number;
    $createdAt: string;
    $updatedAt: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
    product?: Product; // For UI convenience
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    $id: string;
    customerId: string;
    totalAmount: number;
    status: OrderStatus;
    items: string; // JSON string of CartItem[]
    shippingAddress: string;
    $createdAt: string;
    $updatedAt: string;
}
