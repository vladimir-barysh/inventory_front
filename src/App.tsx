import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Theme } from '@mui/material';

// MUI компоненты
import { 
  CssBaseline, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  AppBar, 
  Typography, 
  Box, 
  Divider, 
  Badge, 
  IconButton 
} from '@mui/material';

// MUI иконки
import { 
  Inventory,
  LocalShipping,
  Assessment,
  Input,
  Output,
  Warehouse,
  People,
  Notifications,
  AccountCircle,
  Settings,
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

// Тема (синий акцент)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f0f0f0',
    },
  },
});

// Левое боковое меню
const menuSections: MenuSection[] = [
  {
    title: 'Документы',
    items: [
      { text: 'Входные', icon: <Input/> },
      { text: 'Исходящие', icon: <Output/> },
    ]
  },
  {
    title: 'Справочники',
    items: [
      { text: 'Товары', icon: <Inventory/> },
      { text: 'Поставщики', icon: <LocalShipping/> },
      { text: 'Зоны хранения', icon: <Warehouse/> },
      { text: 'Сотрудники', icon: <People/> },
    ]
  },
  {
    title: 'Аналитика',
    items: [
      { text: 'Отчёты', icon: <Assessment/> },
    ]
  }
];

function App(){
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
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
                  ООО «Склад»
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ fontSize: '0.75rem', opacity: 0.7 }}
                >
                  Проспект Ленина, 46
                </Typography>
              </Box>
            </Box>

            {/* Правая часть - иконка пользователя */}
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
                <AccountCircle/>
              </IconButton>
              
              <Typography variant="body2" sx={{ ml: 1, fontSize: '0.9rem' }}>
                Иванов И.И.
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              width: 280, 
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
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            mt: 8, // Отступ для AppBar
            backgroundColor: '#f0f0f0',
            minHeight: '100vh',
          }}
        >
          {/* Основной контент */}
          <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              Добро пожаловать в систему управления складом "СкладПро"
            </Typography>
            <Typography paragraph color="text.secondary">
              ООО «Склад» Проспект Ленина, 46
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;