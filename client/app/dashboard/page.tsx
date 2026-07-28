'use client';

import { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Skeleton, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
} from '@mui/material';
import {
  FolderOutlined, AssignmentOutlined, PeopleOutlined, TrendingUpOutlined,
} from '@mui/icons-material';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, Project } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await projectService.getStats();
        setStats(res.data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getTaskStatusCount = (status: string) => {
    if (!stats) return 0;
    return stats.tasksByStatus.find((s) => s._id === status)?.count || 0;
  };

  const getProjectStatusCount = (status: string) => {
    if (!stats) return 0;
    return stats.projectsByStatus.find((s) => s._id === status)?.count || 0;
  };

  const totalTasks = stats?.tasksByStatus.reduce((acc, s) => acc + s.count, 0) || 0;
  const completedTasks = getTaskStatusCount('Completed');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      {/* Welcome */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening in your workspace today.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stat Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={user?.role === 'Admin' ? 3 : 4}>
          {loading ? <Skeleton variant="rounded" height={110} /> : (
            <StatCard
              title="Total Projects"
              value={stats?.totalProjects ?? 0}
              icon={<FolderOutlined fontSize="medium" />}
              color="#1976d2"
              subtitle="All time"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={user?.role === 'Admin' ? 3 : 4}>
          {loading ? <Skeleton variant="rounded" height={110} /> : (
            <StatCard
              title={user?.role === 'User' ? 'My Tasks' : 'Total Tasks'}
              value={stats?.totalTasks ?? 0}
              icon={<AssignmentOutlined fontSize="medium" />}
              color="#7c3aed"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={user?.role === 'Admin' ? 3 : 4}>
          {loading ? <Skeleton variant="rounded" height={110} /> : (
            <StatCard
              title="Completed Tasks"
              value={completedTasks}
              icon={<TrendingUpOutlined fontSize="medium" />}
              color="#16a34a"
              subtitle={`${completionRate}% completion rate`}
            />
          )}
        </Grid>
        {user?.role === 'Admin' && (
          <Grid item xs={12} sm={6} md={3}>
            {loading ? <Skeleton variant="rounded" height={110} /> : (
              <StatCard
                title="Total Users"
                value={stats?.totalUsers ?? 0}
                icon={<PeopleOutlined fontSize="medium" />}
                color="#d97706"
              />
            )}
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Task Status Breakdown */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Task Overview</Typography>
              {loading ? (
                <Box>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} mb={2}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rounded" height={8} />
                    </Box>
                  ))}
                </Box>
              ) : (
                ['Todo', 'In Progress', 'Review', 'Completed'].map((status) => {
                  const count = getTaskStatusCount(status);
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  const colors: Record<string, string> = {
                    'Todo': '#6b7280', 'In Progress': '#1976d2', 'Review': '#d97706', 'Completed': '#16a34a',
                  };
                  return (
                    <Box key={status} mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={500}>{status}</Typography>
                        <Typography variant="body2" color="text.secondary">{count} ({pct}%)</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8, borderRadius: 4,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': { bgcolor: colors[status], borderRadius: 4 },
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Project Status */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Project Status</Typography>
              {loading ? (
                <Box>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 1 }} />)}</Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1}>
                  {['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].map((status) => {
                    const count = getProjectStatusCount(status);
                    return (
                      <Box key={status} display="flex" justifyContent="space-between" alignItems="center"
                        sx={{ px: 1.5, py: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <StatusChip label={status} />
                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Projects</Typography>
              {loading ? (
                <Box>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={50} sx={{ mb: 1 }} />)}</Box>
              ) : !stats?.recentProjects?.length ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No projects yet
                </Typography>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {stats.recentProjects.map((p: Project) => (
                    <Box key={p._id} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>{p.title}</Typography>
                        <StatusChip label={p.status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Created {formatDate(p.createdAt)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
}
