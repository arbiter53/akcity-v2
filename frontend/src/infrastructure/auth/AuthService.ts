import { IAuthService } from '../../core/interfaces/IAuthService';
import { User, LoginRequest, LoginResponse, CreateUserRequest } from '../../core/entities/User';
import { ApiClient } from '../api/ApiClient';

export class AuthService implements IAuthService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens and user data
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: CreateUserRequest): Promise<User> {
    const user = await this.apiClient.post<User>('/auth/register', userData);
    return user;
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );

    // Update stored tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    return response;
  }

  async getCurrentUser(): Promise<User> {
    const user = await this.apiClient.get<User>('/auth/me');
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const user = await this.apiClient.put<User>('/auth/profile', data);
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Helper methods
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? roles.includes(user.role) : false;
  }
}
