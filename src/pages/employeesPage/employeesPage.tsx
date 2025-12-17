// src/pages/employeesPage/EmployeesPage.tsx
import React, { useState, useEffect } from "react";
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
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  API_BASE,
  initPositionConfig,
  initDepartmentConfig,
  initRoleConfig,
  getPositions,
  getSubdivisions,
  getRoles,
  departmentConfig,
} from "./makeData";
import { Role, Position, Subdivision } from "models/common";
import { Employee, EmployeeFormData } from "models/employee.model";
import AdminOnly from "../../components/AdminOnly";
import { postEmployee, updateEmployee, deleteEmployee } from "api/employee.api";

import EmployeeDialog from "./EmployeeDialog";
import { RoleChip, DepartmentChip, PositionChip } from "./EmployeeChips";


export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionsList, setPositionsList] = useState<Position[]>([]);
  const [subdivisionsList, setSubdivisionsList] = useState<Subdivision[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем справочники
        const [roles, positions, subdivisions, employeesApi] =
          await Promise.all([
            getRoles(),
            getPositions(),
            getSubdivisions(),
            fetch(`${API_BASE}/employees/`).then((r) => r.json()), // EmployeeApi[]
          ]);

        setRolesList(roles);
        setPositionsList(positions);
        setSubdivisionsList(subdivisions);

        initPositionConfig(positions);
        initDepartmentConfig(subdivisions);
        initRoleConfig(roles);

        // Преобразуем сотрудников прямо в Employee
        const employeesFromApi: Employee[] = employeesApi.map((e: any) => ({
          id: e.id, // ID обязателен для Employee
          login: e.login,
          password: e.password,
          first_name: e.first_name || "",
          last_name: e.last_name || "",
          email: e.email || "",
          number_phone: e.number_phone || "",
          passport_series: Number(e.passport_series) || 0,
          passport_number: Number(e.passport_number) || 0,
          date_birth: e.date_birth || "",
          role_id: e.role_id || 0,
          position_id: e.position_id || 0,
          subdivision_id: e.subdivision_id || 0,
        }));

        setEmployees(employeesFromApi);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Фильтрация сотрудников
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.last_name ?? ""} ${
      employee.first_name ?? ""
    }`.toLowerCase();
    const positionName =
      positionsList
        .find((p) => p.id === employee.position_id)
        ?.name.toLowerCase() || "";
    const email = employee.email?.toLowerCase() || "";
    const phone = employee.number_phone || "";

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      positionName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)
    );
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    employee: Employee
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) {
      return;
    }

    setIsEditing(true);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee?.id) return;
    try {
      await deleteEmployee(selectedEmployee.id);

      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== selectedEmployee.id)
      );

      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Обработка данных, введённых пользователем в диалоговом окне
  const handleDialogSubmit = async (formData: EmployeeFormData) => {
    if (isEditing && selectedEmployee) {
      try {
        // Отправляем обновлённые данные сотрудника на сервер через API
        const updated = await updateEmployee(selectedEmployee.id, formData);
        // Обновляем локальное состояние:
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id ? { ...emp, ...updated } : emp
          )
        );
        // Закрываем диалог
        setDialogOpen(false);
        window.location.reload();
      } catch (error: any) {
        alert(`Ошибка обновления: ${error.message}`);
      }
    } else {
      // Если мы добавляем нового сотрудника
      try {
        // Отправляем данные нового сотрудника на сервер через API
        const created = await postEmployee(formData);
        // Обновляем локальное состояние: добавляем нового сотрудника в массив
        setEmployees((prev) => [...prev, created]);
        // Закрываем диалог после успешного добавления
        setDialogOpen(false);
        window.location.reload(); //  может быть поправить
      } catch (error: any) {
        // Если что-то пошло не так, выводим ошибку в консоль и показываем alert
        alert(`Ошибка добавления: ${error.message}`);
      }
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            {/* Поле поиска */}
            <TextField
              placeholder="Поиск по ФИО, должности, email или телефону"
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
                width: { xs: "100%", md: 550 },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                },
              }}
            />

            {/* Статистика */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Chip
                label={`Всего: ${employees.length}`}
                variant="outlined"
                sx={{ minWidth: 120, justifyContent: "center" }}
              />
              <Chip
                label={`Найдено: ${filteredEmployees.length}`}
                variant="outlined"
                color="primary"
                sx={{ minWidth: 120, justifyContent: "center" }}
              />
            </Box>

            {/* Кнопка добавления */}
            <AdminOnly>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddEmployee}
                sx={{
                  backgroundColor: "#1976d2",
                  minWidth: 170,
                  alignSelf: { xs: "stretch", md: "center" },
                }}
              >
                Добавить
              </Button>
            </AdminOnly>
          </Box>
        </Paper>
      </Box>

      {/* Таблица сотрудников */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Подразделение</TableCell>
                <TableCell>Контакты</TableCell>
                <AdminOnly>
                  <TableCell>Паспорт</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </AdminOnly>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => {
                  const positionName =
                    positionsList.find((p) => p.id === employee.position_id)
                      ?.name || "Не указано";
                  const roleName =
                    rolesList.find((r) => r.id === employee.role_id)?.name ||
                    "Не указано";
                  const subdivisionName =
                    subdivisionsList.find(
                      (s) => s.id === employee.subdivision_id
                    )?.name || "Не указано";

                  return (
                    <TableRow
                      key={employee.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {employee.last_name} {employee.first_name}
                          </Typography>
                          <AdminOnly>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            ></Typography>
                          </AdminOnly>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{positionName}</Typography>
                      </TableCell>
                      <TableCell>
                        <RoleChip role={roleName} />
                      </TableCell>
                      <TableCell>
                        <DepartmentChip department={subdivisionName} />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {employee.email}
                          </Typography>
                          <Typography variant="body2">
                            {employee.number_phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <AdminOnly>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.passport_series}{" "}
                            {employee.passport_number}
                          </Typography>
                        </TableCell>
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
                  );
                })}
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
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Object.entries(departmentConfig).map(([key, config]) => {
            const count = employees.filter(
              (e) => e.subdivision_id === Number(key)
            ).length;

            return (
              <Paper
                key={key}
                elevation={0}
                sx={{
                  p: 2,
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: config.bgColor,
                  border: "1px solid",
                  borderColor: config.color,
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    color={config.color}
                  >
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
        onClose={() => {
          setDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleDialogSubmit}
        isEdit={isEditing}
        employee={selectedEmployee}
        positionsList={positionsList}
        subdivisionsList={subdivisionsList}
        rolesList={rolesList}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить сотрудника "
            {selectedEmployee?.last_name} {selectedEmployee?.first_name}"?
          </Alert>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Должность:</strong>{" "}
                {positionsList.find(
                  (p) => p.id === selectedEmployee.position_id
                )?.name || "Не указано"}
              </Typography>
              <Typography variant="body2">
                <strong>Подразделение:</strong>{" "}
                {subdivisionsList.find(
                  (s) => s.id === selectedEmployee.subdivision_id
                )?.name || "Не указано"}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {selectedEmployee.email}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;
