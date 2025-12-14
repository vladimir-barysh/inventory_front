// src/pages/employees/EmployeesPage.tsx
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
  API_BASE,
  Employee, 
  EmployeeFormData,
  getEmployees,
  initPositionConfig,
  initDepartmentConfig,
  initRoleConfig,
  getPositions,
  getSubdivisions,
  mapEmployees,
  getRoles, 
  postEmployee,
  buildIdNameMap,
  roleConfig,
  departmentConfig,
  positionConfig,
  Position,
  Subdivision,
  Role,
} from './makeData';
import AdminOnly from '../../components/AdminOnly';

// Компонент для отображения роли
const RoleChip: React.FC<{ role: string }> = ({ role }) => {
  const config = roleConfig[role];
  console.log('RoleChip render', role, roleConfig[role]);


  return (
    <Chip
      label={config?.label ?? role}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? '#eee',
        color: config?.color ?? '#555',
        fontWeight: 500,
      }}
    />
  );
};

// Компонент для отображения подразделения
const DepartmentChip: React.FC<{ department: string }> = ({ department }) => {
  const config = departmentConfig[department];

  return (
    <Chip
      label={config?.label ?? department}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? '#eee',
        color: config?.color ?? '#555',
        fontWeight: 500,
      }}
    />
  );
};

