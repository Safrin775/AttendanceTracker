import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { 
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  EventNote,
  HomeWork 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const attendanceRes = await attendanceAPI.getMyAttendance();
      setRecords(attendanceRes.data);
      
      
      try {
        const todayRes = await attendanceAPI.getTodayAttendance();
        setTodayAttendance(todayRes.data);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('No attendance record for today');
          setTodayAttendance(null);
        } else {
          console.error('Error fetching today\'s attendance:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      showMessage('error', 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleMarkAttendance = async () => {
    try {
      const response = await attendanceAPI.markAttendance();
      showMessage('success', response.data.message);
      fetchData(); 
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Present: 'success',
      Leave: 'warning',
      WFH: 'info',
      Absent: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions - Updated Grid syntax */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={todayAttendance?.in_time ? <CheckOutIcon /> : <CheckInIcon />}
              onClick={handleMarkAttendance}
              disabled={todayAttendance?.out_time}
            >
              {todayAttendance?.in_time ? 'Check Out' : 'Check In'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<EventNote />}
              onClick={() => navigate('/leave')}
            >
              Apply Leave
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<HomeWork />}
              onClick={() => navigate('/wfh')}
            >
              Apply WFH
            </Button>
          </Paper>
        </Grid>

        {/* Today's Status Card - Updated Grid syntax */}
        {todayAttendance && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Today's Attendance
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography color="textSecondary" variant="body2">
                    Status
                  </Typography>
                  <Chip 
                    label={todayAttendance.status} 
                    color={getStatusColor(todayAttendance.status)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography color="textSecondary" variant="body2">
                    Check In
                  </Typography>
                  <Typography variant="h6">
                    {todayAttendance.in_time || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography color="textSecondary" variant="body2">
                    Check Out
                  </Typography>
                  <Typography variant="h6">
                    {todayAttendance.out_time || '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Attendance History Table - Updated Grid syntax */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance History
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>In Time</TableCell>
                    <TableCell>Out Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.in_time || '—'}</TableCell>
                        <TableCell>{record.out_time || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;