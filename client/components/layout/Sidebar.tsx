'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Avatar, Divider, Chip,
} from '@mui/material';
import {
  DashboardOutlined, FolderOutlined, AssignmentOutlined,
  PeopleOutlined, PersonOutlined, HistoryOutlined,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { getInitials, getRoleColor } from '@/utils/helpers';

export const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardOutlined />, roles: ['Admin', 'Manager', 'User'] },
  { label: 'Projects', href: '/projects', icon: <FolderOutlined />, roles: ['Admin', 'Manager', 'User'] },
  { label: 'Tasks', href: '/tasks', icon: <AssignmentOutlined />, roles: ['Admin', 'Manager', 'User'] },
  { label: 'Users', href: '/users', icon: <PeopleOutlined />, roles: ['Admin'] },
  { label: 'Audit Logs', href: '/audit-logs', icon: <HistoryOutlined />, roles: ['Admin'] },
  { label: 'Profile', href: '/profile', icon: <PersonOutlined />, roles: ['Admin', 'Manager', 'User'] },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #1976d2, #7c3aed)' }}>
        <Typography variant="h6" color="white" fontWeight={700}>ProTrack</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Project Management
        </Typography>
      </Box>

      {/* User info */}
      {user && (
        <Box sx={{ px: 2, py: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(user.role), fontSize: 14, fontWeight: 700 }}>
              {getInitials(user.name)}
            </Avatar>
            <Box minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>{user.name}</Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{ height: 18, fontSize: 10, bgcolor: getRoleColor(user.role), color: 'white', mt: 0.25 }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => { router.push(item.href); onClose(); }}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.disabled">© 2024 ProTrack</Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
