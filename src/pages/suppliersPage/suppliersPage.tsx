// src/pages/suppliers/SuppliersPage.tsx
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
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Business,
  Person,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { Supplier, suppliersData, SupplierFormData } from './makeData';

// Компонент для типа организации
const TypeChip: React.FC<{ type: Supplier['тип'] }> = ({ type }) => {
  const typeConfig = {
    'ООО': { bgcolor: '#e3f2fd', color: '#1565c0' },
    'ИП': { bgcolor: '#f3e5f5', color: '#7b1fa2' },
    'АО': { bgcolor: '#e8f5e9', color: '#2e7d32' },
    'ЗАО': { bgcolor: '#fff3e0', color: '#ef6c00' },
  };

  const config = typeConfig[type];
  
  return (
    <Chip
      label={type}
      size="small"
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        fontWeight: 500,
      }}
    />
  );
};

// Модальное окно для добавления/редактирования поставщика
interface SupplierDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: SupplierFormData;
  isEdit?: boolean;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState<SupplierFormData>(
    initialData || {
      тип: 'ООО',
      наименование: '',
      контактноеЛицо: '',
      телефон: '',
      email: '',
      адрес: '',
    }
  );

  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактировать поставщика' : 'Добавить нового поставщика'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Тип организации</InputLabel>
            <Select
              value={formData.тип}
              label="Тип организации"
              onChange={(e) => handleChange('тип', e.target.value)}
            >
              <MenuItem value="ООО">ООО</MenuItem>
              <MenuItem value="ИП">ИП</MenuItem>
              <MenuItem value="АО">АО</MenuItem>
              <MenuItem value="ЗАО">ЗАО</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Наименование"
            value={formData.наименование}
            onChange={(e) => handleChange('наименование', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Контактное лицо"
            value={formData.контактноеЛицо}
            onChange={(e) => handleChange('контактноеЛицо', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Телефон"
            value={formData.телефон}
            onChange={(e) => handleChange('телефон', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Адрес"
            value={formData.адрес}
            onChange={(e) => handleChange('адрес', e.target.value)}
            fullWidth
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn fontSize="small" />
                </InputAdornment>
              ),
            }}
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

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация поставщиков
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.наименование.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.контактноеЛицо.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.телефон.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplier);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSupplier(null);
  };

  const handleAddSupplier = () => {
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditSupplier = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedSupplier) {
      setSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id));
    }
    setDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleDialogSubmit = (formData: SupplierFormData) => {
    if (isEditing && selectedSupplier) {
      // Редактирование существующего поставщика
      setSuppliers(prev => prev.map(s => 
        s.id === selectedSupplier.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      // Добавление нового поставщика
      const newSupplier: Supplier = {
        id: Math.max(...suppliers.map(s => s.id)) + 1,
        ...formData,
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и панель управления */}
      <Box sx={{ mb: 4 }}>
        <Typography color="text.secondary" paragraph>
          Управление информацией о поставщиках: добавление, редактирование и удаление записей
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
            placeholder="Поиск по названию, контактному лицу, телефону, почте"
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
                label={`Всего: ${suppliers.length}`}
                variant="outlined"
                sx={{ minWidth: 120, justifyContent: 'center' }}
            />
            <Chip 
                label={`Найдено: ${filteredSuppliers.length}`}
                variant="outlined"
                color="primary"
                sx={{ minWidth: 120, justifyContent: 'center' }}
            />
            </Box>
            
            {/* Кнопка добавления */}
            <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddSupplier}
            sx={{ 
                backgroundColor: '#1976d2',
                minWidth: 170,
                alignSelf: { xs: 'stretch', md: 'center' }
            }}
            >
            Добавить
            </Button>
        </Box>
        </Paper>
      </Box>
      
      {/* Таблица поставщиков */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Наименование</TableCell>
                <TableCell>Контактное лицо</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((supplier) => (
                  <TableRow 
                    key={supplier.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <TypeChip type={supplier.тип} />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {supplier.наименование}
                      </Typography>
                    </TableCell>
                    <TableCell>{supplier.контактноеЛицо}</TableCell>
                    <TableCell>{supplier.телефон}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.адрес}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, supplier)}
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
          count={filteredSuppliers.length}
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

      {/* Меню действий для поставщика */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditSupplier}>
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
      <SupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialData={selectedSupplier || undefined}
        isEdit={isEditing}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить поставщика "{selectedSupplier?.наименование}"?
            Это действие нельзя отменить.
          </Alert>
          {selectedSupplier && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Контактное лицо:</strong> {selectedSupplier.контактноеЛицо}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Телефон:</strong> {selectedSupplier.телефон}
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

export default SuppliersPage;