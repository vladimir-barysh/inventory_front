import React, { useState} from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Description,
  Assessment,
  Download,
  Print,
  ShoppingCart,
  Inventory,
  RemoveCircle,
  ArrowForward,
} from '@mui/icons-material';
import { SecondSidebar,DocumentLineDialog, DocumentAddDialog, DocumentDeleteDialog } from './../../components';
import { Document, documentsData, DocumentFormData, mockProducts, mockSuppliers } from './makeData';

// Типы для категорий документов
interface CategoryItem {
  text: string;
  icon?: React.ReactElement;
  count?: number;
}

interface CategorySection {
  title: string;
  items: CategoryItem[];
}

// Компонент для отображения типа документа
const DocumentTypeChip: React.FC<{ type: Document['тип']}> = ({ type}) => {
  const typeConfig = {
    'приходная': { 
      bgColor: '#d4edda', 
      color: '#155724',
      icon: <ShoppingCart fontSize="small" />,
      label: 'Приходная'
    },
    'расходная': { 
      bgColor: '#f8d7da', 
      color: '#721c24',
      icon: <ShoppingCart fontSize="small" />,
      label: 'Расходная'
    },
    'инвентаризация': { 
      bgColor: '#fff3cd', 
      color: '#856404',
      icon: <Inventory fontSize="small" />,
      label: 'Инвентаризация'
    },
    'списание': { 
      bgColor: '#d1ecf1', 
      color: '#0c5460',
      icon: <RemoveCircle fontSize="small" />,
      label: 'Списание'
    },
    'перемещение': { 
      bgColor: '#cce5ff', 
      color: '#004085',
      icon: <ArrowForward fontSize="small" />,
      label: 'Перемещение'
    },
    'отчёт': { 
      bgColor: '#e6ccff', 
      color: '#6610f2',
      icon: <Assessment fontSize="small" />,
      label: 'Отчёт'
    },
  };

  const config = typeConfig[type];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          fontWeight: 500,
        }}
      />
    </Box>
  );
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(documentsData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Категории для сайдбара
  const categorySections: CategorySection[] = [
    {
      title: 'Входные документы',
      items: [
        {
          text: 'Приходные накладные',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'приходная').length,
        },
        {
          text: 'Расходные накладные',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'расходная').length,
        },
        {
          text: 'Акты инвентаризации',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'инвентаризация').length,
        },
        {
          text: 'Акты списания',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'списание').length,
        },
        {
          text: 'Заявки на перемещение',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'перемещение').length,
        },
        {
          text: 'Отчёты',
          icon: <Description />,
          count: documents.filter(d => d.тип === 'отчёт').length,
        },
      ],
    },
  ];

  // Фильтрация документов
  const filteredDocuments = documents.filter(document => {
    const matchesSearch =
      document.номер.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.комментарий.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.дата.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.поставщик && document.поставщик.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (document.строки && document.строки.some(line => 
        line.наименование.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.артикул.toLowerCase().includes(searchTerm.toLowerCase())
    ));

    const matchesType = !selectedType || 
      (selectedType === 'Отчёты' && document.тип === 'отчёт') ||
      (document.тип === selectedType);

    return matchesSearch && matchesType;
  });

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

  const handleAddDocument = () => {
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditDocument = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedDocument) {
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id));
    }
    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleDialogSubmit = (formData: DocumentFormData) => {
    if (isEditing && selectedDocument) {
      // Редактирование существующего документа
      setDocuments(prev => prev.map(d =>
        d.id === selectedDocument.id
          ? { ...d, ...formData }
          : d
      ));
    } else {
      // Добавление нового документа
      const newDocument: Document = {
        id: Math.max(...documents.map(d => d.id)) + 1,
        ...formData,
      };
      setDocuments(prev => [...prev, newDocument]);
    }
  };

  const handleCategoryClick = (category: string) => {
    // Сопоставление названия категории с типом документа
    const typeMap: Record<string, string> = {
      'Приходные накладные': 'приходная',
      'Расходные накладные': 'расходная',
      'Акты инвентаризации': 'инвентаризация',
      'Акты списания': 'списание',
      'Заявки на перемещение': 'перемещение',
      'Отчёты': 'Отчёты',
    };

    const mappedType = typeMap[category];
    if (selectedType === mappedType) {
      setSelectedType(null); // Снять фильтр при повторном клике
    } else {
      setSelectedType(mappedType);
    }
    setPage(0);
  };

  // Обработчик двойного клика по строке таблицы
  const handleRowDoubleClick = (document: Document) => {
    if (document.тип !== 'отчёт') { // Отчеты не заполняются
      setSelectedDocument(document);
      setFillDialogOpen(true);
    }
  };

  // Функция сохранения заполненного документа
  const handleSaveFilledDocument = (updatedDocument: Document) => {
    setDocuments(prev => prev.map(d =>
      d.id === updatedDocument.id ? updatedDocument : d
    ));
  };

  // Функция для получения количества строк в документе
  const getDocumentLinesCount = (document: Document) => {
    return document.строки ? document.строки.length : 0;
  };

  return (
    <Box sx={{ display: 'flex', height: '88vh' }}>
      {/* Второстепенный сайдбар с типами документов */}
      <SecondSidebar
        sections={categorySections}
        width={280}
        onItemClick={handleCategoryClick}
      />

      {/* Основной контент */}
      <Box sx={{ flex: 1, pl: 3, overflow: 'auto' }}>
        {/* Заголовок и панель управления */}
        <Box sx={{ mb: 4 }}>
          <Typography color="text.secondary" paragraph>
            Управление документами: создание, редактирование и удаление документов
          </Typography>

          {/* Панель поиска и управления */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between'
            }}>
              {/* Поле поиска */}
              <TextField
                placeholder="Поиск по номеру, комментарию или дате"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', md: 600 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  }
                }}
              />

              {/* Статистика */}
              <Box sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Chip
                  label={`Документов: ${documents.length}`}
                  variant="outlined"
                  sx={{ minWidth: 120, justifyContent: 'center' }}
                />
                <Chip
                  label={`Найдено: ${filteredDocuments.length}`}
                  variant="outlined"
                  color="primary"
                  sx={{ minWidth: 120, justifyContent: 'center' }}
                />
              </Box>

              {/* Кнопка добавления */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddDocument}
                sx={{
                  backgroundColor: '#1976d2',
                  minWidth: 170,
                  alignSelf: { xs: 'stretch', md: 'center' }
                }}
              >
                Добавить документ
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Таблица документов */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 550 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="150px">Номер документа</TableCell>
                  <TableCell width="100px">Дата</TableCell>
                  <TableCell width="140px">Тип документа</TableCell>
                  <TableCell width="80px">Строк</TableCell>
                  <TableCell width="300px">Комментарий</TableCell>
                  <TableCell width="80px" align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((document) => (
                    <TableRow
                      key={document.id}
                      hover
                      sx={{ 
                        cursor: document.тип !== 'отчёт' ? 'pointer' : 'default',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onDoubleClick={() => handleRowDoubleClick(document)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {document.номер}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {document.дата}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <DocumentTypeChip type={document.тип} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" align="center">
                          {getDocumentLinesCount(document)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {document.тип === 'приходная' && document.поставщик && (
                            <Typography variant="caption" color="primary" fontWeight={600}>
                              Поставщик: {document.поставщик}
                              <br />
                            </Typography>
                          )}
                          {document.комментарий}
                        </Typography>
                        {document.строки && document.строки.length > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Товаров: {document.строки.length} | 
                            Общее кол-во: {document.строки.reduce((sum, line) => sum + line.количество, 0)}
                          </Typography>
                        )}
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
            count={filteredDocuments.length}
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

        {/* Меню действий для документа */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditDocument}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Редактировать документ</ListItemText>
          </MenuItem>
          {selectedDocument?.тип === 'отчёт' && (
            <MenuItem onClick={() => {
              console.log('Скачать отчет:', selectedDocument);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText>Скачать PDF</ListItemText>
            </MenuItem>
          )}
          {selectedDocument?.тип === 'отчёт' && (
            <MenuItem onClick={() => {
              console.log('Печать отчета:', selectedDocument);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Print fontSize="small" />
              </ListItemIcon>
              <ListItemText>Распечатать</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Удалить</ListItemText>
          </MenuItem>
        </Menu>

        {/* Диалог добавления/редактирования */}
        <DocumentAddDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialData={selectedDocument || undefined}
          isEdit={isEditing}
          suppliers={mockSuppliers} // Передаем список поставщиков
        />

        {/* Диалог заполнения документа */}
        {selectedDocument && (
          <DocumentLineDialog
            open={fillDialogOpen}
            onClose={() => {
              setFillDialogOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            products={mockProducts}
            onSave={handleSaveFilledDocument}
          />
        )}

        {/* Диалог подтверждения удаления */}
        <DocumentDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          selectedDocument={selectedDocument}
        />
      </Box>
    </Box>
  );
};

export default DocumentsPage;