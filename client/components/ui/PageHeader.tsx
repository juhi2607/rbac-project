import { Box, Typography, Button } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
      </Box>
      {action && (
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={action.onClick}
          sx={{ background: 'linear-gradient(135deg, #1976d2, #7c3aed)', whiteSpace: 'nowrap' }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
