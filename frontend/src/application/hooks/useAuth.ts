import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../store';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  updateProfile,
  clearError 
} from '../store/authSlice';
import { LoginRequest, User } from '../../core/entities/User';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Giriş başarılı');
        return { success: true };
      } else {
        toast.error(result.payload as string);
        return { success: false, error: result.payload as string };
      }
    } catch (error) {
      toast.error('Giriş sırasında hata oluştu');
      return { success: false, error: 'Giriş sırasında hata oluştu' };
    }
  }, [dispatch]);

  const register = useCallback(async (userData: any) => {
    try {
      const result = await dispatch(registerUser(userData));
      if (registerUser.fulfilled.match(result)) {
        toast.success('Kayıt başarılı');
        return { success: true };
      } else {
        toast.error(result.payload as string);
        return { success: false, error: result.payload as string };
      }
    } catch (error) {
      toast.error('Kayıt sırasında hata oluştu');
      return { success: false, error: 'Kayıt sırasında hata oluştu' };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      toast.success('Çıkış yapıldı');
    } catch (error) {
      toast.error('Çıkış sırasında hata oluştu');
    }
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    try {
      await dispatch(getCurrentUser());
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [dispatch]);

  const updateUserProfile = useCallback(async (data: Partial<User>) => {
    try {
      const result = await dispatch(updateProfile(data));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profil güncellendi');
        return { success: true };
      } else {
        toast.error(result.payload as string);
        return { success: false, error: result.payload as string };
      }
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu');
      return { success: false, error: 'Profil güncellenirken hata oluştu' };
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const hasRole = useCallback((role: string) => {
    return auth.user?.role === role;
  }, [auth.user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return auth.user ? roles.includes(auth.user.role) : false;
  }, [auth.user]);

  const canAccess = useCallback((permission: string) => {
    if (!auth.user) return false;
    
    // Define role permissions
    const rolePermissions: Record<string, string[]> = {
      general_manager: ['*'], // All permissions
      project_manager: [
        'project:read', 'project:write', 'project:delete',
        'task:read', 'task:write', 'task:delete',
        'user:read', 'report:read', 'report:write'
      ],
      architect: [
        'project:read', 'task:read', 'task:write',
        'document:read', 'document:write'
      ],
      chief_engineer: [
        'project:read', 'task:read', 'task:write',
        'report:read', 'report:write', 'quality:read', 'quality:write'
      ],
      driver: [
        'task:read', 'material:read', 'delivery:read', 'delivery:write'
      ],
      worker: [
        'task:read', 'report:write', 'material:request'
      ],
      purchasing_manager: [
        'material:read', 'material:write', 'material:delete',
        'supplier:read', 'supplier:write'
      ],
      client: [
        'project:read', 'report:read'
      ]
    };

    const permissions = rolePermissions[auth.user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [auth.user]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    updateUserProfile,
    clearAuthError,
    
    // Helpers
    hasRole,
    hasAnyRole,
    canAccess,
  };
};
