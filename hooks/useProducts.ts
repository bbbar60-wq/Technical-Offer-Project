import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addBulkProducts // Import bulk add for products
} from '@/lib/api';
import { Product } from '@/types';

export function useProducts() {
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const addMutation = useMutation({
    mutationFn: (productData: Omit<Product, 'id'>) => addProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const addBulkMutation = useMutation({
      mutationFn: (productsData: Omit<Product, 'id'>[]) => addBulkProducts(productsData),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
      }
  });

  const updateMutation = useMutation({
    mutationFn: (productData: Product) => updateProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: products ?? [],
    isLoading,
    error,
    addProduct: addMutation.mutate,
    addBulkProducts: addBulkMutation.mutate, // Expose bulk add
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
  };
}