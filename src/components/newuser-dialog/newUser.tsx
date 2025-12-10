import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  Select, FormControl, InputLabel,
  Snackbar
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  ExitToApp,
  Email,
} from '@mui/icons-material';

import { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import apiClient from '../../api/axios';

interface NewUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // callback при успешном создании
}

interface NewUserData {
  login: string;        // опционально, если сервер возвращает
  password: string,
  first_name: string;   // опционально
  last_name: string;    // опционально
  passport_series: number,
  passport_number: number,
  email?: string,
  number_phone?: string,
  date_birth?: Dayjs | null,
  position_id: number,
  subdivision_id: number,
  role_id: number;      // опционально
  
}

interface Role {
  id: number;
  name: string;
}

interface Position {
    id: number;
    name: string;
}
interface Subdivision {
    id: number;
    name: string;
}
// Роли для выпадающего списка
const ROLES: Role[] = [
    { id: 1, name: 'Администратор' },
    { id: 4, name: 'Пользователь' },
  ];

// Должности (замените на реальные из вашей БД)
const POSITIONS: Position[] = [
    { id: 1, name: 'Кладовщик' },
  ];

// Подразделения (замените на реальные из вашей БД)
const SUBDIVISIONS: Subdivision[] = [
  { id: 1, name: 'Складское' },
];

