import { Chip } from '@mui/material';
import { getStatusColor, getPriorityColor } from '@/utils/helpers';

interface StatusChipProps {
  label: string;
  type?: 'status' | 'priority';
  size?: 'small' | 'medium';
}

export default function StatusChip({ label, type = 'status', size = 'small' }: StatusChipProps) {
  const color = type === 'priority' ? getPriorityColor(label) : getStatusColor(label);
  return <Chip label={label} color={color} size={size} variant="filled" />;
}
