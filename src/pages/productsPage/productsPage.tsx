import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography,
  Paper, TextField,
  InputAdornment, Button,
  IconButton, Table,
  TableBody, TableCell,
  TableContainer, TableHead,
  TableRow, TablePagination,
  Dialog, DialogTitle,
  DialogContent, DialogActions,
  FormControl, InputLabel,
  Select, MenuItem,
  Menu, ListItemIcon,
  ListItemText, Alert,
  Chip,
} from '@mui/material';
import {
  Search, Add,
  Edit, Delete,
  MoreVert, Category as CategoryIcon,
  Inventory, AttachMoney,
  ShoppingCart, Store,
  Numbers, Tag,
} from '@mui/icons-material';
import { SecondSidebar } from './../../components';
import { Product, productApi, ProductFormData, categoryApi, Category } from './makeData';

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

/*const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {

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
        {/* Основная информация 
        <Typography variant="subtitle2" color="text.secondary">
            Основная информация
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Артикул"
            value={formData.article}
            onChange={(e) => handleChange('article', e.target.value)}
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

        {/* Категории *
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Категория"
            value={formData.категория}
            onChange={(e) => handleChange('категория', e.target.value)}
            fullWidth
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <CategoryIcon fontSize="small" />
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

        {/* Цены 
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

        {/* Склад и поставщик *
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

        {/* Поставщик *
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
        };*/

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    // Первоначальная загрузка
    loadAllData();
    
    // Настраиваем интервал для обновления каждые 10 секунд
    const intervalId = setInterval(() => {
      console.log('Автоматическое обновление данных...');
      loadAllData();
    }, 10000); // 10000 мс = 10 секунд
    
    // Очистка интервала при размонтировании компонента
    return () => {
      clearInterval(intervalId);
      console.log('Интервал очищен');
    };
  }, []); // Пустой массив зависимостей = запуск только при монтировании

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем параллельно для скорости
      const [productsData, categoriesData] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      
      console.log('Данные обновлены:', {
        products: productsData.length,
        categories: categoriesData.length,
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Ошибка загрузки данных';
      setError(errorMessage);
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorySections: CategorySection[] = [
    {
      title: 'Категории товаров',
      items: categories.map(category => ({
        text: category.name,
        icon: <CategoryIcon />,
        count: products.filter(p => p.category_id === category.id).length
      })),
    },
  ];

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    // Безопасный поиск по article
    const articleMatch = product.article 
      ? product.article.toString().toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    // Безопасный поиск по name
    const nameMatch = product.name 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const matchesSearch = articleMatch || nameMatch;

    // Если категория не выбрана - пропускаем проверку
    const matchesCategory = !selectedCategory || 
      product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  /*/ Стоимость найденых товаров
  const filteredInventoryValue = filteredProducts.reduce(
    (sum, product) => sum + (productApi.getQuantity(product.id, 0) * product.sell_price),
    0
  );*/


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
    const foundCategory = categories.find(c => {
      const categoryName = c.name;
      return categoryName === category;
    });
    setSelectedCategory(foundCategory ? foundCategory.id : null);
    setPage(0);
  };

  const findCategoryName = (product: Product) => {
    const foundCategory = categories.find(c => {
      const categoryId = c.id;
      return categoryId === product.category_id;
    });

    return foundCategory?.name;
  };

  const findUnitName = (product: Product) => {
    switch (product.unit_id) {
      case 1: return 'шт';
      default: break;
    }
  }

  const getProductAllQuantity = (product: Product) => {
    const qnt = productApi.getQuantity(product.id, 1);
    return qnt;
  }

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
                {/*filteredInventoryValue.toLocaleString('ru-RU')*/}
                <Chip
                  label={`Стоимость:  0 ₽`}
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
          <TableContainer sx={{ maxHeight: 700 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Артикул</TableCell>
                  <TableCell>Наименование</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Цена закупки</TableCell>
                  <TableCell>Цена продажи</TableCell>
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
                          {product.article}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {product.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {
                              findCategoryName(product)
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500} color="text.secondary">
                          {product.purchase_price.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="primary">
                          {product.sell_price.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={500}>
                            0
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {findUnitName(product)}
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

        {/* Диалог добавления/редактирования *
        <ProductDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialData={selectedProduct || undefined}
          isEdit={isEditing}
        />*/}

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Вы уверены, что хотите удалить товар "{selectedProduct?.name}"?
              Это действие нельзя отменить.
            </Alert>
            {selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Артикул:</strong> {selectedProduct.article}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Категория:</strong> {selectedProduct.category_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Цена продажи:</strong> {selectedProduct.sell_price.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Количество на складе: 0</strong> {selectedProduct.unit_id}
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