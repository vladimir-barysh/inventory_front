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
  Chip, Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Search, Add,
  Edit, Delete,
  MoreVert, Category as CategoryIcon,
  Inventory, AttachMoney,
  ShoppingCart, Store,
  Numbers, Tag,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import { SecondSidebar } from './../../components';
import { Product, productApi, ProductFormData, categoryApi, Category, unitApi, Unit, ProductQuantity } from './makeData';

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
  categories: Category[];
  units: Unit[];
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  categories = [],
  units = [],
}) => {
   const formData = React.useMemo(() => {
    
    return initialData || {
      article: 0,
      name: '',
      purchase_price: 0,
      sell_price: 0,
      is_active: 1,
      category_id: 0,
      unit_id: 1,
    };
  }, [initialData, open]);

  // Локальное состояние для отслеживания изменений
  const [localData, setLocalData] = useState<ProductFormData>(formData);

  useEffect(() => {
    console.log('🔄 Обновляем localData с новыми данными:', formData);
    setLocalData(formData);
  }, [formData]);

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    console.log(`📝 Изменение поля ${field}:`, value);
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(localData);
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
            value={localData.article}
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
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            />
        </Box>

        {/* Категории */}
        <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
            <InputLabel>Категория</InputLabel>
            <Select
                value={localData.category_id}
                label="Категория"
                onChange={(e) => handleChange('category_id', e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            </FormControl>
        </Box>

        {/* Цены */}
        <Typography variant="subtitle2" color="text.secondary">
            Цены
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
            label="Цена закупки (₽)"
            type="number"
            value={localData.purchase_price}
            onChange={(e) => handleChange('purchase_price', parseFloat(e.target.value) || 0)}
            fullWidth
            />
            <TextField
            label="Цена продажи (₽)"
            type="number"
            value={localData.sell_price}
            onChange={(e) => handleChange('sell_price', parseFloat(e.target.value) || 0)}
            fullWidth
            />
        </Box>

        <Typography variant="subtitle2" color="text.secondary">
            Дополнительная информация
        </Typography>
        <Box sx={{ display: 'flex', gap: 5 }}>
            <FormControl fullWidth>
            <InputLabel>Единица измерения</InputLabel>
            <Select
                value={localData.unit_id}
                label="Единица измерения"
                onChange={(e) => handleChange('unit_id', e.target.value)}
            >
                {units.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
            </FormControl>

            {!localData.is_active && (
            <FormControlLabel 
              sx ={{
                minWidth: '100px'
              }}
              control={
                <Checkbox 
                  checked={
                    localData.is_active? true: false
                  }
                  onChange={(e) => handleChange('is_active', e.target.value)}
                />
              } 
              label="Восстановить товар"
            />)}

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

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [quantity, setQuantity] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
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
      const [productsData, categoriesData, unitsData] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        unitApi.getAll(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setUnits(unitsData);
      
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

  const convertToFormData = (product: Product): ProductFormData => {
    return {
      article: product.article,
      name: product.name,
      purchase_price: product.purchase_price,
      sell_price: product.sell_price,
      is_active: product.is_active,
      category_id: product.category_id,
      unit_id: product.unit_id,
    };
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
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditProduct = () => {

    if (!selectedProduct) {
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

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      productApi.delete(selectedProduct.id);
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDialogSubmit = (formData: ProductFormData) => {
    if (isEditing && selectedProduct) {
      // Редактирование существующего товара
      productApi.update(selectedProduct.id, formData);
    } else {
      productApi.create(formData);
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
    const foundUnit = units.find(u => {
      const unitId = u.id;
      return unitId === product.unit_id;
    });

    return foundUnit?.name
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
      <Box sx={{ flex: 1, 
        pl: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%'}}>
        {/* Заголовок и панель управления */}
        <Box sx={{ mb: 2}}>
          <Typography color="text.secondary" paragraph>
            Управление товарным каталогом: добавление, редактирование и удаление товаров
          </Typography>

          {/* Панель поиска и управления */}
          <Paper sx={{ p: 2, mb: 1 }}>
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
        <Box sx={{ 
          flex: '0 1 auto', 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0, // Важно для корректной работы overflow
          overflow: 'hidden'
        }}>
          <Paper sx={{ 
            width: '100%', 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <TableContainer >
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
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: product.is_active ? 'inherit' : '#f5f5f5', // Серый для неактивных
                          '&:hover': { backgroundColor: product.is_active ? 'action.hover' : '#e0e0e0' },
                          color: !product.is_active ? 'text.disabled' : 'inherit', // Серый для неактивных
                          '& .MuiTableCell-root': {
                            color: 'inherit' // Все ячейки наследуют цвет строки
                          }
                        }}
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
                              <ProductQuantity productId={product.id}/>
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
              rowsPerPageOptions={[8, 15, 30]}
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
              sx = {{
                height:'60px'
              }}
            />
          </Paper>
        </Box>
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
          {selectedProduct?.is_active && (
            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Удалить</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Диалог добавления/редактирования */}
        <ProductDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedProduct(null);}
          }
          onSubmit={handleDialogSubmit}
          initialData={selectedProduct? convertToFormData(selectedProduct) : undefined}
          isEdit={isEditing}
          categories={categories}
          units={units}
        />

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Вы уверены, что хотите удалить (скрыть) товар "{selectedProduct?.name}"?
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