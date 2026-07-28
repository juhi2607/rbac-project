'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Grid, Card, CardContent, Typography, Box, TextField,
  Button, Avatar, Chip, Alert, Divider,
} from '@mui/material';
import { PersonOutlined, LockOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { getInitials, getRoleColor, formatDateTime } from '@/utils/helpers';

interface ProfileFormData {
  name: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({ defaultValues: { name: user?.name || '' } });

  const {
    control: passControl,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    watch,
    formState: { errors: passErrors },
  } = useForm<PasswordFormData>({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await authService.updateProfile({ name: data.name });
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      setProfileError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await authService.updateProfile({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPass();
    } catch (err: unknown) {
      setPasswordError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 80, height: 80, mx: 'auto', mb: 2,
                  bgcolor: getRoleColor(user.role), fontSize: 28, fontWeight: 700,
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{user.email}</Typography>
              <Chip
                label={user.role}
                sx={{ bgcolor: getRoleColor(user.role), color: 'white', fontWeight: 600 }}
              />
              <Divider sx={{ my: 2 }} />
              <Box textAlign="left">
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small"
                    color={user.isActive ? 'success' : 'error'} />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="caption">{formatDateTime(user.lastLogin)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Edit Profile */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonOutlined color="primary" />
                <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
              </Box>

              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="name"
                      control={profileControl}
                      rules={{ required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } }}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Full Name" error={!!profileErrors.name}
                          helperText={profileErrors.name?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address" value={user.email} disabled />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Role" value={user.role} disabled />
                  </Grid>
                </Grid>
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LockOutlined color="primary" />
                <Typography variant="h6" fontWeight={600}>Change Password</Typography>
              </Box>

              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

              <form onSubmit={handlePassSubmit(onPasswordSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="currentPassword"
                      control={passControl}
                      rules={{ required: 'Current password is required' }}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Current Password" type="password"
                          error={!!passErrors.currentPassword} helperText={passErrors.currentPassword?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="newPassword"
                      control={passControl}
                      rules={{ required: 'New password is required', minLength: { value: 6, message: 'Min 6 chars' }, pattern: { value: /\d/, message: 'Must contain a number' } }}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="New Password" type="password"
                          error={!!passErrors.newPassword} helperText={passErrors.newPassword?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="confirmPassword"
                      control={passControl}
                      rules={{
                        required: 'Please confirm your password',
                        validate: (v) => v === newPassword || 'Passwords do not match',
                      }}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Confirm New Password" type="password"
                          error={!!passErrors.confirmPassword} helperText={passErrors.confirmPassword?.message} />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" color="warning" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
}
