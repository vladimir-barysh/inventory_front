import React, { useState, useEffect } from 'react';
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
  ShoppingCart,
  Inventory,
  RemoveCircle,
  ArrowForward,
} from '@mui/icons-material';
import { SecondSidebar, DocumentLineDialog, DocumentAddDialog, DocumentDeleteDialog } from './../../components';

import { DocumentType, documentTypeApi, Document, documentApi, DocumentCreate, DocumentUpdate } from './makeData';
import { Company, getCompanies, productApi, getStorageZones, Product, documentLineApi, Category, Unit, categoryApi, unitApi } from '../../pages';

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
interface DocumentTypeChipProps {
  typeId: number; // ID типа документа
  documentTypes: DocumentType[]; // Массив типов из БД
}

const DocumentTypeChip: React.FC<DocumentTypeChipProps> = ({ typeId, documentTypes }) => {
  // Находим тип документа по ID
  const documentType = documentTypes.find(type => type.id === typeId);

  // Конфигурация для каждого типа
  const typeConfig = {
    1: { // Приход (ID: 1)
      bgColor: '#d4edda',
      color: '#155724',
      icon: <ShoppingCart fontSize="small" />,
      label: 'Приход'
    },
    2: { // Расход (ID: 2)
      bgColor: '#f8d7da',
      color: '#721c24',
      icon: <ShoppingCart fontSize="small" />,
      label: 'Расход'
    },
    3: { // Перемещение (ID: 3)
      bgColor: '#cce5ff',
      color: '#004085',
      icon: <ArrowForward fontSize="small" />,
      label: 'Перемещение'
    },
    4: { // Инвентаризация (ID: 4)
      bgColor: '#fff3cd',
      color: '#856404',
      icon: <Inventory fontSize="small" />,
      label: 'Инвентаризация'
    },
    5: { // Списание (ID: 5)
      bgColor: '#d1ecf1',
      color: '#0c5460',
      icon: <RemoveCircle fontSize="small" />,
      label: 'Списание'
    },
    6: { // Отчёт (ID: 6)
      bgColor: '#e6ccff',
      color: '#6610f2',
      icon: <Assessment fontSize="small" />,
      label: 'Отчёт'
    },
  };

  const config = documentType ? typeConfig[documentType.id as keyof typeof typeConfig] : {
    bgColor: '#e0e0e0',
    color: '#424242',
    icon: <Description fontSize="small" />,
    label: 'Неизвестный тип'
  };
  
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);       // Типы документов из бд
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storageZones, setStorageZones] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Первоначальная загрузка
    loadAllData();
    
    // Настраиваем интервал для обновления каждые 10 секунд, НО ТОЛЬКО ЕСЛИ НЕ РЕДАКТИРУЕМ/НЕ ДОБАВЛЯЕМ
    const intervalId = setInterval(() => {
      if (!dialogOpen && !fillDialogOpen && !deleteDialogOpen) {
        console.log('Автоматическое обновление данных...');
        loadAllData();
      } else {
        console.log('Пропускаем автообновление: открыт диалог');
      }
    }, 10000);
    
    return () => {
      clearInterval(intervalId);
      console.log('Интервал очищен');
    };
  }, [dialogOpen, fillDialogOpen, deleteDialogOpen]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [types, docs, comps, prods, zones, cats, unts] = await Promise.all([
        documentTypeApi.getAll(),
        documentApi.getAll(),
        getCompanies(),
        productApi.getAll(), 
        getStorageZones(),    
        categoryApi.getAll(), 
        unitApi.getAll()    
      ]);
      
      setDocumentTypes(types);
      setDocuments(docs);
      setCompanies(comps);
      setProducts(prods);
      setStorageZones(zones);
      setCategories(cats);
      setUnits(unts);
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
};

  // Категории для сайдбара
  const categorySections: CategorySection[] = [
    {
      title: 'Типы документов',
      items: documentTypes.map(type => ({
        text: type.name,
        icon: <Description />,
        count: documents.filter(d => d.document_type_id === type.id).length,
      })),
    },
  ];

  // Фильтрация документов
  const filteredDocuments = documents.filter(document => {
  // Находим компанию по ID
  const company = companies.find(c => c.id === document.company_id);
  
  const matchesSearch =
    (document.number ? document.number.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (document.comment ? document.comment.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (document.date ? document.date.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (company && company.name ? company.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);

  const matchesType = !selectedTypeId || document.document_type_id === selectedTypeId;

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
    setEditingDocument(null); // Сбрасываем данные редактирования
    setDialogOpen(true);
  };

  const handleEditDocument = async () => {
    if (selectedDocument) {
      setIsEditing(true);
      
      try {
        const fullDocumentData = await documentApi.getById(selectedDocument.id);
        
        // Сохраняем полные данные в отдельное состояние
        setEditingDocument(fullDocumentData);
        
        // Открываем диалог
        setDialogOpen(true);
        
      } catch (error) {
        // Если не удалось загрузить, используем данные из таблицы
        setEditingDocument(selectedDocument);
        setDialogOpen(true);
      }
    }
    
    handleMenuClose();
  };

  // Автоматически закрываем меню при открытии диалога удаления
  useEffect(() => {
    if (deleteDialogOpen && anchorEl) {
      setAnchorEl(null);
    }
  }, [deleteDialogOpen, anchorEl]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocument) {
      try {
        await documentApi.delete(selectedDocument.id);
        // Обновляем локальное состояние
        setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id));
        setDeleteDialogOpen(false);
        setSelectedDocument(null);
      } catch (error) {
        console.error('Ошибка при удалении документа:', error);
      }
    }
  };

  const handleDialogSubmit = async (formData: DocumentCreate) => {    
    // Определяем ID документа для редактирования
    const documentId = editingDocument?.id || selectedDocument?.id;
    
    try {
      if (isEditing && documentId) {
        
        // Преобразуем DocumentCreate в DocumentUpdate
        const updateData: DocumentUpdate = {
          number: formData.number,
          date: formData.date,
          comment: formData.comment,
          company_id: formData.company_id,
          document_type_id: formData.document_type_id,
        };
        
        const updatedDoc = await documentApi.update(documentId, updateData);
        
        // Обновляем локальное состояние
        setDocuments(prev => prev.map(d => 
          d.id === documentId ? updatedDoc : d
        ));
        
      } else {
        const newDocument = await documentApi.create(formData);
        setDocuments(prev => [...prev, newDocument]);
      }
      
      // Закрываем диалог и сбрасываем состояния
      setDialogOpen(false);
      setEditingDocument(null);
      setSelectedDocument(null);
      
    } catch (error: any) {
      console.error('Ошибка при сохранении документа:', error);
    }
  };

  const handleCategoryClick = (category: string) => {
    // Находим тип документа по имени
    const foundType = documentTypes.find(type => type.name === category);
    
    if (foundType) {
      if (selectedTypeId === foundType.id) {
        setSelectedTypeId(null); // Снять фильтр при повторном клике
      } else {
        setSelectedTypeId(foundType.id); // Установить фильтр по ID
      }
      setPage(0);
    }
  };

  // Обработчик двойного клика по строке таблицы
  const handleRowDoubleClick = async (document: Document) => {
    try {
      // Загружаем полные данные документа
      const fullDocumentData = await documentApi.getById(document.id);
      
      // Загружаем строки документа
      const documentLines = await documentLineApi.getByDocumentId(document.id);
      
      // Добавляем строки к документу
      const documentWithLines = {
        ...fullDocumentData,
        строки: documentLines // Добавляем строки
      };
      
      setSelectedDocument(documentWithLines as any); // Приведение типа
      
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
      setSelectedDocument(document);
    }
    
    setFillDialogOpen(true);
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
                  .map((document) => {
                    // Находим компанию по ID
                    const company = companies.find(c => c.id === document.company_id);
                    
                    return (
                      <TableRow
                        key={document.id}
                        hover
                        sx={{ 
                          cursor: document.document_type_id !== 6 ? 'pointer' : 'default',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onDoubleClick={() => handleRowDoubleClick(document)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {document.number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {document.date}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <DocumentTypeChip
                            typeId={document.document_type_id}
                            documentTypes={documentTypes}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" align="center">
                            {/* {getDocumentLinesCount(document)} */}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {document.document_type_id === 1 && company && (
                              <Typography variant="caption" color="primary" fontWeight={600}>
                                Поставщик: {company.name}
                                <br />
                              </Typography>
                            )}
                            {document.comment}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Добавьте эту строку
                              handleMenuOpen(e, document);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
          onClose={() => {
            setDialogOpen(false);
            setEditingDocument(null);
            setSelectedDocument(null);
          }}
          onSubmit={handleDialogSubmit}
          initialData={editingDocument || selectedDocument || undefined}
          isEdit={isEditing}
          suppliers={companies}
          documentTypes={documentTypes}
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
            products={products}
            storageZones={storageZones}
            categories={categories}
            units={units}
            onSave={() => {
              // Перезагрузить документы после сохранения строк
              loadAllData();
            }}
          />
        )}

        {/* Диалог подтверждения удаления */}
        <DocumentDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          selectedDocument={selectedDocument}
          documentTypes={documentTypes} // Передаем типы документов
          companies={companies} // Передаем компании
        />
      </Box>
    </Box>
  );
};

export default DocumentsPage;