'use client';

import { Box, Typography, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ForbiddenPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Box
        sx={{
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: 'error.light', display: 'flex',
          alignItems: 'center', justifyContent: 'center', mb: 3,
        }}
      >
        <LockOutlined sx={{ fontSize: 40, color: 'error.main' }} />
      </Box>
      <Typography variant="h2" fontWeight={700} color="error.main">403</Typography>
      <Typography variant="h5" fontWeight={600} mb={1}>Access Denied</Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" mb={4} maxWidth={400}>
        You don't have permission to access this page. Your current role ({user?.role}) does not allow this action.
      </Typography>
      <Button variant="contained" onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
