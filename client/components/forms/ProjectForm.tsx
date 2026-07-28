'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, Box,
} from '@mui/material';
import { userService } from '@/services/userService';
import { Project, User } from '@/types';

interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  manager: string;
  deadline: string;
}

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Partial<Project>;
  loading?: boolean;
}

const STATUS_OPTIONS = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function ProjectForm({ open, onClose, onSubmit, initialData, loading }: ProjectFormProps) {
  const [managers, setManagers] = useState<User[]>([]);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      manager: '',
      deadline: '',
    },
  });

  useEffect(() => {
    if (open) {
      userService.getManagers().then((res) => setManagers(res.data.managers)).catch(() => {});
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'Planning',
        priority: initialData?.priority || 'Medium',
        manager: (initialData?.manager as User)?._id || '',
        deadline: initialData?.deadline ? initialData.deadline.substring(0, 10) : '',
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Project Title *" error={!!errors.title} helperText={errors.title?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Description" multiline rows={3} />
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
            <Grid item xs={6}>
              <Controller
                name="manager"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Assign Manager">
                    <MenuItem value="">None</MenuItem>
                    {managers.map((m) => <MenuItem key={m._id} value={m._id}>{m.name} ({m.role})</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
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
