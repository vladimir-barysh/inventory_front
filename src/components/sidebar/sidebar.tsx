import React from 'react';
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
  Input,
  Output,
  Warehouse,
  People,
} from '@mui/icons-material';

// Типы для меню
interface MenuItem {
  text: string;
  icon: React.ReactElement;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Левое боковое меню
const menuSections: MenuSection[] = [
  {
    title: 'Документы',
    items: [
      { text: 'Входные', icon: <Input /> },
      { text: 'Исходящие', icon: <Output /> },
    ]
  },
  {
    title: 'Справочники',
    items: [
      { text: 'Товары', icon: <Inventory /> },
      { text: 'Поставщики', icon: <LocalShipping /> },
      { text: 'Зоны хранения', icon: <Warehouse /> },
      { text: 'Сотрудники', icon: <People /> },
    ]
  },
  {
    title: 'Аналитика',
    items: [
      { text: 'Отчёты', icon: <Assessment /> },
    ]
  }
];

interface SidebarProps {
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ width = 280 }) => {
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
              {section.items.map((item) => (
                <ListItemButton 
                  key={item.text}
                  sx={{
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#1976d2' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        color: '#333',
                      }
                    }}
                  />
                </ListItemButton>
              ))}
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