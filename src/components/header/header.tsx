import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  ExitToApp,
  Email,
} from '@mui/icons-material';

import {useAuth} from '../../pages/authPage/authContext';
import AdminOnly from '../AdminOnly';
import { NewUserDialog } from '../newuser-dialog/newUser'

interface HeaderProps {
  companyName?: string;
  companyAddress?: string;
  onLogout?: () => void;
}

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onClose,
  onLogout,
}) => {
  const { user } = useAuth();

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Профиль пользователя</DialogTitle>
      <DialogContent>
        <List sx={{ pt: 0 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AccountCircle />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={user?.name || 'Пользователь'} 
              secondary={`Логин: ${user?.login}`}
            />
          </ListItem>

          {user?.role_id && (
            <ListItem>
              <ListItemText 
                primary="Роль" 
                secondary={user.role_id === 1 ? 'Администратор' : 'Пользователь'} 
              />
            </ListItem>
          )}

        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleLogout}
          variant="contained"
          color="error"
          fullWidth
          startIcon={<ExitToApp />}
        >
          Выйти из аккаунта
        </Button>

        <Button 
          onClick={onClose} 
          variant="outlined"
          fullWidth
          sx={{ mr: 1 }}
        >
          Закрыть окно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Header: React.FC<HeaderProps> = ({ 
  companyName = 'ООО «Склад»',
  companyAddress = 'Проспект Ленина, 46',}) => {
  const { user, logout } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    logout(); // Вызываем logout из контекста
    // Можно добавить дополнительную логику, если нужно
    console.log('Пользователь вышел из системы');
  };

  const handleNewUser = () => {
    setNewUserDialogOpen(true);
  }
  const handleNewUserClose = () => {
    setNewUserDialogOpen(false);
  }

  const displayName = user?.name || 
                    (user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.login || 'Пользователь');

  return (
    <>
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

            <AdminOnly>
              <Button 
                variant='contained'
                color='success'
                fullWidth
                sx={{ mr: 1 }}
                onClick={handleNewUser}
              >
                Создать нового пользователя
              </Button>
            </AdminOnly>

            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                bgcolor: 'rgb(255, 255, 255)', 
                height: 28, 
                mx: 1 
              }} 
            />
            
            <IconButton 
              color="inherit" 
              size="small" 
              sx={{ opacity: 0.9 }}
              onClick={handleProfileClick}
              aria-label="Профиль пользователя"
            >
              <AccountCircle />
            </IconButton>
            
            <Typography variant="body2" sx={{ ml: 1, fontSize: '0.9rem' }}>
              {displayName}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <ProfileDialog
        open={profileDialogOpen}
        onClose={handleProfileClose}
        onLogout={handleLogout}
      />

      <NewUserDialog
        open={newUserDialogOpen}
        onClose={handleNewUserClose}
        
      />
    </>
  );
};