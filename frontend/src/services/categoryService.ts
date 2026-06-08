import apiClient from "@/services/apiClient";
import type { Category, CategoryCreate, CategoryUpdate } from "@/types/category";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const categoryService = {
  /**
   * Fetches all categories.
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<StandardResponse<Category[]>>(
      "/api/categories"
    );
    return response.data.data;
  },

  /**
   * Fetches a single category by ID.
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<StandardResponse<Category>>(
      `/api/categories/${id}`
    );
    return response.data.data;
  },

  /**
   * Creates a new category.
   */
  async create(category: CategoryCreate): Promise<Category> {
    const response = await apiClient.post<StandardResponse<Category>>(
      "/api/categories",
      category
    );
    return response.data.data;
  },

  /**
   * Updates an existing category by ID.
   */
  async update(id: number, category: CategoryUpdate): Promise<Category> {
    const response = await apiClient.put<StandardResponse<Category>>(
      `/api/categories/${id}`,
      category
    );
    return response.data.data;
  },

  /**
   * Deletes a category by ID.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete<StandardResponse<null>>(`/api/categories/${id}`);
  },
};
