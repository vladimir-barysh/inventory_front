import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
} from '@mui/icons-material';

interface HeaderProps {
  companyName?: string;
  companyAddress?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  companyName = 'ООО «Склад»',
  companyAddress = 'Проспект Ленина, 46',
  userName = 'Иванов И.И.'
}) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1976d2',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Левая часть - название и информация о складе */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            СкладПро
          </Typography>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              bgcolor: 'rgb(255, 255, 255)', 
              height: 28, 
              my: 'auto' 
            }} 
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="body2" 
              sx={{ fontSize: '0.9rem', opacity: 0.9 }}
            >
              {companyName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ fontSize: '0.75rem', opacity: 0.7 }}
            >
              {companyAddress}
            </Typography>
          </Box>
        </Box>

        {/* Правая часть - иконки пользователя */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="small" sx={{ opacity: 0.9 }}>
            <Settings fontSize="small" />
          </IconButton>
          
          <IconButton color="inherit" size="small" sx={{ opacity: 0.9 }}>
            <Badge badgeContent={3} color="error">
              <Notifications fontSize="small" />
            </Badge>
          </IconButton>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              bgcolor: 'rgb(255, 255, 255)', 
              height: 28, 
              mx: 1 
            }} 
          />
          
          <IconButton color="inherit" size="small" sx={{ opacity: 0.9 }}>
            <AccountCircle />
          </IconButton>
          
          <Typography variant="body2" sx={{ ml: 1, fontSize: '0.9rem' }}>
            {userName}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};