export const NewUserDialog: React.FC<NewUserDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<NewUserData>({
    login: '',
    password: '',
    first_name: '',
    last_name: '',
    passport_series: 0,
    passport_number: 0,
    email: '',
    number_phone: '',
    date_birth: null,
    position_id: 0,
    subdivision_id: 0,
    role_id: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  // Обработчик изменения полей
  const handleChange = (field: keyof NewUserData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError(''); // Сбрасываем ошибку при изменении
  };

  const handleDateChange = (date: Dayjs | null) => {
    setFormData({
      ...formData,
      date_birth: date,
    });
  };

  const handleSelectChange = (field: keyof NewUserData) => (event: SelectChangeEvent<number>) => {
    setFormData({
        ...formData,
        [field]: Number(event.target.value) || 0,
    });
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const requiredFields: (keyof NewUserData)[] = [
      'login',
      'password',
      'first_name',
      'last_name',
      'passport_series',
      'passport_number',
      'email',
      'number_phone',
      'role_id',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Поле "${getFieldLabel(field)}" обязательно для заполнения`);
        return false;
      }
    }

    // Для email
    if (formData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Введите корректный email');
        return false;
    }
    }

    // Для номера телефона
    if (formData.number_phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.number_phone)) {
        setError('Введите корректный номер телефона');
        return false;
    }
    }

    return true;
  };

  // Получение названия поля для ошибок
  const getFieldLabel = (field: keyof NewUserData): string => {
    const labels: Record<keyof NewUserData, string> = {
      login: 'Логин',
      password: 'Пароль',
      first_name: 'Имя',
      last_name: 'Фамилия',
      passport_series: 'Серия паспорта',
      passport_number: 'Номер паспорта',
      email: 'Email',
      number_phone: 'Телефон',
      date_birth: 'Дата рождения',
      position_id: 'Должность',
      subdivision_id: 'Подразделение',
      role_id: 'Роль',
    };
    return labels[field];
  };

  // Обработчик отправки формы
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Вызов процедуры создания пользователя
      const response = await apiClient.post('/employees/create', {
        login: formData.login,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        passport_series: formData.passport_series,
        passport_number: formData.passport_number,
        email: formData.email,
        number_phone: formData.number_phone,
        date_birth: formData.date_birth?.format('YYYY-MM-DD') || null,
        position_id: formData.position_id || 0,
        subdivision_id: formData.subdivision_id || 0,
        role_id: formData.role_id,
      });

      console.log('Пользователь создан:', response.data);

      setSuccessMessage('Пользователь успешно создан!');
      setShowSuccess(true);

      // Закрываем диалог и сбрасываем форму
      setTimeout(() => {
        handleClose();
        setShowSuccess(false);
      }, 2000);
      
      // Вызываем callback если нужно обновить список пользователей
      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
      console.error('Ошибка создания пользователя:', err);
      
      // Пытаемся получить понятное сообщение об ошибке
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Ошибка создания пользователя';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие диалога с сбросом формы
  const handleClose = () => {
    setFormData({
        login: '',
        password: '',
        first_name: '',
        last_name: '',
        passport_series: 0,
        passport_number: 0,
        email: '',
        number_phone: '',
        date_birth: null,
        position_id: 0,
        subdivision_id: 0,
        role_id: 0,
    });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
            <Typography variant="h6" component="div">
            Создание нового пользователя
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Заполните все обязательные поля
            </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
            <DialogContent>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                </Alert>
            )}
            <Grid container spacing={2}>
                {/* Логин и пароль */}
                <Grid >
                <TextField
                    fullWidth
                    label="Логин *"
                    value={formData.login}
                    onChange={handleChange('login')}
                    margin="normal"
                    required
                    disabled={loading}
                />
                </Grid>
                <Grid>
                <TextField
                    fullWidth
                    label="Пароль *"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    margin="normal"
                    required
                    disabled={loading}
                />
                </Grid>

                {/* Имя и фамилия */}
                <Grid>
                <TextField
                    fullWidth
                    label="Имя *"
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    margin="normal"
                    required
                    disabled={loading}
                />
                </Grid>
                <Grid>
                <TextField
                    fullWidth
                    label="Фамилия *"
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    margin="normal"
                    required
                    disabled={loading}
                />
                </Grid>

                {/* Паспортные данные */}
                <Grid >
                <TextField
                    fullWidth
                    label="Серия паспорта *"
                    value={formData.passport_series}
                    onChange={handleChange('passport_series')}
                    margin="normal"
                    required
                    disabled={loading}
                    inputProps={{ maxLength: 4 }}
                />
                </Grid>
                <Grid>
                <TextField
                    fullWidth
                    label="Номер паспорта *"
                    value={formData.passport_number}
                    onChange={handleChange('passport_number')}
                    margin="normal"
                    required
                    disabled={loading}
                    inputProps={{ maxLength: 6 }}
                />
                </Grid>

                {/* Контактная информация */}
                <Grid>
                <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    margin="normal"
                    required
                    disabled={loading}
                />
                </Grid>
                <Grid>
                <TextField
                    fullWidth
                    label="Телефон *"
                    value={formData.number_phone}
                    onChange={handleChange('number_phone')}
                    margin="normal"
                    required
                    disabled={loading}
                    placeholder="+7 (XXX) XXX-XX-XX"
                />
                </Grid>

                {/* Дата рождения */}
                <Grid>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    label="Дата рождения"
                    value={formData.date_birth}
                    onChange={handleDateChange}
                    slotProps={{
                        textField: {
                        fullWidth: true,
                        margin: 'normal',
                        disabled: loading,
                        },
                    }}
                    />
                </LocalizationProvider>
                </Grid>

                {/* Роль */}
                <Grid>
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Роль *</InputLabel>
                    <Select
                    label="Роль *"
                    value={formData.role_id}
                    onChange={handleSelectChange('role_id')}
                    disabled={loading}
                    >
                    <MenuItem value={0}>
                        <em>Выберите роль</em>
                    </MenuItem>
                    {ROLES.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                        {role.name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                {/* Должность */}
                <Grid >
                <FormControl fullWidth margin="normal">
                    <InputLabel>Должность</InputLabel>
                    <Select
                    label="Должность"
                    value={formData.position_id}
                    onChange={handleSelectChange('position_id')}
                    disabled={loading}
                    >
                    <MenuItem value={0}>
                        <em>Не указано</em>
                    </MenuItem>
                    {POSITIONS.map((position) => (
                        <MenuItem key={position.id} value={position.id}>
                        {position.name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                {/* Подразделение */}
                <Grid>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Подразделение</InputLabel>
                    <Select
                    label="Подразделение"
                    value={formData.subdivision_id}
                    onChange={handleSelectChange('subdivision_id')}
                    disabled={loading}
                    >
                    <MenuItem value={0}>
                        <em>Не указано</em>
                    </MenuItem>
                    {SUBDIVISIONS.map((subdivision) => (
                        <MenuItem key={subdivision.id} value={subdivision.id}>
                        {subdivision.name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                * Обязательные поля
                </Typography>
            </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
                onClick={handleClose} 
                disabled={loading}
                variant="outlined"
            >
                Отмена
            </Button>
            <Button 
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
            >
                {loading ? 'Создание...' : 'Создать пользователя'}
            </Button>
            </DialogActions>
        </form>
        </Dialog>
        
        <Snackbar
            open={showSuccess}
            autoHideDuration={3000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
            <Alert 
            onClose={() => setShowSuccess(false)} 
            severity="success" 
            variant="filled"
            sx={{ width: '100%' }}
            >
            {successMessage}
            </Alert>
        </Snackbar>
    </>
  );
};

export default NewUserDialog;