import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Header, Sidebar } from './components';
import { DocumentsPage, SuppliersPage, StoragePage, EmployeesPage, ProductsPage } from './pages';
import { theme } from './theme';
import { AuthProvider, useAuth } from '../src/pages/authPage/authContext';
import LoginModal from '../src/pages/authPage/authPage';
import ProtectedRoute from '../src/pages/authPage/ProtectedRoute';
import TestApp from 'TestApp';

// Компонент для основной части приложения (после авторизации)
const MainApp = () => {
  console.log('=== MainApp рендерится ===');
  console.log('Должны видеть Header и Sidebar');
  try {
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
                backgroundColor: theme.palette.background.default,
                minHeight: '90vh',
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
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/storage" element={<StoragePage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/products" element={<ProductsPage />} /> 
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('Ошибка в MainApp:', error);
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">Ошибка в приложении</Typography>
      </Box>
    );
  }
};

// Компонент для страницы авторизации
const AuthPage = () => {
  const { login } = useAuth();
  const [open, setOpen] = React.useState(true);

  // Автоматически открываем модальное окно при загрузке страницы авторизации
  React.useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
    }}>
      <LoginModal 
        open={open} 
        onClose={() => {}} // Не даем закрыть окно - только через авторизацию
      />
    </Box>
  );
};

// Компонент-обертка, который решает что показывать
const AppContent = () => {
  const { user, loading } = useAuth();
  
  console.log('=== AppContent DEBUG ===');
  console.log('loading:', loading);
  console.log('user:', user);
  console.log('pathname:', window.location.pathname);
  console.log('=======================');
  
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}>
        <Typography sx={{ ml: 2 }}>Загрузка...</Typography>
      </Box>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={
          user ? (
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="*" element={
          user ? (
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

      </Routes>
    </Router>
  );
};

// Главный компонент приложения
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;