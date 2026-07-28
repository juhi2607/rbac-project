'use client';

import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import { Role } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function AppLayout({ children, allowedRoles }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
