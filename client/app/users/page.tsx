'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Typography, Box, TextField,
  MenuItem, Pagination, Tooltip, Avatar, Chip,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined, CancelOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserForm from '@/components/forms/UserForm';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { User, Pagination as PaginationType } from '@/types';
import { formatDate, getInitials, getRoleColor } from '@/utils/helpers';

const ROLE_OPTIONS = ['', 'Admin', 'Manager', 'User'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await userService.getAll({ page, limit: 10, search, role: roleFilter || undefined });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setSaveLoading(true);
    try {
      await userService.create(data);
      toast.success('User created successfully');
      setFormOpen(false);
      fetchUsers(1);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editUser) return;
    setSaveLoading(true);
    // Don't send empty password for updates
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    try {
      await userService.update(editUser._id, payload);
      toast.success('User updated successfully');
      setEditUser(null);
      fetchUsers(pagination.page);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update user');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await userService.delete(deleteTarget._id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers(1);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout allowedRoles={['Admin']}>
      <PageHeader
        title="User Management"
        subtitle={`${pagination.total} total users`}
        action={{ label: 'New User', onClick: () => setFormOpen(true) }}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small" placeholder="Search users..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchOutlined sx={{ mr: 1, color: 'text.disabled' }} /> }}
              sx={{ minWidth: 220 }}
            />
            <TextField select size="small" label="Role" value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 140 }}>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r || 'All Roles'}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : !users.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState message="No users found" action={{ label: 'Create User', onClick: () => setFormOpen(true) }} />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(u.role), fontSize: 13, fontWeight: 700 }}>
                          {getInitials(u.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {u.name}
                            {u._id === currentUser?._id && (
                              <Chip label="You" size="small" sx={{ ml: 1, height: 16, fontSize: 9 }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{ bgcolor: getRoleColor(u.role), color: 'white', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Box display="flex" alignItems="center" gap={0.5} color="success.main">
                          <CheckCircleOutlined fontSize="small" />
                          <Typography variant="body2">Active</Typography>
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" gap={0.5} color="error.main">
                          <CancelOutlined fontSize="small" />
                          <Typography variant="body2">Inactive</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(u.lastLogin)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(u.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => setEditUser(u)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small" color="error"
                            onClick={() => setDeleteTarget(u)}
                            disabled={u._id === currentUser?._id}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination count={pagination.totalPages} page={pagination.page}
              onChange={(_, p) => fetchUsers(p)} color="primary" />
          </Box>
        )}
      </Card>

      <UserForm
        open={formOpen || !!editUser}
        onClose={() => { setFormOpen(false); setEditUser(null); }}
        onSubmit={editUser ? handleUpdate : handleCreate}
        initialData={editUser || undefined}
        loading={saveLoading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
