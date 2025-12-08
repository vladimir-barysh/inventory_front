// src/pages/storage/StoragePage.tsx
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
  Tooltip,
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
} from '@mui/icons-material';
import { 
  StorageZone, 
  storageZonesData, 
  StorageZoneFormData,
  storageConditionsConfig,
} from './makeData';

// Компонент для отображения условий хранения
const StorageConditionChip: React.FC<{ condition: StorageZone['условияХранения'] }> = ({ condition }) => {
  const config = storageConditionsConfig[condition];
  
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
  onSubmit: (data: StorageZoneFormData) => void;
  initialData?: StorageZoneFormData;
  isEdit?: boolean;
}

const StorageZoneDialog: React.FC<StorageZoneDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState<StorageZoneFormData>(
    initialData || {
      наименование: '',
      условияХранения: 'сухое',
      комментарий: '',
    }
  );

  const handleChange = (field: keyof StorageZoneFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
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
            value={formData.наименование}
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
          />

          <FormControl fullWidth>
            <InputLabel>Условия хранения</InputLabel>
            <Select
              value={formData.условияХранения}
              label="Условия хранения"
              onChange={(e) => handleChange('условияХранения', e.target.value as StorageZone['условияХранения'])}
            >
              {Object.entries(storageConditionsConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{config.icon}</span>
                    <Box>
                      <Typography>{config.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  <Info fontSize="small" />
                </InputAdornment>
              ),
            }}
            helperText="Дополнительная информация о зоне хранения"
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

export const StoragePage: React.FC = () => {
  const [zones, setZones] = useState<StorageZone[]>(storageZonesData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedZone, setSelectedZone] = useState<StorageZone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация зон
  const filteredZones = zones.filter(zone =>
    zone.наименование.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.комментарий.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setSelectedZone(null);
  };

  const handleAddZone = () => {
    setIsEditing(false);
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

  const handleDeleteConfirm = () => {
    if (selectedZone) {
      setZones(prev => prev.filter(z => z.id !== selectedZone.id));
    }
    setDeleteDialogOpen(false);
    setSelectedZone(null);
  };

  const handleDialogSubmit = (formData: StorageZoneFormData) => {
    if (isEditing && selectedZone) {
      // Редактирование существующей зоны
      setZones(prev => prev.map(z => 
        z.id === selectedZone.id 
          ? { ...z, ...formData }
          : z
      ));
    } else {
      // Добавление новой зоны
      const newZone: StorageZone = {
        id: Math.max(...zones.map(z => z.id)) + 1,
        ...formData,
      };
      setZones(prev => [...prev, newZone]);
    }
  };

  // Статистика
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
            
            {/* Кнопка добавления */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddZone}
              sx={{ 
                backgroundColor: '#1976d2',
                minWidth: 170,
                alignSelf: { xs: 'stretch', md: 'center' }
              }}
            >
              Добавить зону
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Таблица зон хранения */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Наименование</TableCell>
                <TableCell>Условия хранения</TableCell>
                <TableCell>Комментарий</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredZones
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
                          {zone.наименование}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={storageConditionsConfig[zone.условияХранения].description}>
                        <Box>
                          <StorageConditionChip condition={zone.условияХранения} />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {zone.комментарий}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, zone)}
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
          count={filteredZones.length}
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

      {/* Статистика по типам хранения */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Распределение зон по типам хранения
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Object.entries(storageConditionsConfig).map(([key, config]) => {
            const count = zones.filter(z => z.условияХранения === key).length;
            return (
              <Paper 
                key={key}
                elevation={0}
                sx={{ 
                  p: 2, 
                  flex: 1, 
                  minWidth: 180,
                  backgroundColor: config.color,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4">{config.icon}</Typography>
                  <Typography variant="h5" fontWeight={600}>
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
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialData={selectedZone || undefined}
        isEdit={isEditing}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить зону хранения "{selectedZone?.наименование}"?
          </Alert>
          {selectedZone && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Условия хранения:</strong> {storageConditionsConfig[selectedZone.условияХранения].label}
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
  );
};

export default StoragePage;