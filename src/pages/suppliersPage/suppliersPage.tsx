import React, { useState, useEffect } from 'react';
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
  Snackbar,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Business,
} from '@mui/icons-material';
import { 
  Company, 
  CompanyType, 
  getCompanies, 
  getCompanyTypes, 
  postCompany, 
  putCompany, 
  deleteCompanyById 
} from './makeData';

import AdminOnly from '../../components/AdminOnly';

// Конфигурация для типов компаний
const typeConfig: Record<string, { icon: string; label: string; bgColor: string; color: string }> = {
  'ООО': { icon: '🏢', label: 'ООО', bgColor: '#e3f2fd', color: '#1565c0' },
  'ИП': { icon: '👤', label: 'ИП', bgColor: '#f3e5f5', color: '#7b1fa2' },
  'АО': { icon: '🏛️', label: 'АО', bgColor: '#e8f5e8', color: '#2e7d32' },
  'ЗАО': { icon: '🔒', label: 'ЗАО', bgColor: '#fff3e0', color: '#ef6c00' },
  'ТОО': { icon: '🌐', label: 'ТОО', bgColor: '#fbe9e7', color: '#ff5722' },
};

// Компонент для отображения типа компании
const TypeChip: React.FC<{ typeName: string | null }> = ({ typeName }) => {
  if (!typeName) return null;
  
  const config = typeConfig[typeName] || { 
    icon: '🏢', 
    label: typeName, 
    bgColor: '#f5f5f5', 
    color: '#666' 
  };
  
  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </Box>
      }
      size="small"
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 500,
      }}
    />
  );
};

