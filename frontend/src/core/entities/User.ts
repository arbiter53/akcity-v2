export enum UserRole {
  GENERAL_MANAGER = 'general_manager',
  PROJECT_MANAGER = 'project_manager',
  ARCHITECT = 'architect',
  CHIEF_ENGINEER = 'chief_engineer',
  DRIVER = 'driver',
  WORKER = 'worker',
  PURCHASING_MANAGER = 'purchasing_manager',
  CLIENT = 'client'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  projects?: string[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
