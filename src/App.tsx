import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Header } from './components/header/header.tsx';
import { Sidebar } from './components/sidebar/sidebar.tsx';
import { IncomingDocumentsPage } from './pages/documents/documents.tsx';

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

// Тип для текущей страницы
type Page = 'dashboard' | 'incoming' | 'outgoing' | 'products' | 'suppliers' | 'storage' | 'employees' | 'reports';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Функция для изменения страницы (будет передана в Sidebar)
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
  };

  // Рендеринг контента в зависимости от текущей страницы
  const renderContent = () => {
    switch (currentPage) {
      case 'incoming':
        return <IncomingDocumentsPage />;
      case 'dashboard':
      default:
        return (
          <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
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
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Header />
        <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />
        
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
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;