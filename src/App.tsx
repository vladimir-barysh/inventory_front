import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Header, Sidebar } from './components';
import { IncomingDocumentsPage, SuppliersPage} from './pages';
import { theme } from './theme'; // Импорт темы

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Header />
          <Sidebar />
          
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3, 
              mt: 8, // Отступ для AppBar
              backgroundColor: theme.palette.background.default,
              minHeight: '100vh',
            }}
          >
            <Routes>
              <Route path="/" element={
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1]
                }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                    Добро пожаловать в систему управления складом "СкладПро"
                  </Typography>
                  <Typography paragraph color="text.secondary">
                    ООО «Склад» Проспект Ленина, 46
                  </Typography>
                  <Typography paragraph>
                    Выберите раздел в боковом меню для работы с документами и справочниками
                  </Typography>
                </Box>
              } />
              <Route path="/documents" element={<IncomingDocumentsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;