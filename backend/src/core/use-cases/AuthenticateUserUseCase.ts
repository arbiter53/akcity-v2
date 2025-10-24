import { ObjectId } from 'mongodb';
import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IHashService } from '../interfaces/IHashService';
import { ITokenService } from '../interfaces/ITokenService';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    try {
      // Validate input
      if (!request.email || !request.password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      // Find user by email with password
      const user = await this.userRepository.findByEmailWithPassword(request.email.toLowerCase());
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'Account is not active'
        };
      }

      // Verify password
      const isPasswordValid = await this.hashService.compare(request.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Update last login
      user.updateLastLogin();
      await this.userRepository.update(user);

      // Generate tokens
      const accessToken = await this.tokenService.generateAccessToken({
        userId: user.id!,
        email: user.email,
        role: user.role
      });

      const refreshToken = await this.tokenService.generateRefreshToken({
        userId: user.id!,
        email: user.email
      });

      return {
        success: true,
        user: user.toJSON() as User,
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('AuthenticateUserUseCase error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }
}
