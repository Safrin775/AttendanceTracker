import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';

function WFHRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from_date: new Date(),
    to_date: new Date(),
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const data = {
      ...formData,
      request_type: 'WFH',
      from_date: formData.from_date.toISOString().split('T')[0],
      to_date: formData.to_date.toISOString().split('T')[0],
    };

    try {
      await requestsAPI.createRequest(data);
      setSuccess('WFH request submitted successfully');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Apply for Work From Home
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Submit your WFH request for approval
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {success}
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Reason (Optional)"
                multiline
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                margin="normal"
                disabled={loading}
              />

              <DatePicker
                label="From Date"
                value={formData.from_date}
                onChange={(date) => setFormData({...formData, from_date: date})}
                disabled={loading}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true,
                  }
                }}
              />

              <DatePicker
                label="To Date"
                value={formData.to_date}
                onChange={(date) => setFormData({...formData, to_date: date})}
                disabled={loading}
                minDate={formData.from_date}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true,
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Request'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                Back to Dashboard
              </Button>
            </form>
          </LocalizationProvider>
        </Paper>
      </Box>
    </Container>
  );
}

export default WFHRequest;