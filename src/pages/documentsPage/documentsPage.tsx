import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Download,
  Print,
  MoreVert,
  Error,
  CheckCircle,
  Pending,
  DateRange,
  Description,
} from '@mui/icons-material';
import { MenuSection, SecondSidebar } from '../../components';
import { Document, documents } from './makeData';

// Компонент для отображения статуса
const StatusChip: React.FC<{ status: Document['статус'] }> = ({ status }) => {
  const statusConfig = {
    'обработан': { 
      bgcolor: '#d4edda', 
      color: '#155724', 
      icon: <CheckCircle fontSize="small" />, 
      label: 'Обработан' 
    },
    'в обработке': { 
      bgcolor: '#fff3cd', 
      color: '#856404', 
      icon: <Pending fontSize="small" />, 
      label: 'В обработке' 
    },
    'ошибка': { 
      bgcolor: '#f8d7da', 
      color: '#721c24', 
      icon: <Error fontSize="small" />, 
      label: 'Ошибка' 
    },
    'черновик': { 
      bgcolor: '#e2e3e5', 
      color: '#383d41', 
      icon: <Description fontSize="small" />, 
      label: 'Черновик' 
    },
  };

  const config = statusConfig[status];
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      variant="outlined"
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        borderColor: config.color,
      }}
    />
  );
};

const sidebarMenu: MenuSection[] = [
  {
    title: 'Входные',
    items: [
      { text: 'Приходные накладные' },
      { text: 'Расходные накладные' },
      { text: 'Акты инвентаризации' },
      { text: 'Акты списания товаров' },
      { text: 'Заявки на перемещение товаров' },
    ]
  },
  { 
    title: 'Отчёты',
    items: [
      { text: 'Об остатках товаров на складе' },
      { text: 'О движении товаров' },
      { text: 'О товарах с истекающим сроком годности' },
    ]
  },
];

// Компонент для типа документа
const DocumentTypeChip: React.FC<{ type: Document['тип'] }> = ({ type }) => {
  const typeConfig = {
    'приход': { 
      bgcolor: '#cfe2ff', 
      color: '#084298', 
      label: 'Приход' 
    },
    'возврат': { 
      bgcolor: '#e2e3e5', 
      color: '#2b2f32', 
      label: 'Возврат' 
    },
    'перемещение': { 
      bgcolor: '#d1ecf1', 
      color: '#0c5460', 
      label: 'Перемещение' 
    },
  };

  const config = typeConfig[type];
  
  return (
    <Chip
      label={config.label}
      size="small"
      variant="outlined"
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        borderColor: config.color,
      }}
    />
  );
};

export const IncomingDocumentsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleMenuItemClick = (itemText: string) => {
    console.log('Выбран пункт меню:', itemText);
    // Здесь можно добавить навигацию и фильтрацию
  };

  // Рассчет статистики
  const totalSum = documents.reduce((sum, doc) => sum + doc.сумма, 0);
  const totalItems = documents.reduce((sum, doc) => sum + doc.количество, 0);
  const processedCount = documents.filter(doc => doc.статус === 'обработан').length;
  const inProgressCount = documents.filter(doc => doc.статус === 'в обработке').length;

  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      {/* Левое меню навигации */}
      <SecondSidebar
        sections={sidebarMenu}
        width={280}
        onItemClick={handleMenuItemClick}
      />

      {/* Основное содержимое */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 3,
        minHeight: '100vh'
      }}>
        {/* Заголовок и панель управления */}
        <Box sx={{ mb: 4 }}>
          {/* Панель поиска и фильтров */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: '3fr 1fr 1fr 1fr' 
              }, 
              gap: 2, 
              alignItems: 'center' 
            }}>
              <TextField
                fullWidth
                placeholder="Поиск по номеру, дате, статусу..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
              >
                Фильтры
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DateRange />}
              >
                Период
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                sx={{ backgroundColor: '#1976d2' }}
              >
                Новый
              </Button>
            </Box>
          </Paper>
        </Box>
        
        {/* Таблица документов */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>№ документа</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((document) => (
                    <TableRow 
                      key={document.id}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Typography fontWeight={500}>
                          {document.номер}
                        </Typography>
                      </TableCell>
                      <TableCell>{document.дата}</TableCell>
                      <TableCell>
                        <DocumentTypeChip type={document.тип} />
                      </TableCell>
                      <TableCell>{document.поставщик}</TableCell>
                      <TableCell>
                        <StatusChip status={document.статус} />
                      </TableCell>
                      <TableCell>{document.количество}</TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {document.сумма.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, document)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={documents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} из ${count}`
            }
          />
        </Paper>
      </Box>

      {/* Меню действий для документа */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотреть</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CheckCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Подтвердить</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Error fontSize="small" />
          </ListItemIcon>
          <ListItemText>Отклонить</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скачать PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Распечатать</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};