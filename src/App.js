import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Тема в стиле твоих скриншотов (синий акцент)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Синий как на скриншотах
    },
    background: {
      default: '#f0f0f0',
    },
  },
});

function App() {
  const [selectedSection, setSelectedSection] = useState('invoices'); // Текущая секция

  // Фейковые данные для таблиц
  const invoicesData = [
    { date: '27.03.18', number: '№bn1-004586', description: 'Общество с ограниченной ответственностью "P..."', sum: '4 693,16', tax: '-', total: '-' },
    { date: '28.03.18', number: '№NV000006910', description: 'Общество с ограниченной ответственностью "P..."', sum: '2 580,84', tax: '-', total: '-' },
    { date: '28.03.18', number: '№KSOor-004952', description: 'Общество с ограниченной ответственностью "Компания..."', sum: '15 117,90', tax: '3 012,10', total: '18 130,00' },
    { date: '28.03.18', number: '№NPF1010279', description: 'Общество с ограниченной ответственностью "Пекта"', sum: '5 660,67', tax: '1 176,33', total: '7 437,00' },
  ];

  const catalogData = [
    { article: 'A11', name: 'Вода Риал Флок кедровая 0.5л с/6', strength: '40%', volume: '0.25', remains: '1 021 шт', price: '14.90 ₽' },
    { article: 'OOO', name: 'Винодельный завод "Абрау-1882"', strength: '40%', volume: '1.0', remains: '25 шт', price: '20.00 ₽' },
    // Добавь больше по аналогии
  ];

  const cartData = [
    { name: 'Вода САМБОРСКАЯ ТАЯ 1.5л ПЭТ', quantity: '10', price: '35.00 ₽', sum: '350.00 ₽' },
    { name: 'Вода POLARIS/ПОЛАРИС 5.0 л пет', quantity: '10', price: '50.00 ₽', sum: '500.00 ₽' },
    // Добавь больше
  ];

  // Компонент для таблицы накладных
  const InvoicesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>13 документов</TableCell>
            <TableCell>Сумма закупа, ₽</TableCell>
            <TableCell>Наценка, ₽</TableCell>
            <TableCell>Сумма розн., ₽</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoicesData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.number} {row.description}</TableCell>
              <TableCell>{row.sum}</TableCell>
              <TableCell>{row.tax}</TableCell>
              <TableCell>{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Компонент для каталога товаров
  const CatalogTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell>Крепость</TableCell>
            <TableCell>Объем, л</TableCell>
            <TableCell>Остаток в ЕГАИС</TableCell>
            <TableCell>Цена</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {catalogData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.article}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.strength}</TableCell>
              <TableCell>{row.volume}</TableCell>
              <TableCell>{row.remains}</TableCell>
              <TableCell>{row.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Компонент для корзины
  const CartTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Наименование</TableCell>
            <TableCell>Кол-во</TableCell>
            <TableCell>Цена</TableCell>
            <TableCell>Сумма</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cartData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.price}</TableCell>
              <TableCell>{row.sum}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3}>Итого</TableCell>
            <TableCell>975.00 ₽</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              Контур.Маркет
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <List>
            <ListItem button onClick={() => setSelectedSection('invoices')}>
              <ListItemIcon><ReceiptIcon /></ListItemIcon>
              <ListItemText primary="Накладные" />
            </ListItem>
            <ListItem button onClick={() => setSelectedSection('catalog')}>
              <ListItemIcon><InventoryIcon /></ListItemIcon>
              <ListItemText primary="Каталог товаров" />
            </ListItem>
            <ListItem button onClick={() => setSelectedSection('cart')}>
              <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
              <ListItemText primary="Корзина" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><LocalShippingIcon /></ListItemIcon>
              <ListItemText primary="Поставки" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
              <ListItemText primary="Кассы" />
            </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {selectedSection === 'invoices' && (
            <>
              <Typography variant="h5">Товарный отчет</Typography>
              <Typography>27 марта — 2 апреля 2018</Typography>
              <InvoicesTable />
            </>
          )}
          {selectedSection === 'catalog' && (
            <>
              <Typography variant="h5">Каталог товаров</Typography>
              <CatalogTable />
            </>
          )}
          {selectedSection === 'cart' && (
            <>
              <Typography variant="h5">Ваша корзина и склад</Typography>
              <CartTable />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;