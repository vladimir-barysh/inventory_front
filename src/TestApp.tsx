import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from './pages/authPage/authContext';

const TestApp = () => {
  const { user, logout } = useAuth();
  
  console.log('TestApp: user =', user);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">
        Тестовое приложение
      </Typography>
      <Typography>
        Пользователь: {user?.name || user?.username}
      </Typography>
      <Button 
        variant="contained" 
        onClick={logout}
        sx={{ mt: 2 }}
      >
        Выйти
      </Button>
    </Box>
  );
};

export default TestApp;