'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Box, Chip, Pagination, TextField, MenuItem, Avatar,
} from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { auditService } from '@/services/auditService';
import { AuditLog, Pagination as PaginationType, User } from '@/types';
import { formatDateTime, getInitials, getRoleColor } from '@/utils/helpers';
import { toast } from 'react-toastify';

const ENTITY_OPTIONS = ['', 'Auth', 'User', 'Project', 'Task'];

const entityColor: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Auth: 'info',
  User: 'secondary',
  Project: 'primary',
  Task: 'success',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditService.getAll({ page, limit: 20, entity: entityFilter || undefined });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [entityFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <AppLayout allowedRoles={['Admin']}>
      <PageHeader title="Audit Logs" subtitle={`${pagination.total} total entries`} />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField select size="small" label="Entity Type" value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)} sx={{ minWidth: 160 }}>
            {ENTITY_OPTIONS.map((e) => <MenuItem key={e} value={e}>{e || 'All Entities'}</MenuItem>)}
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Performed By</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : !logs.length ? (
                <TableRow>
                  <TableCell colSpan={5}><EmptyState message="No audit logs found" /></TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>
                      <Typography variant="body2">{log.action}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.entity}
                        size="small"
                        color={entityColor[log.entity] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {log.performedBy ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: getRoleColor((log.performedBy as User).role) }}>
                            {getInitials((log.performedBy as User).name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{(log.performedBy as User).name}</Typography>
                            <Typography variant="caption" color="text.secondary">{(log.performedBy as User).role}</Typography>
                          </Box>
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{log.ipAddress || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDateTime(log.createdAt)}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination count={pagination.totalPages} page={pagination.page}
              onChange={(_, p) => fetchLogs(p)} color="primary" />
          </Box>
        )}
      </Card>
    </AppLayout>
  );
}