// Модальное окно для добавления/редактирования компании
interface CompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; company_type_id: number }) => Promise<void>;
  initialData?: { name: string; company_type_id: number };
  companyTypes: CompanyType[];
  isEdit?: boolean;
  loading?: boolean;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  companyTypes, 
  isEdit = false,
  loading = false
}) => {
  const [formData, setFormData] = useState<{ name: string; company_type_id: number }>({
    name: '',
    company_type_id: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        company_type_id: companyTypes[0]?.id || 0
      });
    }
  }, [initialData, companyTypes]);

  const handleChange = (field: 'name' | 'company_type_id', value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.company_type_id) {
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактировать компанию' : 'Добавить новую компанию'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Тип организации</InputLabel>
            <Select
              value={formData.company_type_id || ''}
              label="Тип организации"
              onChange={(e) => handleChange('company_type_id', Number(e.target.value))}
              disabled={loading}
            >
              {companyTypes.map((type) => {
                const config = typeConfig[type.name] || { icon: '🏢', label: type.name };
                return (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{config.icon}</span>
                      <Typography>{type.name}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            label="Наименование компании"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !formData.name.trim() || !formData.company_type_id}
        >
          {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SuppliersPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [types, comps] = await Promise.all([
          getCompanyTypes(),
          getCompanies()
        ]);
        setCompanyTypes(types);
        setCompanies(comps);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        showSnackbar('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Фильтрация компаний
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.company_type ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditCompany = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      try {
        await deleteCompanyById(selectedCompany.id);
        setCompanies(prev => prev.filter(c => c.id !== selectedCompany.id));
        showSnackbar('Компания успешно удалена', 'success');
      } catch (err) {
        console.error('Ошибка удаления компании:', err);
        showSnackbar('Ошибка удаления компании', 'error');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleDialogSubmit = async (data: { name: string; company_type_id: number }) => {
  try {
    setDialogLoading(true);
    
    if (isEditing && selectedCompany) {
      // Редактирование существующей компании
      const updated = await putCompany(selectedCompany.id, data);
      
      // ИСПРАВЛЕНИЕ: Находим название типа компании по ID
      const companyTypeName = companyTypes.find(t => t.id === data.company_type_id)?.name || null;
      
      // Обновляем данные компании в состоянии
      setCompanies(prev => prev.map(c => {
        if (c.id === updated.id) {
          return {
            ...updated,
            company_type: companyTypeName, // Добавляем название типа
          };
        }
        return c;
      }));
      
      showSnackbar('Компания успешно обновлена', 'success');
    } else {
      // Создание новой компании
      const created = await postCompany(data);
      
      // ИСПРАВЛЕНИЕ: Находим название типа компании по ID
      const companyTypeName = companyTypes.find(t => t.id === data.company_type_id)?.name || null;
      
      const companyWithType = {
        ...created,
        company_type: companyTypeName, // Добавляем название типа
      };
      
      setCompanies(prev => [...prev, companyWithType]);
      showSnackbar('Компания успешно добавлена', 'success');
    }
    
    setDialogOpen(false);
    setSelectedCompany(null);
  } catch (err) {
    console.error('Ошибка сохранения компании:', err);
    showSnackbar('Ошибка сохранения компании', 'error');
  } finally {
    setDialogLoading(false);
  }
};

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Подсчет компаний по типам
  const getTypeStats = () => {
    const stats: Record<string, number> = {};
    
    // Инициализируем все типы с нулевым счетчиком
    companyTypes.forEach(type => {
      stats[type.name] = 0;
    });
    
    // Подсчитываем компании по типу
    companies.forEach(company => {
      if (company.company_type) {
        stats[company.company_type] = (stats[company.company_type] || 0) + 1;
      }
    });
    
    return stats;
  };

  const typeStats = getTypeStats();

  return (
    <Box>
      {/* Заголовок и панель управления */}
      <Box>
        <Typography color="text.secondary" paragraph>
          Управление информацией о компаниях: добавление, редактирование и удаление записей
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
              placeholder="Поиск по названию или типу компании"
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
                width: { xs: '100%', md: 550 },
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
                label={`Всего: ${companies.length}`}
                variant="outlined"
                sx={{ minWidth: 120, justifyContent: 'center' }}
              />
              <Chip 
                label={`Найдено: ${filteredCompanies.length}`}
                variant="outlined"
                color="primary"
                sx={{ minWidth: 120, justifyContent: 'center' }}
              />
            </Box>
            
            {/* Кнопка добавления */}
            <AdminOnly>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddCompany}
                sx={{ 
                  backgroundColor: '#1976d2',
                  minWidth: 170,
                  alignSelf: { xs: 'stretch', md: 'center' }
                }}
              >
                Добавить
              </Button>
            </AdminOnly>
          </Box>
        </Paper>
      </Box>
      
      {/* Таблица компаний */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Наименование</TableCell>
                <AdminOnly>  
                  <TableCell align="right">Действия</TableCell>
                </AdminOnly>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography>Загрузка данных...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography>Нет данных для отображения</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company) => (
                    <TableRow 
                      key={company.id}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>
                        <TypeChip typeName={company.company_type} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {company.name}
                        </Typography>
                      </TableCell>
                      <AdminOnly>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, company)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </AdminOnly>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCompanies.length}
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

      {/* Статистика по типам компаний */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Распределение компаний по типам организаций
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {companyTypes.map((type) => {
            const config = typeConfig[type.name] || { 
              icon: '🏢', 
              label: type.name, 
              bgColor: '#f5f5f5', 
              color: '#666' 
            };
            const count = typeStats[type.name] || 0;
            
            return (
              <Paper 
                key={type.id}
                elevation={0}
                sx={{ 
                  p: 2, 
                  flex: 1, 
                  minWidth: 200,
                  backgroundColor: config.bgColor,
                  border: '1px solid',
                  borderColor: config.color,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4">{config.icon}</Typography>
                  <Typography variant="h5" fontWeight={600} color={config.color}>
                    {count}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={500}>
                  {config.label}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      {/* Меню действий для компании */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditCompany}>
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
      <CompanyDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleDialogSubmit}
        initialData={selectedCompany ? { 
          name: selectedCompany.name, 
          company_type_id: selectedCompany.company_type_id 
        } : undefined}
        companyTypes={companyTypes}
        isEdit={isEditing}
        loading={dialogLoading}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить компанию "{selectedCompany?.name}"?
            Это действие нельзя отменить.
          </Alert>
          {selectedCompany && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Тип:</strong> {selectedCompany.company_type}
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

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuppliersPage;