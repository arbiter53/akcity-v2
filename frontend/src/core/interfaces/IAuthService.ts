import { User, LoginRequest, LoginResponse, CreateUserRequest } from '../entities/User';

export interface IAuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  register(userData: CreateUserRequest): Promise<User>;
  logout(): Promise<void>;
  refreshToken(): Promise<{ accessToken: string; refreshToken: string }>;
  getCurrentUser(): Promise<User>;
  updateProfile(data: Partial<User>): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}
