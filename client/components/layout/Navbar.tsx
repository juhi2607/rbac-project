'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, IconButton, Typography, Avatar, Box,
  Menu, MenuItem, ListItemIcon, Divider, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, PersonOutlined, LogoutOutlined,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR_WIDTH } from './Sidebar';
import { getInitials, getRoleColor } from '@/utils/helpers';
import { toast } from 'react-toastify';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    router.push('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          ProTrack
        </Typography>

        {user && (
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 36, height: 36,
                  bgcolor: getRoleColor(user.role),
                  fontSize: 14, fontWeight: 700,
                }}
              >
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ elevation: 2, sx: { mt: 1, minWidth: 180 } }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
            </Box>
          )}
          <Divider />
          <MenuItem onClick={() => { router.push('/profile'); setAnchorEl(null); }}>
            <ListItemIcon><PersonOutlined fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutOutlined fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
