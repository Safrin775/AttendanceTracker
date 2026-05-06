import React, { useState, useEffect } from 'react';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Button,Chip,Typography,Box,CircularProgress,Alert} from '@mui/material';
import api from '../../services/api';

function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('admin/pending-requests/');
      setRequests(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`admin/approve/${id}/`);
      showMessage('success', 'Request approved');
      fetchRequests();
    } catch (error) {
      showMessage('error', 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`admin/reject/${id}/`);
      showMessage('success', 'Request rejected');
      fetchRequests();
    } catch (error) {
      showMessage('error', 'Failed to reject');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Pending Approvals ({requests.length})
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><b>Employee</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Leave Type</b></TableCell>
                <TableCell><b>From Date</b></TableCell>
                <TableCell><b>To Date</b></TableCell>
                <TableCell><b>Reason</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No pending requests</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.user_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={req.request_type}
                        color={req.request_type === 'Leave' ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{req.leave_type || '-'}</TableCell>
                    <TableCell>{req.from_date}</TableCell>
                    <TableCell>{req.to_date}</TableCell>
                    <TableCell>{req.reason || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(req.id)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
export default PendingRequests;