import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole('Admin');
  const isManager = () => hasRole('Manager');
  const isUser = () => hasRole('User');
  const isAdminOrManager = () => hasRole('Admin', 'Manager');

  return { hasRole, isAdmin, isManager, isUser, isAdminOrManager };
};
