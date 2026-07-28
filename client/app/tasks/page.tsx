'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Typography, Box, TextField,
  MenuItem, Pagination, Tooltip, Avatar, CircularProgress,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TaskForm from '@/components/forms/TaskForm';
import { taskService } from '@/services/taskService';
import { useAuth } from '@/context/AuthContext';
import { Task, Pagination as PaginationType, Project, User } from '@/types';
import { formatDate, getInitials, getRoleColor } from '@/utils/helpers';

const STATUS_OPTIONS = ['', 'Todo', 'In Progress', 'Review', 'Completed'];
const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'High', 'Critical'];

function TasksContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultProject = searchParams.get('project') || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await taskService.getAll({
        page, limit: 10, search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        project: defaultProject || undefined,
      });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, defaultProject]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(1), 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setSaveLoading(true);
    try {
      await taskService.create(data);
      toast.success('Task created successfully');
      setFormOpen(false);
      fetchTasks(1);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create task');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editTask) return;
    setSaveLoading(true);
    try {
      await taskService.update(editTask._id, data);
      toast.success('Task updated');
      setEditTask(null);
      fetchTasks(pagination.page);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update task');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setStatusUpdateId(taskId);
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Status updated');
      fetchTasks(pagination.page);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdateId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await taskService.delete(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks(1);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle={`${pagination.total} total tasks`}
        action={isAdminOrManager ? { label: 'New Task', onClick: () => setFormOpen(true) } : undefined}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small" placeholder="Search tasks..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchOutlined sx={{ mr: 1, color: 'text.disabled' }} /> }}
              sx={{ minWidth: 220 }}
            />
            <TextField select size="small" label="Status" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Priority" value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)} sx={{ minWidth: 140 }}>
              {PRIORITY_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p || 'All Priorities'}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : !tasks.length ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      message="No tasks found"
                      action={isAdminOrManager ? { label: 'Create Task', onClick: () => setFormOpen(true) } : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const canUpdateStatus =
                    user?.role === 'Admin' ||
                    user?.role === 'Manager' ||
                    (task.assignedTo && (task.assignedTo as User)._id === user?._id);
                  return (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
                            {task.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(task.project as Project)?.title || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {canUpdateStatus ? (
                          <TextField
                            select size="small" value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            disabled={statusUpdateId === task._id}
                            sx={{ minWidth: 120 }}
                          >
                            {['Todo', 'In Progress', 'Review', 'Completed'].map((s) => (
                              <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <StatusChip label={task.status} />
                        )}
                      </TableCell>
                      <TableCell><StatusChip label={task.priority} type="priority" /></TableCell>
                      <TableCell>
                        {task.assignedTo ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: getRoleColor((task.assignedTo as User).role) }}>
                              {getInitials((task.assignedTo as User).name)}
                            </Avatar>
                            <Typography variant="body2">{(task.assignedTo as User).name}</Typography>
                          </Box>
                        ) : <Typography variant="caption" color="text.disabled">Unassigned</Typography>}
                      </TableCell>
                      <TableCell><Typography variant="body2">{formatDate(task.deadline)}</Typography></TableCell>
                      <TableCell align="center">
                        {isAdminOrManager && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => setEditTask(task)}>
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(task)}>
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination count={pagination.totalPages} page={pagination.page}
              onChange={(_, p) => fetchTasks(p)} color="primary" />
          </Box>
        )}
      </Card>

      <TaskForm
        open={formOpen || !!editTask}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
        initialData={editTask || undefined}
        defaultProjectId={defaultProject}
        loading={saveLoading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </>
  );
}

export default function TasksPage() {
  return (
    <AppLayout>
      <Suspense fallback={<Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}>
        <TasksContent />
      </Suspense>
    </AppLayout>
  );
}
