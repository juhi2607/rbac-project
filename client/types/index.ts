export type Role = 'Admin' | 'Manager' | 'User';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  manager?: User | null;
  members?: User[];
  createdBy?: User;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  project: Project | string;
  assignedTo?: User | null;
  createdBy?: User;
  deadline?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: User;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  totalUsers: number | null;
  projectsByStatus: Array<{ _id: string; count: number }>;
  tasksByStatus: Array<{ _id: string; count: number }>;
  recentProjects: Project[];
}
