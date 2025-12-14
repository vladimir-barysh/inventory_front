// src/pages/storage/StoragePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Warehouse,
  Storage,
  Info,
  Refresh,
} from '@mui/icons-material';
import { 
  StorageZone, 
  StorageZoneFormData,
  storageConditionsConfig,
  initStorageConditionsConfig,
  getStorageConditions,
  getStorageZones,
  postStorageZone,
  putStorageZone,
  deleteStorageZoneById,
} from './makeData';

import AdminOnly from '../../components/AdminOnly';

// Компонент для отображения условий хранения
const StorageConditionChip: React.FC<{ condition: StorageZone['условияХранения'] }> = ({ condition }) => {
  const config = storageConditionsConfig[condition] || {
    label: condition || 'Не указано',
    color: '#f5f5f5',
    description: condition || 'Не указано'
  };
  
  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{config.label}</span>
        </Box>
      }
      size="small"
      sx={{
        backgroundColor: config.color,
        color: '#333',
        fontWeight: 500,
      }}
    />
  );
};

// Модальное окно для добавления/редактирования зоны
interface StorageZoneDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StorageZoneFormData) => Promise<void>;
  initialData?: StorageZoneFormData;
  isEdit?: boolean;
  loading?: boolean;
}

const StorageZoneDialog: React.FC<StorageZoneDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false,
  loading = false
}) => {
  const [formData, setFormData] = useState<StorageZoneFormData>(
    initialData || {
      наименование: '',
      условияХранения: Object.keys(storageConditionsConfig)[0] || '',
      комментарий: '',
    }
  );

  // Сбрасываем форму при открытии/закрытии
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          наименование: '',
          условияХранения: Object.keys(storageConditionsConfig)[0] || '',
          комментарий: '',
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (field: keyof StorageZoneFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
      throw error;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warehouse />
          {isEdit ? 'Редактировать зону хранения' : 'Добавить новую зону хранения'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Наименование зоны"
            value={formData.наименование || ''}
            onChange={(e) => handleChange('наименование', e.target.value)}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Storage fontSize="small" />
                </InputAdornment>
              ),
            }}
            helperText="Например: Зона А-1, Холодильная камера №1"
            disabled={loading}
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel>Условия хранения</InputLabel>
            <Select
              value={formData.условияХранения || ''}
              label="Условия хранения"
              onChange={(e) => handleChange('условияХранения', e.target.value as StorageZone['условияХранения'])}
            >
              {Object.entries(storageConditionsConfig).length > 0 ? (
                Object.entries(storageConditionsConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography>{config.label}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">
                    Загрузка условий хранения...
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Комментарий"
            value={formData.комментарий || ''}
            onChange={(e) => handleChange('комментарий', e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Info fontSize="small" />
                </InputAdornment>
              ),
            }}
            helperText="Дополнительная информация о зоне хранения"
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !(formData.наименование || '').trim()}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEdit ? (
            'Сохранить'
          ) : (
            'Добавить'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const StoragePage: React.FC = () => {
  const [zones, setZones] = useState<StorageZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedZone, setSelectedZone] = useState<StorageZone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем условия хранения и инициализируем конфиг
      const conditions = await getStorageConditions();
      initStorageConditionsConfig(conditions);
      
      // Загружаем зоны хранения
      const zonesData = await getStorageZones();
      
      // Обеспечиваем, что все поля определены
      const safeZones = zonesData.map(zone => ({
        ...zone,
        наименование: zone.наименование || '',
        условияХранения: zone.условияХранения || '',
        комментарий: zone.комментарий || '',
      }));
      
      setZones(safeZones);
    } catch (error) {
      showSnackbar('Ошибка загрузки данных', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Функция для показа уведомлений
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Безопасная функция для преобразования в нижний регистр
  const safeToLowerCase = (value: string | undefined | null): string => {
    return (value || '').toString().toLowerCase();
  };

  // Фильтрация зон
  const filteredZones = zones.filter(zone => {
    const searchLower = searchTerm.toLowerCase();
    const name = safeToLowerCase(zone.наименование);
    const comment = safeToLowerCase(zone.комментарий);
    
    return name.includes(searchLower) || comment.includes(searchLower);
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, zone: StorageZone) => {
    setAnchorEl(event.currentTarget);
    setSelectedZone(zone);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddZone = () => {
    setIsEditing(false);
    setSelectedZone(null);
    setDialogOpen(true);
  };

  const handleEditZone = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedZone) {
      try {
        setLoading(true);
        await deleteStorageZoneById(selectedZone.id);
        await loadData(); // Перезагружаем данные
        showSnackbar('Зона хранения успешно удалена', 'success');
      } catch (error) {
        showSnackbar('Ошибка при удалении зоны', 'error');
        console.error('Error deleting zone:', error);
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setSelectedZone(null);
      }
    }
  };

  const handleDialogSubmit = async (formData: StorageZoneFormData) => {
    try {
      setLoading(true);
      
      if (isEditing && selectedZone) {
        // Редактирование существующей зоны
        await putStorageZone(selectedZone.id, formData);
        showSnackbar('Зона хранения успешно обновлена', 'success');
      } else {
        // Добавление новой зоны
        await postStorageZone(formData);
        showSnackbar('Зона хранения успешно добавлена', 'success');
      }
      
      // Закрываем диалог и перезагружаем данные
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      showSnackbar(
        isEditing 
          ? 'Ошибка при обновлении зоны' 
          : 'Ошибка при добавлении зоны', 
        'error'
      );
      console.error('Error saving zone:', error);
      throw error;
    } finally {
      setLoading(false);
      setSelectedZone(null);
    }
  };


  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedZone(null);
  };

  if (loading && zones.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок и панель управления */}
      <Box>
        <Typography color="text.secondary" paragraph>
          Управление зонами хранения на складе: добавление, редактирование и удаление
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
              placeholder="Поиск по названию или комментарию..."
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
              disabled={loading}
            />
            
            {/* Статистика */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <Chip
                label={`Всего: ${zones.length}`}
                variant="outlined"
                sx={{ minWidth: 120, justifyContent: 'center' }}
              />
              <Chip 
                label={`Найдено: ${filteredZones.length}`}
                variant="outlined"
                color="primary"
                sx={{ minWidth: 120, justifyContent: 'center' }}
              />
            </Box>
            
            {/* Кнопки управления */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <AdminOnly>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddZone}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#1976d2',
                    minWidth: 170,
                  }}
                >
                  Добавить зону
                </Button>
              </AdminOnly>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Таблица зон хранения */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Наименование</TableCell>
                    <TableCell>Условия хранения</TableCell>
                    <TableCell>Комментарий</TableCell>
                    <AdminOnly>
                      <TableCell align="right">Действия</TableCell>
                    </AdminOnly>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredZones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? 'Зоны не найдены' : 'Нет данных о зонах хранения'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredZones
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((zone) => (
                        <TableRow 
                          key={zone.id}
                          hover
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Warehouse fontSize="small" color="action" />
                              <Typography fontWeight={600}>
                                {zone.наименование || 'Не указано'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={
                              (storageConditionsConfig[zone.условияХранения]?.description || 
                              zone.условияХранения) || 'Не указано'
                            }>
                              <Box>
                                <StorageConditionChip condition={zone.условияХранения} />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {zone.комментарий || 'Нет комментария'}
                            </Typography>
                          </TableCell>
                          <AdminOnly>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, zone)}
                                disabled={loading}
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
              count={filteredZones.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} из ${count}`
              }
              disabled={loading}
            />
          </>
        )}
      </Paper>

      {/* Статистика по типам хранения */}
      {!loading && Object.keys(storageConditionsConfig).length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Распределение зон по типам хранения
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {Object.entries(storageConditionsConfig).map(([key, config]) => {
              const count = zones.filter(z => (z.условияХранения || '') === key).length;
              return (
                <Paper 
                  key={key}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    flex: 1, 
                    minWidth: 180,
                    backgroundColor: config.color || '#f5f5f5',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h5" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {config.label || key}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Меню действий для зоны */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditZone}>
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
      <StorageZoneDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialData={selectedZone ? {
          наименование: selectedZone.наименование || '',
          условияХранения: selectedZone.условияХранения || '',
          комментарий: selectedZone.комментарий || '',
        } : undefined}
        isEdit={isEditing}
        loading={loading}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить зону хранения "{selectedZone?.наименование || 'Неизвестная зона'}"?
          </Alert>
          {selectedZone && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Условия хранения:</strong> {
                  storageConditionsConfig[selectedZone.условияХранения]?.label || 
                  selectedZone.условияХранения ||
                  'Не указано'
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoragePage;