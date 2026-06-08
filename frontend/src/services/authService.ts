import apiClient from "@/services/apiClient";
import type { LoginRequest, TokenResponse, User } from "@/types/auth";

/**
 * Interface matching the backend standard response envelope:
 * { success: boolean, data: T, message: string }
 */
interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authService = {
  /**
   * Submits email and password to log in and receive JWT and user details.
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<StandardResponse<TokenResponse>>(
      "/api/auth/login",
      credentials
    );
    return response.data.data;
  },

  /**
   * Fetches the current authenticated user details using active JWT.
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<StandardResponse<User>>("/api/auth/me");
    return response.data.data;
  },
};
