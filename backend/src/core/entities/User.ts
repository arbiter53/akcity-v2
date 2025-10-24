import { ObjectId } from 'mongodb';

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

export interface UserProps {
  id?: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  projects?: ObjectId[];
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>): User {
    return new User({
      ...props,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static fromPersistence(data: any): User {
    return new User({
      id: data._id,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role,
      avatar: data.avatar,
      status: data.status,
      lastLogin: data.lastLogin,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      projects: data.projects
    });
  }

  // Getters
  get id(): ObjectId | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get projects(): ObjectId[] | undefined {
    return this.props.projects;
  }

  // Business Methods
  updateProfile(data: { name?: string; phone?: string; avatar?: string }): void {
    if (data.name) this.props.name = data.name;
    if (data.phone) this.props.phone = data.phone;
    if (data.avatar) this.props.avatar = data.avatar;
    this.props.updatedAt = new Date();
  }

  changePassword(newPassword: string): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  updateLastLogin(): void {
    this.props.lastLogin = new Date();
  }

  activate(): void {
    this.props.status = UserStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.status = UserStatus.INACTIVE;
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();
  }

  hasPermission(permission: string): boolean {
    const rolePermissions = this.getRolePermissions();
    return rolePermissions.includes(permission);
  }

  private getRolePermissions(): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.GENERAL_MANAGER]: ['*'], // All permissions
      [UserRole.PROJECT_MANAGER]: [
        'project:read', 'project:write', 'project:delete',
        'task:read', 'task:write', 'task:delete',
        'user:read', 'report:read', 'report:write'
      ],
      [UserRole.ARCHITECT]: [
        'project:read', 'task:read', 'task:write',
        'document:read', 'document:write'
      ],
      [UserRole.CHIEF_ENGINEER]: [
        'project:read', 'task:read', 'task:write',
        'report:read', 'report:write', 'quality:read', 'quality:write'
      ],
      [UserRole.DRIVER]: [
        'task:read', 'material:read', 'delivery:read', 'delivery:write'
      ],
      [UserRole.WORKER]: [
        'task:read', 'report:write', 'material:request'
      ],
      [UserRole.PURCHASING_MANAGER]: [
        'material:read', 'material:write', 'material:delete',
        'supplier:read', 'supplier:write'
      ],
      [UserRole.CLIENT]: [
        'project:read', 'report:read'
      ]
    };

    return permissions[this.props.role] || [];
  }

  toJSON(): Partial<UserProps> {
    const { password, ...userWithoutPassword } = this.props;
    return userWithoutPassword;
  }

  toPersistence(): any {
    return {
      _id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      password: this.props.password,
      phone: this.props.phone,
      role: this.props.role,
      avatar: this.props.avatar,
      status: this.props.status,
      lastLogin: this.props.lastLogin,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      projects: this.props.projects
    };
  }
}
