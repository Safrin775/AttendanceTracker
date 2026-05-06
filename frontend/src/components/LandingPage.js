import React from 'react';
import { useNavigate } from 'react-router-dom';
import {Container,Grid,Card,CardContent,CardActions,Typography,Button,Box,Paper} from '@mui/material';
import { People, AdminPanelSettings } from '@mui/icons-material';

function LandingPage() {
  const navigate = useNavigate();

  const handleEmployeeLogin = () => {
    navigate('/login', { state: { role: 'employee' } });
  };

  const handleAdminLogin = () => {
    navigate('/login', { state: { role: 'admin' } });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper elevation={0} sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Attendance Tracker
        </Typography>
        <Typography variant="h5" color="textSecondary">
          Choose your role to continue
        </Typography>
      </Paper>

      <Grid container spacing={4} justifyContent="center">
        {/* Employee Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 2
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: 80, mb: 2 }}>
                <People sx={{ fontSize: 80, color: '#1976d2' }} />
              </Box>
              <Typography variant="h4" component="h2" gutterBottom>
                Employee
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleEmployeeLogin}
                sx={{ px: 4 }}
              >
                Login
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Admin Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 2
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: 80, mb: 2 }}>
                <AdminPanelSettings sx={{ fontSize: 80, color: '#dc004e' }} />
              </Box>
              <Typography variant="h4" component="h2" gutterBottom>
                Admin
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                onClick={handleAdminLogin}
                sx={{ px: 4 }}
              >
                Login
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" color="textSecondary">
          Don't have an account?{' '}
          <Button 
            color="primary" 
            onClick={() => navigate('/register')}
            sx={{ textTransform: 'none' }}
          >
            Register here
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}

export default LandingPage;