'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Skeleton,
  Avatar, Button, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, Alert,
} from '@mui/material';
import { ArrowBackOutlined, EditOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AppLayout from '@/components/layout/AppLayout';
import StatusChip from '@/components/ui/StatusChip';
import ProjectForm from '@/components/forms/ProjectForm';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { Project, Task, User } from '@/types';
import { formatDate, getInitials, getRoleColor } from '@/utils/helpers';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [taskStats, setTaskStats] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProject = async () => {
    try {
      const res = await projectService.getById(id as string);
      setProject(res.data.project);
      setTaskStats(res.data.taskStats);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleUpdate = async (data: Record<string, unknown>) => {
    setSaveLoading(true);
    try {
      await projectService.update(id as string, data);
      toast.success('Project updated');
      setEditOpen(false);
      fetchProject();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <AppLayout><Skeleton variant="rounded" height={400} /></AppLayout>;
  if (error) return <AppLayout><Alert severity="error">{error}</Alert></AppLayout>;
  if (!project) return null;

  const isAdmin = user?.role === 'Admin';

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBackOutlined />} onClick={() => router.back()} size="small" variant="outlined">
            Back
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={700}>{project.title}</Typography>
            <Typography variant="body2" color="text.secondary">Project Details</Typography>
          </Box>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<EditOutlined />} onClick={() => setEditOpen(true)}>
            Edit Project
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Overview</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {project.description || 'No description provided.'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box mt={0.5}><StatusChip label={project.status} /></Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Box mt={0.5}><StatusChip label={project.priority} type="priority" /></Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Deadline</Typography>
                  <Typography variant="body2" fontWeight={500} mt={0.5}>{formatDate(project.deadline)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2" fontWeight={500} mt={0.5}>{formatDate(project.createdAt)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Task Summary</Typography>
              {taskStats.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tasks yet</Typography>
              ) : (
                <Box display="flex" gap={2} flexWrap="wrap">
                  {taskStats.map((s) => (
                    <Box key={s._id} sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center', minWidth: 80 }}>
                      <Typography variant="h5" fontWeight={700}>{s.count}</Typography>
                      <Typography variant="caption" color="text.secondary">{s._id}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box mt={2}>
                <Button variant="outlined" size="small" onClick={() => router.push(`/tasks?project=${project._id}`)}>
                  View All Tasks
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Manager</Typography>
              {project.manager ? (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: getRoleColor('Manager'), width: 40, height: 40 }}>
                    {getInitials((project.manager as User).name)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{(project.manager as User).name}</Typography>
                    <Typography variant="caption" color="text.secondary">{(project.manager as User).email}</Typography>
                  </Box>
                </Box>
              ) : <Typography variant="body2" color="text.disabled">Not assigned</Typography>}
            </CardContent>
          </Card>

          {project.members && project.members.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Members ({project.members.length})</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {(project.members as User[]).map((m) => (
                    <Box key={m._id} display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: getRoleColor(m.role), width: 32, height: 32, fontSize: 12 }}>
                        {getInitials(m.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{m.name}</Typography>
                        <Chip label={m.role} size="small" sx={{ height: 16, fontSize: 10 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>Created By</Typography>
              {project.createdBy && (
                <Typography variant="body2">{(project.createdBy as User).name}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {editOpen && (
        <ProjectForm
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
          initialData={project}
          loading={saveLoading}
        />
      )}
    </AppLayout>
  );
}
