import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date?: string | null) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date?: string | null) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const timeAgo = (date?: string | null) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    // Project statuses
    Planning: 'default',
    Active: 'primary',
    'On Hold': 'warning',
    Completed: 'success',
    Cancelled: 'error',
    // Task statuses
    Todo: 'default',
    'In Progress': 'primary',
    Review: 'warning',
    // Common
    Inactive: 'error',
  };
  return map[status] || 'default';
};

export const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    Low: 'success',
    Medium: 'info',
    High: 'warning',
    Critical: 'error',
  };
  return map[priority] || 'default';
};

export const getRoleColor = (role: string): string => {
  const map: Record<string, string> = {
    Admin: '#dc2626',
    Manager: '#7c3aed',
    User: '#1976d2',
  };
  return map[role] || '#6b7280';
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
