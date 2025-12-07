import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import {
  Inventory,
  LocalShipping,
  Assessment,
  Warehouse,
  People,
  Folder
} from '@mui/icons-material';

// Типы для меню
interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string; // Изменяем page на path
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  width?: number;
}

// Левое боковое меню
const menuSections: MenuSection[] = [
  {
    title: 'Документы',
    items: [
      { text: 'Документы', icon: <Folder />, path: '/documents' },
    ]
  },
  {
    title: 'Справочники',
    items: [
      { text: 'Товары', icon: <Inventory />, path: '/products' },
      { text: 'Поставщики', icon: <LocalShipping />, path: '/suppliers' },
      { text: 'Зоны хранения', icon: <Warehouse />, path: '/storage' },
      { text: 'Сотрудники', icon: <People />, path: '/employees' },
    ]
  },
  {
    title: 'Аналитика',
    items: [
      { text: 'Отчёты', icon: <Assessment />, path: '/reports' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  width = 220,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: width, 
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
          top: 64, // Учитываем высоту AppBar
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        {menuSections.map((section, index) => (
          <React.Fragment key={section.title}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {section.title}
              </Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {section.items.map((item) => {
                const isSelected = location.pathname === item.path;
                return (
                  <ListItemButton 
                    key={item.text}
                    onClick={() => handleItemClick(item.path)}
                    selected={isSelected}
                    sx={{
                      py: 1.5,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        borderRight: '3px solid #1976d2',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.16)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40, 
                      color: isSelected ? '#1976d2' : '#1976d2' 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.95rem',
                          color: isSelected ? '#1976d2' : '#333',
                          fontWeight: isSelected ? 600 : 400,
                        }
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
            {index < menuSections.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Drawer>
  );
};