// src/pages/documents/DocumentsPage.tsx
import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Description,
  DateRange,
  Comment,
  Assessment,
  Download,
  Print,
} from '@mui/icons-material';
import { SecondSidebar } from './../../components';
import { Document, documentsData, DocumentFormData } from './makeData';

// Типы для категорий документов
interface CategoryItem {
  text: string;
  icon?: React.ReactElement;
  count?: number;
  children?: string[];
}

interface CategorySection {
  title: string;
  items: CategoryItem[];
}

// Модальное окно для добавления/редактирования документа
interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => void;
  initialData?: DocumentFormData;
  isEdit?: boolean;
}

const DocumentDialog: React.FC<DocumentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<DocumentFormData>(
    initialData || {
      номер: '',
      дата: new Date().toLocaleDateString('ru-RU'),
      комментарий: '',
      тип: 'приходная',
    }
  );

  const handleChange = (field: keyof DocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          {isEdit ? 'Редактировать документ' : 'Добавить новый документ'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {/* Основная информация */}
          <Typography variant="subtitle2" color="text.secondary">
            Основная информация
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Номер документа"
              value={formData.номер}
              onChange={(e) => handleChange('номер', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Дата"
              value={formData.дата}
              onChange={(e) => handleChange('дата', e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange fontSize="small" />
                  </InputAdornment>
                ),
              }}
              placeholder="дд.мм.гггг"
            />
          </Box>

          {/* Тип документа */}
          <Typography variant="subtitle2" color="text.secondary">
            Тип документа
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Тип документа</InputLabel>
            <Select
              value={formData.тип}
              label="Тип документа"
              onChange={(e) => handleChange('тип', e.target.value)}
            >
              <MenuItem value="приходная">Приходная накладная</MenuItem>
              <MenuItem value="расходная">Расходная накладная</MenuItem>
              <MenuItem value="инвентаризация">Акт инвентаризации</MenuItem>
              <MenuItem value="списание">Акт списания</MenuItem>
              <MenuItem value="перемещение">Заявка на перемещение</MenuItem>
              <MenuItem value="отчёт">Отчёт</MenuItem>
            </Select>
          </FormControl>

          {/* Комментарий */}
          <Typography variant="subtitle2" color="text.secondary">
            Комментарий {formData.тип === 'отчёт' && '(автозаполнен из типа отчёта)'}
          </Typography>
          <TextField
            label="Комментарий"
            value={formData.комментарий}
            onChange={(e) => handleChange('комментарий', e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Comment fontSize="small" />
                </InputAdornment>
              ),
            }}
            disabled={formData.тип === 'отчёт'}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Компонент для отображения типа документа
const DocumentTypeChip: React.FC<{ type: Document['тип'] }> = ({ type }) => {
  const typeConfig = {
    'приходная': { 
      bgColor: '#d4edda', 
      color: '#155724',
      icon: <Description fontSize="small" />,
      label: 'Приходная'
    },
    'расходная': { 
      bgColor: '#f8d7da', 
      color: '#721c24',
      icon: <Description fontSize="small" />,
      label: 'Расходная'
    },
    'инвентаризация': { 
      bgColor: '#fff3cd', 
      color: '#856404',
      icon: <Description fontSize="small" />,
      label: 'Инвентаризация'
    },
    'списание': { 
      bgColor: '#d1ecf1', 
      color: '#0c5460',
      icon: <Description fontSize="small" />,
      label: 'Списание'
    },
    'перемещение': { 
      bgColor: '#cce5ff', 
      color: '#004085',
      icon: <Description fontSize="small" />,
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
  );
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(documentsData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
          count: documents.filter(d => d.тип === 'перемещение').length,
           children: [
            'Остатки товаров на складе', 'Движение товаров', 'Товары с истекающим сроком годности'],
        },
      ],
    },
  ];

  // Фильтрация документов
  const filteredDocuments = documents.filter(document => {
    const matchesSearch =
      document.номер.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.комментарий.toLowerCase().includes(searchTerm.toLowerCase());

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
      'Отчёты': 'Отчёты', // Специальное значение для всех отчетов
      'Остатки товаров на складе': 'отчёт',
      'Движение товаров': 'отчёт',
      'Товары с истекающим сроком годности': 'отчёт',
    };

    const mappedType = typeMap[category];
    if (selectedType === mappedType) {
      setSelectedType(null); // Снять фильтр при повторном клике
    } else {
      setSelectedType(mappedType);
    }
    setPage(0);
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
                placeholder="Поиск по номеру или комментарию..."
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
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Номер документа</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип документа</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((document) => (
                    <TableRow
                      key={document.id}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
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
                        <Typography variant="body2" color="text.secondary">
                          {document.комментарий}
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
            <ListItemText>Редактировать</ListItemText>
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
        <DocumentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialData={selectedDocument || undefined}
          isEdit={isEditing}
        />

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Вы уверены, что хотите удалить документ "{selectedDocument?.номер}"?
              Это действие нельзя отменить.
            </Alert>
            {selectedDocument && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Тип:</strong> <DocumentTypeChip type={selectedDocument.тип} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Дата:</strong> {selectedDocument.дата}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Комментарий:</strong> {selectedDocument.комментарий}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DocumentsPage;