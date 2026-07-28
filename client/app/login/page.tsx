'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Divider, Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const TEST_CREDENTIALS = [
  { role: 'Admin', email: 'admin@protrack.com', password: 'Admin123' },
  { role: 'Manager', email: 'manager@protrack.com', password: 'Manager123' },
  { role: 'User', email: 'user@protrack.com', password: 'User1234' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #7c3aed 100%)',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              <LockOutlined sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>ProTrack</Typography>
            <Typography variant="body2" color="text.secondary">Project Management System</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              sx={{ mb: 2 }}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              sx={{ mb: 3 }}
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 2, background: 'linear-gradient(135deg, #1976d2, #7c3aed)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">Test Credentials</Typography>
          </Divider>

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            {TEST_CREDENTIALS.map((cred) => (
              <Chip
                key={cred.role}
                label={cred.role}
                onClick={() => fillCredentials(cred.email, cred.password)}
                size="small"
                variant="outlined"
                clickable
                color={cred.role === 'Admin' ? 'error' : cred.role === 'Manager' ? 'secondary' : 'primary'}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
            Click a role to auto-fill credentials
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
