// components/AdminOnly.tsx
import React from 'react';
import { useAuth } from '../pages/authPage/authContext';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { user } = useAuth();
  
  // Проверяем, является ли пользователь администратором
  const isAdmin = user?.role_id === 1; // или ваш ID администратора
  
  if (!isAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default AdminOnly;