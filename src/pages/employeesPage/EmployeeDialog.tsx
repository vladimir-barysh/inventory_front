// src/pages/employeesPage/EmployeeDialog.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Person, Email, Phone, Badge, Cake } from "@mui/icons-material";
import { Employee, EmployeeFormData } from "models/employee.model";
import { Role, Position, Subdivision } from "models/common";

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  initialData?: EmployeeFormData;
  isEdit?: boolean;
  employee?: Employee | null;
  positionsList: Position[];
  subdivisionsList: Subdivision[];
  rolesList: Role[];
}

const translit = (text: string): string => {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    c: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("")
    .replace(/[^a-z]/g, "");
};

const generateLogin = (firstName: string, lastName: string): string => {
  return `${translit(firstName[0])}.${
    translit(lastName) + Math.random().toString(36).substr(2, 5)
  }`;
};

const generatePassword = (length = 10): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789" +
    "!@#$%";

  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  employee,
  positionsList,
  subdivisionsList,
  rolesList,
}) => {
  const [localData, setLocalData] = useState<EmployeeFormData>({
    login: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    number_phone: "",
    passport_series: "",
    passport_number: "",
    date_birth: "",
    role_id: 0,
    position_id: 0,
    subdivision_id: 0,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormData, string>>
  >({});

  const [showTestDataBtn, setShowTestDataBtn] = useState(!isEdit);
  const fillWithTestData = () => {
    const testData: EmployeeFormData = {
      login: "",
      password: "",
      last_name: "Иванов",
      first_name: "Иван",
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      number_phone: "+7 (999) 123-45-67",
      passport_series: "1234",
      passport_number: "567890",
      date_birth: "05.12.1995", // используем yyyy-mm-dd для консистентности
      role_id: rolesList.length > 0 ? rolesList[0].id : 0,
      position_id: positionsList.length > 0 ? positionsList[0].id : 0,
      subdivision_id: subdivisionsList.length > 0 ? subdivisionsList[0].id : 0,
    };

    setLocalData(testData);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!localData.last_name.trim()) newErrors.last_name = "Обязательное поле";
    if (!localData.first_name.trim())
      newErrors.first_name = "Обязательное поле";

    if (localData.email) {
      // проверяем только если заполнено
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email)) {
        newErrors.email = "Некорректный email";
      }
    }

    // Телефон
    if (localData.number_phone) {
      // проверяем только если заполнено
      if (!/^[\d+\-\s()]+$/.test(localData.number_phone)) {
        newErrors.number_phone = "Некорректный телефон";
      }
    }

    if (!localData.passport_series.trim())
      newErrors.passport_series = "Обязательное поле";
    else if (!/^\d{4}$/.test(localData.passport_series))
      newErrors.passport_series = "4 цифры";

    if (!localData.passport_number.trim())
      newErrors.passport_number = "Обязательное поле";
    else if (!/^\d{6}$/.test(localData.passport_number))
      newErrors.passport_number = "6 цифр";

    if (
      localData.date_birth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(localData.date_birth)
    ) {
      errors.date_birth = "Неверный формат даты";
    }

    if (!localData.role_id || localData.role_id === 0)
      newErrors.role_id = "Обязательное поле";
    if (!localData.position_id || localData.position_id === 0)
      newErrors.position_id = "Обязательное поле";
    if (!localData.subdivision_id || localData.subdivision_id === 0)
      newErrors.subdivision_id = "Обязательное поле";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (employee) {
      setLocalData({
        login: employee.login || "",
        password: employee.password || "",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        number_phone: employee.number_phone || "",
        passport_series: employee.passport_series.toString(),
        passport_number: employee.passport_number.toString(),
        date_birth: employee.date_birth || "",
        role_id: employee.role_id || 0,
        position_id: employee.position_id || 0,
        subdivision_id: employee.subdivision_id || 0,
      });
    } else {
      setLocalData({
        login: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        number_phone: "",
        passport_series: "",
        passport_number: "",
        date_birth: "",
        role_id: 0,
        position_id: 0,
        subdivision_id: 0,
      });
    }
  }, [employee, open]);

  const handleChange = (
    field: keyof EmployeeFormData,
    value: string | number | null
  ) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmitForm = () => {
    if (!validateForm()) return;

    let dataToSubmit = { ...localData };

    if (!isEdit) {
      dataToSubmit.login = generateLogin(
        localData.first_name,
        localData.last_name
      );
      dataToSubmit.password = generatePassword();
    }

    onSubmit(dataToSubmit);
    onClose();
  };

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";

    // Разделяем строку "2023-12-25" на части
    const [year, month, day] = dateStr.split("-");

    // Проверяем, что все части существуют
    if (!year || !month || !day) return dateStr;

    // Форматируем как "dd-mm-yyyy"
    return `${day}.${month}.${year}`;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          {isEdit ? "Редактировать сотрудника" : "Добавить нового сотрудника"}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
          {isEdit && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              <TextField
                label="Логин *"
                value={localData.login}
                onChange={(e) => handleChange("login", e.target.value)}
                fullWidth
                required
                error={!!errors.login}
                helperText={errors.login}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Пароль *"
                value={localData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password}
              />
            </Box>
          )}
          <Typography variant="subtitle1" fontWeight={600}>
            Личные данные
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              label="Фамилия *"
              value={localData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              fullWidth
              required
              error={!!errors.last_name}
              helperText={errors.last_name}
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
              value={localData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              fullWidth
              required
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              label="Серия паспорта *"
              value={localData.passport_series}
              onChange={(e) => handleChange("passport_series", e.target.value)}
              fullWidth
              error={!!errors.passport_series}
              helperText={errors.passport_series}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge fontSize="small" />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 4 },
              }}
            />

            <TextField
              label="Номер паспорта *"
              value={localData.passport_number}
              onChange={(e) => handleChange("passport_number", e.target.value)}
              fullWidth
              error={!!errors.passport_number}
              helperText={errors.passport_number}
              inputProps={{ maxLength: 6 }}
            />

            <TextField
              label="Дата рождения"
              type="date"
              value={localData.date_birth || ""}
              onChange={(e) => handleChange("date_birth", e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true, // чтобы label не перекрывался
              }}
              inputProps={{
                max: new Date().toISOString().split("T")[0], // запрет будущих дат
              }}
            />
          </Box>

          <Typography variant="subtitle1" fontWeight={600}>
            Контакты
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              label="Email *"
              type="email"
              value={localData.email}
              onChange={(e) => handleChange("email", e.target.value)}
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
              value={localData.number_phone}
              onChange={(e) => handleChange("number_phone", e.target.value)}
              fullWidth
              error={!!errors.number_phone}
              helperText={errors.number_phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="subtitle1" fontWeight={600}>
            Рабочая информация
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <FormControl fullWidth required error={!!errors.role_id}>
              <InputLabel>Роль *</InputLabel>
              <Select
                value={localData.role_id}
                label="Роль *"
                onChange={(e) =>
                  handleChange("role_id", Number(e.target.value))
                }
              >
                {rolesList.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.role_id && (
                <Typography color="error" variant="caption">
                  {errors.role_id}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!errors.position_id}>
              <InputLabel>Должность *</InputLabel>
              <Select
                value={localData.position_id}
                label="Должность *"
                onChange={(e) =>
                  handleChange("position_id", Number(e.target.value))
                }
              >
                {positionsList.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.position_id && (
                <Typography color="error" variant="caption">
                  {errors.position_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <FormControl fullWidth required error={!!errors.subdivision_id}>
              <InputLabel>Подразделение *</InputLabel>
              <Select
                value={localData.subdivision_id}
                label="Подразделение *"
                onChange={(e) =>
                  handleChange("subdivision_id", Number(e.target.value))
                }
              >
                {subdivisionsList.map((subdivision) => (
                  <MenuItem key={subdivision.id} value={subdivision.id}>
                    {subdivision.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.subdivision_id && (
                <Typography color="error" variant="caption">
                  {errors.subdivision_id}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        {showTestDataBtn && !isEdit && (
          <Box sx={{ px: 3, py: 1 }}>
            <Button
              onClick={fillWithTestData}
              variant="outlined"
              size="small"
              fullWidth
            >
              Заполнить тестовыми данными
            </Button>
          </Box>
        )}
        <Button onClick={handleSubmitForm} variant="contained" color="primary">
          {isEdit ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDialog;
