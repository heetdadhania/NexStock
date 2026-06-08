import apiClient from "@/services/apiClient";
import type { Product, ProductCreate, ProductUpdate } from "@/types/product";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const productService = {
  /**
   * Fetches all active products, optionally filtered by category.
   */
  async getAll(categoryId?: number): Promise<Product[]> {
    const url = categoryId ? `/api/products?category_id=${categoryId}` : "/api/products";
    const response = await apiClient.get<StandardResponse<Product[]>>(url);
    return response.data.data;
  },

  /**
   * Fetches details of a single product by ID.
   */
  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<StandardResponse<Product>>(`/api/products/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new product and registers its starting inventory.
   */
  async create(product: ProductCreate): Promise<Product> {
    const response = await apiClient.post<StandardResponse<Product>>("/api/products", product);
    return response.data.data;
  },

  /**
   * Updates product specifications and safety stock limits.
   */
  async update(id: number, product: ProductUpdate): Promise<Product> {
    const response = await apiClient.put<StandardResponse<Product>>(
      `/api/products/${id}`,
      product
    );
    return response.data.data;
  },

  /**
   * Soft deletes a product by setting is_active = false.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete<StandardResponse<null>>(`/api/products/${id}`);
  },
};
