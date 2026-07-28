import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined, AddOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ message = 'No records found', action }: EmptyStateProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={6} color="text.secondary">
      <InboxOutlined sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
      <Typography variant="body1" fontWeight={500}>{message}</Typography>
      {action && (
        <Button
          variant="outlined"
          startIcon={<AddOutlined />}
          onClick={action.onClick}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
