import { ObjectId } from 'mongodb';
import { User, UserRole, UserStatus } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IHashService } from '../interfaces/IHashService';
import { IEmailService } from '../interfaces/IEmailService';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private emailService: IEmailService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // Validate input
      if (!request.name || !request.email || !request.password || !request.phone || !request.role) {
        return {
          success: false,
          error: 'All fields are required'
        };
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Validate password strength
      if (request.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Validate phone format
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(request.phone)) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      // Hash password
      const hashedPassword = await this.hashService.hash(request.password);

      // Create user entity
      const user = User.create({
        name: request.name,
        email: request.email.toLowerCase(),
        password: hashedPassword,
        phone: request.phone,
        role: request.role
      });

      // Save user
      const createdUser = await this.userRepository.create(user);

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail({
          to: createdUser.email,
          name: createdUser.name,
          role: createdUser.role
        });
      } catch (emailError) {
        // Log email error but don't fail user creation
        console.error('Failed to send welcome email:', emailError);
      }

      return {
        success: true,
        user: createdUser
      };
    } catch (error) {
      console.error('CreateUserUseCase error:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }
}
