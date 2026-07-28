'use client';

import { Box, Typography, Button } from '@mui/material';
import { SearchOffOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

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
          bgcolor: 'grey.200', display: 'flex',
          alignItems: 'center', justifyContent: 'center', mb: 3,
        }}
      >
        <SearchOffOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h2" fontWeight={700} color="text.secondary">404</Typography>
      <Typography variant="h5" fontWeight={600} mb={1}>Page Not Found</Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" mb={4} maxWidth={400}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
