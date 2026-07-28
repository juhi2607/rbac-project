'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, FormControlLabel, Switch,
} from '@mui/material';
import { User } from '@/types';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<User>;
  loading?: boolean;
}

const ROLE_OPTIONS = ['Admin', 'Manager', 'User'];

export default function UserForm({ open, onClose, onSubmit, initialData, loading }: UserFormProps) {
  const isEdit = !!initialData;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    defaultValues: { name: '', email: '', password: '', role: 'User', isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '',
        role: initialData?.role || 'User',
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{isEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Full Name *" error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Email *" type="email" error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            {!isEdit && (
              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                    pattern: { value: /\d/, message: 'Must contain a number' },
                  }}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Password *" type="password" error={!!errors.password} helperText={errors.password?.message} />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={isEdit ? 8 : 12}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Role">
                    {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={4}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Active"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
