import React, { useState, useEffect } from 'react';
import {Grid,Paper,Typography,Card,Box,CircularProgress} from '@mui/material';
import {People,CheckCircle,Cancel,EventNote} from '@mui/icons-material';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('admin/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <People sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h3">{stats?.total_users || 0}</Typography>
            <Typography color="textSecondary">Total Employees</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9' }}>
            <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
            <Typography variant="h3">{stats?.present_today || 0}</Typography>
            <Typography>Present Today</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee' }}>
            <Cancel sx={{ fontSize: 40, color: '#f44336' }} />
            <Typography variant="h3">{stats?.absent_today || 0}</Typography>
            <Typography>Absent Today</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <EventNote sx={{ fontSize: 40, color: '#ff9800' }} />
            <Typography variant="h3">{stats?.leave_today || 0}</Typography>
            <Typography>On Leave</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Welcome to Admin Dashboard
        </Typography>
        
      </Paper>
    </>
  );
}
export default AdminDashboard;