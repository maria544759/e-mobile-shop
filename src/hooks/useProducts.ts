import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/client';

export const useProducts = (category?: string) => {
    return useQuery({
        queryKey: ['products', category],
        queryFn: () => apiClient.getProducts(category),
    });
};

export const useProduct = (id: string) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => apiClient.getProduct(id),
    });
};
