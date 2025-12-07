import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Header } from './components/header/header.tsx';
import { Sidebar } from './components/sidebar/sidebar.tsx';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Header />
        <Sidebar />
        
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