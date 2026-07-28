'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem,
} from '@mui/material';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { Task, Project, User } from '@/types';

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  project: string;
  assignedTo: string;
  deadline: string;
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<Task>;
  defaultProjectId?: string;
  loading?: boolean;
}

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Review', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function TaskForm({ open, onClose, onSubmit, initialData, defaultProjectId, loading }: TaskFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: { title: '', description: '', status: 'Todo', priority: 'Medium', project: defaultProjectId || '', assignedTo: '', deadline: '' },
  });

  useEffect(() => {
    if (open) {
      projectService.getAll({ limit: 100 }).then((res) => setProjects(res.data.projects)).catch(() => {});
      userService.getAll({ limit: 100, role: 'User' }).then((res) => setUsers(res.data.users)).catch(() => {
        // fallback: get managers too
        userService.getManagers().then((res2) => setUsers(res2.data.managers)).catch(() => {});
      });
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'Todo',
        priority: initialData?.priority || 'Medium',
        project: (initialData?.project as Project)?._id || defaultProjectId || '',
        assignedTo: (initialData?.assignedTo as User)?._id || '',
        deadline: initialData?.deadline ? initialData.deadline.substring(0, 10) : '',
      });
    }
  }, [open, initialData, defaultProjectId, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{initialData ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Task Title *" error={!!errors.title} helperText={errors.title?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Description" multiline rows={3} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="project"
                control={control}
                rules={{ required: 'Project is required' }}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Project *" error={!!errors.project} helperText={errors.project?.message}>
                    {projects.map((p) => <MenuItem key={p._id} value={p._id}>{p.title}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Assign To">
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Status">
                    {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Priority">
                    {PRIORITY_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Deadline" type="date" InputLabelProps={{ shrink: true }} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
