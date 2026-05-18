import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { database } from '../database/database';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export class AuthService {
  private currentUser: User | null = null;
  private readonly JWT_SECRET = 'it-management-secret-key'; // In production, use environment variable
  private readonly TOKEN_EXPIRY = '24h';

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await database.getUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        this.JWT_SECRET,
        { expiresIn: this.TOKEN_EXPIRY }
      );

      // Set current user
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.department,
        isActive: user.is_active,
        createdAt: user.created_at
      };

      // Log login activity
      await database.addAuditLog({
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'USER',
        resourceId: user.id,
        newValues: JSON.stringify({ loginTime: new Date().toISOString() })
      });

      return {
        success: true,
        user: this.currentUser,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  async register(userData: { username: string; password: string; firstName: string; lastName: string; email: string; department: string }): Promise<LoginResult> {
    try {
      // Check if username already exists
      const existingUser = await database.getUserByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }

      // Check if email already exists
      const existingEmail = await database.getUserByEmail(userData.email);
      if (existingEmail) {
        return {
          success: false,
          message: 'Email already exists'
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const userId = await database.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        department: userData.department,
        role: 'user' // New users are always regular users
      });

      // Get the created user
      const newUser = await database.getUserById(userId);
      if (!newUser) {
        return {
          success: false,
          message: 'Failed to create user'
        };
      }

      // Set current user
      this.currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as 'admin' | 'user',
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        department: newUser.department,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      };

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: this.currentUser.id, 
          username: this.currentUser.username, 
          role: this.currentUser.role 
        },
        this.JWT_SECRET,
        { expiresIn: this.TOKEN_EXPIRY }
      );

      // Log registration activity
      await database.addAuditLog({
        userId: this.currentUser.id,
        action: 'REGISTER',
        resourceType: 'USER',
        resourceId: this.currentUser.id,
        newValues: JSON.stringify({ 
          username: this.currentUser.username,
          email: this.currentUser.email,
          department: this.currentUser.department
        })
      });

      return {
        success: true,
        user: this.currentUser,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  }

  async logout(): Promise<boolean> {
    try {
      if (this.currentUser) {
        // Log logout activity
        await database.addAuditLog({
          userId: this.currentUser.id,
          action: 'LOGOUT',
          resourceType: 'USER',
          resourceId: this.currentUser.id,
          newValues: JSON.stringify({ logoutTime: new Date().toISOString() })
        });
      }

      this.currentUser = null;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    // Admin has all permissions
    if (this.currentUser.role === 'admin') return true;
    
    // Define user permissions
    const userPermissions = [
      'view_devices',
      'view_tasks',
      'view_projects',
      'edit_own_tasks',
      'view_system_info'
    ];
    
    return userPermissions.includes(permission);
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const user = await database.getUserById(decoded.userId);
      
      if (!user || !user.is_active) {
        return false;
      }

      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.department,
        isActive: user.is_active,
        createdAt: user.created_at
      };

      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await database.getUserById(userId);
      
      if (!user) {
        return false;
      }

      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isValidCurrentPassword) {
        return false;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in database
      await database.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId]
      );

      // Log password change
      await database.addAuditLog({
        userId: userId,
        action: 'PASSWORD_CHANGE',
        resourceType: 'USER',
        resourceId: userId,
        newValues: JSON.stringify({ changeTime: new Date().toISOString() })
      });

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    firstName: string;
    lastName: string;
    department: string;
  }): Promise<number> {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const userId = await database.createUser(userData);

      // Log user creation
      await database.addAuditLog({
        userId: this.currentUser?.id || null,
        action: 'CREATE_USER',
        resourceType: 'USER',
        resourceId: userId,
        newValues: JSON.stringify({
          username: userData.username,
          email: userData.email,
          role: userData.role,
          createdBy: this.currentUser?.username || 'system'
        })
      });

      return userId;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<boolean> {
    try {
      const oldUser = await database.getUserById(userId);
      if (!oldUser) {
        return false;
      }

      await database.updateUser(userId, userData);

      // Log user update
      await database.addAuditLog({
        userId: this.currentUser?.id || null,
        action: 'UPDATE_USER',
        resourceType: 'USER',
        resourceId: userId,
        oldValues: JSON.stringify({
          username: oldUser.username,
          email: oldUser.email,
          role: oldUser.role,
          firstName: oldUser.first_name,
          lastName: oldUser.last_name,
          department: oldUser.department
        }),
        newValues: JSON.stringify(userData)
      });

      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }
}
