// src/pages/employees/EmployeesPage.tsx
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
  MoreVert,
  Person,
  Email,
  Phone,
  Badge,
  Cake,
  Work,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { 
  Employee, 
  employeesData, 
  EmployeeFormData,
  roleConfig,
  departmentConfig,
} from './makeData';


import AdminOnly from '../../components/AdminOnly';

// Компонент для отображения роли
const RoleChip: React.FC<{ role: Employee['роль'] }> = ({ role }) => {
  const config = roleConfig[role];
  
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

// Компонент для отображения подразделения
const DepartmentChip: React.FC<{ department: Employee['подразделение'] }> = ({ department }) => {
  const config = departmentConfig[department];
  
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

// Модальное окно для добавления/редактирования сотрудника
interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  initialData?: EmployeeFormData;
  isEdit?: boolean;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || {
      фамилия: '',
      имя: '',
      отчество: '',
      email: '',
      телефон: '',
      серияПаспорта: '',
      номерПаспорта: '',
      датаРождения: '',
      роль: 'кладовщик',
      должность: '',
      подразделение: 'склад',
    }
  );

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
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
          <Person />
          {isEdit ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          Личные данные
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
                label="Фамилия"
                value={formData.фамилия}
                onChange={(e) => handleChange('фамилия', e.target.value)}
                fullWidth
                required
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Person fontSize="small" />
                    </InputAdornment>
                ),
                }}
            />
            <TextField
                label="Имя"
                value={formData.имя}
                onChange={(e) => handleChange('имя', e.target.value)}
                fullWidth
                required
            />
            <TextField
                label="Отчество"
                value={formData.отчество}
                onChange={(e) => handleChange('отчество', e.target.value)}
                fullWidth
            />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
                label="Серия паспорта"
                value={formData.серияПаспорта}
                onChange={(e) => handleChange('серияПаспорта', e.target.value)}
                fullWidth
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Badge fontSize="small" />
                    </InputAdornment>
                ),
                }}
            />
            <TextField
                label="Номер паспорта"
                value={formData.номерПаспорта}
                onChange={(e) => handleChange('номерПаспорта', e.target.value)}
                fullWidth
            />
            <TextField
                label="Дата рождения"
                value={formData.датаРождения}
                onChange={(e) => handleChange('датаРождения', e.target.value)}
                fullWidth
                placeholder="дд.мм.гггг"
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Cake fontSize="small" />
                    </InputAdornment>
                ),
                }}
            />
                        </Box>
            Контакты
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
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
            </Box>

            Рабочая информация
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth>
                <InputLabel>Роль</InputLabel>
                <Select
                value={formData.роль}
                label="Роль"
                onChange={(e) => handleChange('роль', e.target.value as Employee['роль'])}
                >
                {Object.entries(roleConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.icon}</span>
                        <Typography>{config.label}</Typography>
                    </Box>
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <TextField
                label="Должность"
                value={formData.должность}
                onChange={(e) => handleChange('должность', e.target.value)}
                fullWidth
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Work fontSize="small" />
                    </InputAdornment>
                ),
                }}
            />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth>
                <InputLabel>Подразделение</InputLabel>
                <Select
                value={formData.подразделение}
                label="Подразделение"
                onChange={(e) => handleChange('подразделение', e.target.value as Employee['подразделение'])}
                >
                {Object.entries(departmentConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.icon}</span>
                        <Typography>{config.label}</Typography>
                    </Box>
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Box>
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

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(employeesData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация сотрудников
  const filteredEmployees = employees.filter(employee =>
    `${employee.фамилия} ${employee.имя} ${employee.отчество}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.должность.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.телефон.includes(searchTerm)
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = () => {
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditEmployee = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id));
    }
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDialogSubmit = (formData: EmployeeFormData) => {
    if (isEditing && selectedEmployee) {
      // Редактирование существующего сотрудника
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmployee.id 
          ? { ...e, ...formData }
          : e
      ));
    } else {
      // Добавление нового сотрудника
      const newEmployee: Employee = {
        id: Math.max(...employees.map(e => e.id)) + 1,
        ...formData,
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
  };

  return (
    <Box>
      {/* Заголовок и панель управления */}
      <Box>
        <Typography color="text.secondary" paragraph>
          Управление сотрудниками: добавление, редактирование и удаление записей
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
              placeholder="Поиск по ФИО, должности, email или телефону..."
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
                label={`Всего: ${employees.length}`}
                variant="outlined"
                sx={{ minWidth: 120, justifyContent: 'center' }}
              />
              <Chip 
                label={`Найдено: ${filteredEmployees.length}`}
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
                onClick={handleAddEmployee}
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
      
      {/* Таблица сотрудников */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ФИО</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Подразделение</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Паспорт</TableCell>
                <AdminOnly>
                  <TableCell align="right">Действия</TableCell>
                </AdminOnly>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow 
                    key={employee.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Box>
                        <Typography fontWeight={600}>
                          {employee.фамилия} {employee.имя} {employee.отчество}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.датаРождения}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {employee.должность}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <RoleChip role={employee.роль} />
                    </TableCell>
                    <TableCell>
                      <DepartmentChip department={employee.подразделение} />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {employee.email}
                        </Typography>
                        <Typography variant="body2">
                          {employee.телефон}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.серияПаспорта} {employee.номерПаспорта}
                      </Typography>
                    </TableCell>
                    <AdminOnly>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, employee)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                      </AdminOnly>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEmployees.length}
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

      {/* Статистика по отделам */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Распределение сотрудников по подразделениям
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(departmentConfig).map(([key, config]) => {
            const count = employees.filter(e => e.подразделение === key).length;
            return (
              <Paper 
                key={key}
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

      {/* Меню действий для сотрудника */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditEmployee}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог добавления/редактирования */}
      <EmployeeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        isEdit={isEditing}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить сотрудника "{selectedEmployee?.фамилия} {selectedEmployee?.имя} {selectedEmployee?.отчество}"?
          </Alert>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Должность:</strong> {selectedEmployee.должность}
              </Typography>
              <Typography variant="body2">
                <strong>Подразделение:</strong> {departmentConfig[selectedEmployee.подразделение].label}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {selectedEmployee.email}
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

export default EmployeesPage;