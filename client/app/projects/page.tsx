'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Typography, Box, TextField,
  MenuItem, Pagination, Tooltip, Chip, Avatar,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, VisibilityOutlined, SearchOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/forms/ProjectForm';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { Project, Pagination as PaginationType } from '@/types';
import { formatDate, getInitials, getRoleColor } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['', 'Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await projectService.getAll({ page, limit: 10, search, status: statusFilter || undefined });
      setProjects(res.data.projects);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(1), 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setSaveLoading(true);
    try {
      await projectService.create(data);
      toast.success('Project created successfully');
      setFormOpen(false);
      fetchProjects(1);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create project');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editProject) return;
    setSaveLoading(true);
    try {
      await projectService.update(editProject._id, data);
      toast.success('Project updated successfully');
      setEditProject(null);
      fetchProjects(pagination.page);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update project');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await projectService.delete(deleteTarget._id);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchProjects(1);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AppLayout>
      <PageHeader
        title="Projects"
        subtitle={`${pagination.total} total projects`}
        action={isAdmin ? { label: 'New Project', onClick: () => setFormOpen(true) } : undefined}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchOutlined sx={{ mr: 1, color: 'text.disabled' }} /> }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select size="small" label="Status" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : !projects.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState message="No projects found" action={isAdmin ? { label: 'Create Project', onClick: () => setFormOpen(true) } : undefined} />
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{project.title}</Typography>
                      {project.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                          {project.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><StatusChip label={project.status} /></TableCell>
                    <TableCell><StatusChip label={project.priority} type="priority" /></TableCell>
                    <TableCell>
                      {project.manager ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: getRoleColor('Manager') }}>
                            {getInitials((project.manager as { name: string }).name)}
                          </Avatar>
                          <Typography variant="body2">{(project.manager as { name: string }).name}</Typography>
                        </Box>
                      ) : <Typography variant="caption" color="text.disabled">Unassigned</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(project.deadline)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => router.push(`/projects/${project._id}`)}>
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => setEditProject(project)}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(project)}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_, p) => fetchProjects(p)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Create/Edit Form */}
      <ProjectForm
        open={formOpen || !!editProject}
        onClose={() => { setFormOpen(false); setEditProject(null); }}
        onSubmit={editProject ? handleUpdate : handleCreate}
        initialData={editProject || undefined}
        loading={saveLoading}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also delete all associated tasks.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
