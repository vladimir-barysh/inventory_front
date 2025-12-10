import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import LoginModal from './authPage';
import { Box, CircularProgress } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = React.useState(false);

  console.log('=== ProtectedRoute DEBUG ===');
  console.log('loading:', loading);
  console.log('user:', user);
  console.log('children type:', typeof children);
  console.log('=======================');

  React.useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [user, loading]);

  if (loading) {
    console.log('ProtectedRoute: Загрузка...');
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: Нет пользователя, редирект на /login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Рендерим children');
  return <>{children}</>;
};

export default ProtectedRoute;