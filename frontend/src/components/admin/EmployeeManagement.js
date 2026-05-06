import React, { useState, useEffect } from 'react';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Button,Dialog,DialogTitle,DialogContent,DialogActions,TextField,IconButton,Typography,Box,Chip,CircularProgress,Alert} from '@mui/material';
import {Edit as EditIcon,Delete as DeleteIcon,LockReset as ResetIcon,Add as AddIcon} from '@mui/icons-material';
import api from '../../services/api';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('admin/users/');
      setEmployees(response.data);
    } catch (error) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      await api.post('admin/users/add/', formData);
      setSuccess('Employee added successfully');
      setOpenAddDialog(false);
      resetForm();
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add employee');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditEmployee = async () => {
    try {
      await api.put(`admin/users/edit/${selectedEmployee.id}/`, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      });
      setSuccess('Employee updated successfully');
      setOpenEditDialog(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update employee');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteEmployee = async (id, username) => {
    if (window.confirm(`Are you sure you want to deactivate ${username}?`)) {
      try {
        await api.delete(`admin/users/delete/${id}/`);
        setSuccess('Employee deactivated successfully');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to deactivate employee');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`admin/users/reset-password/${selectedEmployee.id}/`, {
        new_password: resetPassword
      });
      setSuccess('Password reset successfully');
      setOpenResetDialog(false);
      setResetPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to reset password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      email: employee.email,
      first_name: employee.first_name || '',
      last_name: employee.last_name || ''
    });
    setOpenEditDialog(true);
  };

  const openReset = (employee) => {
    setSelectedEmployee(employee);
    setOpenResetDialog(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: ''
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Employee Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Employee
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Full Name</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No employees found</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>{emp.username}</TableCell>
                  <TableCell>{`${emp.first_name} ${emp.last_name}`.trim() || '-'}</TableCell>
                  <TableCell>{emp.email || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.is_active ? 'Active' : 'Inactive'}
                      color={emp.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => openEdit(emp)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="warning" onClick={() => openReset(emp)}>
                      <ResetIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteEmployee(emp.id, emp.username)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditEmployee} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password for {selectedEmployee?.username}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="warning">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
export default EmployeeManagement;