// Компонент для отображения должности
const PositionChip: React.FC<{ position: string }> = ({ position }) => {
  const config = positionConfig[position];

  return (
    <Chip
      label={config?.label ?? position}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? '#eee',
        color: config?.color ?? '#555',
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
  positionsList: Position[]; 
  subdivisionsList: Subdivision[];
  rolesList: Role[];
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false,
  positionsList,
  subdivisionsList,
  rolesList
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || {
      фамилия: '',
      имя: '',
      email: '',
      телефон: '',
      серияПаспорта: '',
      номерПаспорта: '',
      датаРождения: '',
      роль: '',
      должность: '',
      подразделение: '',
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.фамилия.trim()) newErrors.фамилия = 'Обязательное поле';
    if (!formData.имя.trim()) newErrors.имя = 'Обязательное поле';
    if (!formData.email.trim()) newErrors.email = 'Обязательное поле';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный email';
    
    if (!formData.телефон.trim()) newErrors.телефон = 'Обязательное поле';
    else if (!/^[\d+\-\s()]+$/.test(formData.телефон)) newErrors.телефон = 'Некорректный телефон';
    
    if (!formData.серияПаспорта.trim()) newErrors.серияПаспорта = 'Обязательное поле';
    else if (!/^\d{4}$/.test(formData.серияПаспорта)) newErrors.серияПаспорта = '4 цифры';
    
    if (!formData.номерПаспорта.trim()) newErrors.номерПаспорта = 'Обязательное поле';
    else if (!/^\d{6}$/.test(formData.номерПаспорта)) newErrors.номерПаспорта = '6 цифр';
    
    if (!formData.датаРождения.trim()) newErrors.датаРождения = 'Обязательное поле';
    else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.датаРождения)) newErrors.датаРождения = 'Формат: дд.мм.гггг';
    
    if (!formData.роль) newErrors.роль = 'Обязательное поле';
    if (!formData.должность) newErrors.должность = 'Обязательное поле';
    if (!formData.подразделение) newErrors.подразделение = 'Обязательное поле';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>Личные данные</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <TextField
              label="Фамилия *"
              value={formData.фамилия}
              onChange={(e) => handleChange('фамилия', e.target.value)}
              fullWidth
              required
              error={!!errors.фамилия}
              helperText={errors.фамилия}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Имя *"
              value={formData.имя}
              onChange={(e) => handleChange('имя', e.target.value)}
              fullWidth
              required
              error={!!errors.имя}
              helperText={errors.имя}
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              label="Серия паспорта *"
              value={formData.серияПаспорта}
              onChange={(e) => handleChange('серияПаспорта', e.target.value)}
              fullWidth
              error={!!errors.серияПаспорта}
              helperText={errors.серияПаспорта}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge fontSize="small" />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 4 }
              }}
            />
            <TextField
              label="Номер паспорта *"
              value={formData.номерПаспорта}
              onChange={(e) => handleChange('номерПаспорта', e.target.value)}
              fullWidth
              error={!!errors.номерПаспорта}
              helperText={errors.номерПаспорта}
              inputProps={{ maxLength: 6 }}
            />
            <TextField
              label="Дата рождения *"
              value={formData.датаРождения}
              onChange={(e) => handleChange('датаРождения', e.target.value)}
              fullWidth
              placeholder="дд.мм.гггг"
              error={!!errors.датаРождения}
              helperText={errors.датаРождения}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Cake fontSize="small" />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 10 }
              }}
            />
          </Box>

          <Typography variant="subtitle1" fontWeight={600}>Контакты</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Телефон *"
              value={formData.телефон}
              onChange={(e) => handleChange('телефон', e.target.value)}
              fullWidth
              error={!!errors.телефон}
              helperText={errors.телефон}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="subtitle1" fontWeight={600}>Рабочая информация</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth required error={!!errors.роль}>
              <InputLabel>Роль *</InputLabel>
              <Select
                value={formData.роль}
                label="Роль *"
                onChange={(e) => handleChange('роль', e.target.value)}
              >
                {rolesList.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.роль && <Typography color="error" variant="caption">{errors.роль}</Typography>}
            </FormControl>

            <FormControl fullWidth required error={!!errors.должность}>
              <InputLabel>Должность *</InputLabel>
              <Select
                value={formData.должность}
                label="Должность *"
                onChange={(e) => handleChange('должность', e.target.value)}
              >
                {positionsList.map((position) => (
                  <MenuItem key={position.id} value={position.name}>
                    {position.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.должность && <Typography color="error" variant="caption">{errors.должность}</Typography>}
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth required error={!!errors.подразделение}>
              <InputLabel>Подразделение *</InputLabel>
              <Select
                value={formData.подразделение}
                label="Подразделение *"
                onChange={(e) => handleChange('подразделение', e.target.value)}
              >
                {subdivisionsList.map((subdivision) => (
                  <MenuItem key={subdivision.id} value={subdivision.name}>
                    {subdivision.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.подразделение && <Typography color="error" variant="caption">{errors.подразделение}</Typography>}
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionsList, setPositionsList] = useState<Position[]>([]);
  const [subdivisionsList, setSubdivisionsList] = useState<Subdivision[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Загружаем справочники и сотрудников параллельно
      const [roles, positions, subdivisions, employeesApi] = await Promise.all([
        getRoles(),
        getPositions(),
        getSubdivisions(),
        fetch(`${API_BASE}/employees/`).then(r => r.json()), // получаем EmployeeApi[]
      ]);
      setRolesList(roles);
      setPositionsList(positions);
      setSubdivisionsList(subdivisions);

      // Инициализируем конфигурации для отображения
      initPositionConfig(positions);
      initDepartmentConfig(subdivisions);
      initRoleConfig(roles);

      // Маппинг сотрудников с id → name
      const mappedEmployees = mapEmployees(employeesApi, roles, positions, subdivisions);

      setEmployees(mappedEmployees);

      // Для отладки
      console.log('Загруженные роли:', roles);
      console.log('Загруженные позиции:', positions);
      console.log('Загруженные подразделения:', subdivisions);
      console.log('Сотрудники после маппинга:', mappedEmployees);
      console.log('roleConfig:', roleConfig);
      console.log('positionConfig:', positionConfig);
      console.log('departmentConfig:', departmentConfig);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  // Фильтрация сотрудников
  const filteredEmployees = employees.filter(employee =>
    `${employee.фамилия} ${employee.имя}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleDialogSubmit = async (formData: EmployeeFormData) => {
    if (isEditing && selectedEmployee) {
      // Редактирование существующего сотрудника
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmployee.id 
          ? { ...e, ...formData }
          : e
      ));
    } else {
      const [roles, positions, subdivisions] = await Promise.all([
        getRoles(),
        getPositions(),
        getSubdivisions()
      ]);

      const newEmployeeFromServer = await postEmployee(formData, roles, positions, subdivisions);
      const roleMap = buildIdNameMap(roles);
      const positionMap = buildIdNameMap(positions);
      const subdivisionMap = buildIdNameMap(subdivisions);
      
      const newEmployee: Employee = {
        id: newEmployeeFromServer.id,
        фамилия: formData.фамилия,
        имя: formData.имя,
        email: formData.email,
        телефон: formData.телефон,
        серияПаспорта: formData.серияПаспорта,
        номерПаспорта: formData.номерПаспорта,
        датаРождения: formData.датаРождения,
        роль: formData.роль,
        должность: formData.должность,
        подразделение: formData.подразделение,
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
                          {employee.фамилия} {employee.имя}                         </Typography>
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
        positionsList={positionsList}
        subdivisionsList={subdivisionsList}
        rolesList={rolesList}
        initialData={isEditing && selectedEmployee ? {
          фамилия: selectedEmployee.фамилия,
          имя: selectedEmployee.имя,
          email: selectedEmployee.email,
          телефон: selectedEmployee.телефон,
          серияПаспорта: selectedEmployee.серияПаспорта,
          номерПаспорта: selectedEmployee.номерПаспорта,
          датаРождения: selectedEmployee.датаРождения,
          роль: selectedEmployee.роль,
          должность: selectedEmployee.должность,
          подразделение: selectedEmployee.подразделение,
        } : undefined}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить сотрудника "{selectedEmployee?.фамилия} {selectedEmployee?.имя}"?
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