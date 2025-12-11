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
  Edit,
  Delete,
  MoreVert,
  Category,
  Inventory,
  AttachMoney,
  ShoppingCart,
  Store,
  Numbers,
  Tag,
} from '@mui/icons-material';
import { SecondSidebar } from './../../components';
import { Product, productsData, ProductFormData, suppliers } from './makeData';

import AdminOnly from '../../components/AdminOnly';


// Типы для категорий товаров
interface CategoryItem {
  text: string;
  icon?: React.ReactElement;
  count?: number;
  children?: string[];
}

interface CategorySection {
  title: string;
  items: CategoryItem[];
}

// Модальное окно для добавления/редактирования товара
interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData;
  isEdit?: boolean;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      артикул: '',
      наименование: '',
      категория: '',
      подкатегория: '',
      ценаЗакупки: 0,
      ценаПродажи: 0,
      поставщик: '',
      количество: 0,
      единицаИзмерения: 'шт',
    }
  );

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
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
          <Inventory />
          {isEdit ? 'Редактировать товар' : 'Добавить новый товар'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {/* Основная информация */}
        <Typography variant="subtitle2" color="text.secondary">
            Основная информация
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Артикул"
            value={formData.артикул}
            onChange={(e) => handleChange('артикул', e.target.value)}
            fullWidth
            required
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Tag fontSize="small" />
                </InputAdornment>
                ),
            }}
            />
            <TextField
            label="Наименование"
            value={formData.наименование}
            onChange={(e) => handleChange('наименование', e.target.value)}
            fullWidth
            required
            />
        </Box>

        {/* Категории */}
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Категория"
            value={formData.категория}
            onChange={(e) => handleChange('категория', e.target.value)}
            fullWidth
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Category fontSize="small" />
                </InputAdornment>
                ),
            }}
            />
            <TextField
            label="Подкатегория"
            value={formData.подкатегория}
            onChange={(e) => handleChange('подкатегория', e.target.value)}
            fullWidth
            />
        </Box>

        {/* Цены */}
        <Typography variant="subtitle2" color="text.secondary">
            Цены
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Цена закупки (₽)"
            type="number"
            value={formData.ценаЗакупки}
            onChange={(e) => handleChange('ценаЗакупки', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <ShoppingCart fontSize="small" />
                </InputAdornment>
                ),
            }}
            />
            <TextField
            label="Цена продажи (₽)"
            type="number"
            value={formData.ценаПродажи}
            onChange={(e) => handleChange('ценаПродажи', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <AttachMoney fontSize="small" />
                </InputAdornment>
                ),
            }}
            />
        </Box>

        {/* Склад и поставщик */}
        <Typography variant="subtitle2" color="text.secondary">
            Склад и поставщик
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Количество"
            type="number"
            value={formData.количество}
            onChange={(e) => handleChange('количество', parseInt(e.target.value) || 0)}
            fullWidth
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Numbers fontSize="small" />
                </InputAdornment>
                ),
            }}
            />
            <FormControl fullWidth>
            <InputLabel>Единица измерения</InputLabel>
            <Select
                value={formData.единицаИзмерения}
                label="Единица измерения"
                onChange={(e) => handleChange('единицаИзмерения', e.target.value)}
            >
                <MenuItem value="шт">Штуки (шт)</MenuItem>
                <MenuItem value="кг">Килограммы (кг)</MenuItem>
                <MenuItem value="л">Литры (л)</MenuItem>
                <MenuItem value="м">Метры (м)</MenuItem>
                <MenuItem value="упак">Упаковки</MenuItem>
                <MenuItem value="компл">Комплекты</MenuItem>
            </Select>
            </FormControl>
        </Box>

        {/* Поставщик */}
        <FormControl fullWidth>
            <InputLabel>Поставщик</InputLabel>
            <Select
            value={formData.поставщик}
            label="Поставщик"
            onChange={(e) => handleChange('поставщик', e.target.value)}
            startAdornment={
                <InputAdornment position="start">
                <Store fontSize="small" />
                </InputAdornment>
            }
            >
            {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                {supplier.наименование}
                </MenuItem>
            ))}
            </Select>
        </FormControl>
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

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(productsData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Категории для сайдбара
  const categorySections: CategorySection[] = [
    {
      title: 'Категории товаров',
      items: [
        {
          text: 'Электроника',
          icon: <Category />,
          count: products.filter(p => p.категория === 'Электроника').length,
          children: ['Смартфоны', 'Ноутбуки', 'Планшеты', 'Наушники'],
        },
        {
          text: 'Офисная техника',
          icon: <Category />,
          count: products.filter(p => p.категория === 'Офисная техника').length,
          children: ['Принтеры', 'Сканеры', 'Копиры'],
        },
        {
          text: 'Электроинструменты',
          icon: <Category />,
          count: products.filter(p => p.категория === 'Электрические инструменты').length,
          children: ['Дрели', 'Пилы', 'Шуруповёрты', 'Болгарки'],
        },
        {
          text: 'Умный дом',
          icon: <Category />,
          count: products.filter(p => p.категория === 'Канцелярия').length,
          children: ['Док станция', 'Розетка', 'Выключатель', 'Пылесос'],
        },
        {
          text: 'Красота и здоровье',
          icon: <Category />,
          count: products.filter(p => p.категория === 'Хозяйственные товары').length,
          children: ['Фены', 'Плойки', 'Дипиляторы', 'Триммеры', 'Зубные щётки'],
        },
      ],
    },
  ];

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.артикул.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.наименование.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || 
      product.категория === selectedCategory ||
      product.подкатегория === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Стоимость найденых товаров
  const filteredInventoryValue = filteredProducts.reduce(
    (sum, product) => sum + (product.количество * product.ценаПродажи),
    0
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleAddProduct = () => {
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditProduct = () => {
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDialogSubmit = (formData: ProductFormData) => {
    if (isEditing && selectedProduct) {
      // Редактирование существующего товара
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, ...formData }
          : p
      ));
    } else {
      // Добавление нового товара
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        ...formData,
      };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setPage(0);
  };

  // Найти поставщика по ID
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.наименование : 'Не указан';
  };

  return (
    <Box sx={{ display: 'flex', height: '88vh' }}>
      {/* Второстепенный сайдбар с категориями */}
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
            Управление товарным каталогом: добавление, редактирование и удаление товаров
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
                placeholder="Поиск по артикулу, наименованию или описанию..."
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
                  label={`Товаров: ${products.length}`}
                  variant="outlined"
                  sx={{ minWidth: 120, justifyContent: 'center' }}
                />
                <Chip
                  label={`Найдено: ${filteredProducts.length}`}
                  variant="outlined"
                  color="primary"
                  sx={{ minWidth: 120, justifyContent: 'center' }}
                />
                <Chip
                  label={`Стоимость: ${filteredInventoryValue.toLocaleString('ru-RU')} ₽`}
                  variant="outlined"
                  color="success"
                  sx={{ minWidth: 150, justifyContent: 'center' }}
                />
              </Box>

              {/* Кнопка добавления */}
              <AdminOnly>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddProduct}
                  sx={{
                    backgroundColor: '#1976d2',
                    minWidth: 170,
                    alignSelf: { xs: 'stretch', md: 'center' }
                  }}
                >
                  Добавить товар
                </Button>
              </AdminOnly>
            </Box>
          </Paper>
        </Box>

        {/* Таблица товаров */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Артикул</TableCell>
                  <TableCell>Наименование</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Цена закупки</TableCell>
                  <TableCell>Цена продажи</TableCell>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Количество</TableCell>
                  <AdminOnly>
                    <TableCell align="right">Действия</TableCell>
                  </AdminOnly>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {product.артикул}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {product.наименование}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{product.категория}</Typography>
                          {product.подкатегория && (
                            <Typography variant="caption" color="text.secondary">
                              {product.подкатегория}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500} color="text.secondary">
                          {product.ценаЗакупки.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="primary">
                          {product.ценаПродажи.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getSupplierName(product.поставщик)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={500}>
                            {product.количество}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.единицаИзмерения}
                          </Typography>
                        </Box>
                      </TableCell>
                      <AdminOnly>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, product)}
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
            count={filteredProducts.length}
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

        {/* Меню действий для товара */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditProduct}>
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
        <ProductDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialData={selectedProduct || undefined}
          isEdit={isEditing}
        />

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Вы уверены, что хотите удалить товар "{selectedProduct?.наименование}"?
              Это действие нельзя отменить.
            </Alert>
            {selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Артикул:</strong> {selectedProduct.артикул}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Категория:</strong> {selectedProduct.категория}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Цена продажи:</strong> {selectedProduct.ценаПродажи.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Количество на складе:</strong> {selectedProduct.количество} {selectedProduct.единицаИзмерения}
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
    </Box>
  );
};

export default ProductsPage;