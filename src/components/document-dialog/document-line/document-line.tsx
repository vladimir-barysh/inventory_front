import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Stack,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Description,
  Close,
  AddCircle,
  Save,
  Inventory,
  Assessment,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

import { 
  Product,
  Document,
  DocumentLine as ApiDocumentLine,
  DocumentLineCreate,
  DocumentLineUpdate,
  documentLineApi,
  DocumentLine,
  Category,
  StorageZone,
  Unit 
} from '../../../pages';

// Диалог для заполнения документа строками
interface DocumentLineDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document;
  products: Product[];
  storageZones: StorageZone[];
  categories: Category[]; 
  units: Unit[];         
  onSave: () => void;
}

// Расширенный интерфейс для отображения строки документа с дополнительной информацией
interface EnhancedDocumentLine extends ApiDocumentLine {
  product?: Product;
  storageZoneSender?: StorageZone;
  storageZoneReceiver?: StorageZone;
  purchase_price?: number;
  sell_price?: number;
  article?: number;
  name?: string;
  category?: string; // Название категории
  unit?: string;     // Название единицы измерения
}

// Интерфейс для нового товара
interface NewProductFormData {
  article: number;
  name: string;
  category: string;
  unit: string;
  purchase_price: number;
  sell_price: number;
  storage_zone_id: number | null;
}

export const DocumentLineDialog: React.FC<DocumentLineDialogProps> = ({
  open,
  onClose,
  document,
  products,
  storageZones,
  categories,
  units, 
  onSave
}) => {
  const [lines, setLines] = useState<EnhancedDocumentLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductForm, setNewProductForm] = useState<NewProductFormData>({
    article: 0,
    name: '',
    category: '',
    unit: 'шт',
    purchase_price: 0,
    sell_price: 0,
    storage_zone_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);

  // Загрузка строк документа при открытии диалога
  useEffect(() => {
    if (open && document.id) {
      loadDocumentLines();
    }
  }, [open, document.id]);



  
  const loadDocumentLines = async () => {
  setLoadingLines(true);
  try {
    console.log('📡 Загрузка строк документа ID:', document.id);
    
    const response = await documentLineApi.getByDocumentId(document.id);
    console.log('📦 Ответ API:', response);
    
    // Проверяем структуру ответа
    if (!response) {
      console.error('❌ Пустой ответ от API');
      setLines([]);
      return;
    }
    
    let linesArray: DocumentLine[] = [];
    
    // Обработка разных структур ответа
    if (Array.isArray(response)) {
      // Если API возвращает массив напрямую
      linesArray = response;
    } else if (response.lines && Array.isArray(response.lines)) {
      // Если API возвращает объект с полем lines (DocumentLinesResponse)
      linesArray = response.lines;
    } else if (Array.isArray((response as any).data)) {
      // Если есть поле data (на всякий случай)
      linesArray = (response as any).data;
    } else {
      console.error('❌ Неизвестная структура ответа:', response);
      setLines([]);
      return;
    }
    
    console.log(`✅ Получено строк: ${linesArray.length}`);
    console.log('📋 Строки:', linesArray);
    
    // Обогащаем данные
    const enhancedLines: EnhancedDocumentLine[] = linesArray.map(line => {
      const product = products.find(p => p.id === line.product_id);
      const storageZoneSender = line.storage_zone_sender_id ? 
        storageZones.find(z => z.id === line.storage_zone_sender_id) : undefined;
      const storageZoneReceiver = line.storage_zone_receiver_id ? 
        storageZones.find(z => z.id === line.storage_zone_receiver_id) : undefined;

      const categoryName = product?.category_id ? 
        categories.find(c => c.id === product.category_id)?.name : undefined;
      
      const unitName = product?.unit_id ? 
        units.find(u => u.id === product.unit_id)?.name : undefined;

      return {
        ...line,
        product,
        storageZoneSender,
        storageZoneReceiver,
        purchase_price: product?.purchase_price,
        sell_price: product?.sell_price,
        article: product?.article,
        name: product?.name,
        category: categoryName,
        unit: unitName,
      };
    });
    
    console.log('✨ Обогащенные строки:', enhancedLines);
    setLines(enhancedLines);
    
  } catch (error) {
    console.error('❌ Ошибка загрузки строк документа:', error);
    alert('Не удалось загрузить строки документа');
    setLines([]);
  } finally {
    setLoadingLines(false);
  }
};

  const handleAddNewProduct = () => {
      if (!newProductForm.article || !newProductForm.name.trim()) {
        alert('Заполните артикул и наименование товара');
        return;
      }

      // В реальном приложении здесь будет вызов API для создания товара
      alert('Создание нового товара через API еще не реализовано');
      
      // Сбрасываем форму
      setNewProductForm({
        article: 0,
        name: '',
        category: '',
        unit: 'шт',
        purchase_price: 0,
        sell_price: 0,
        storage_zone_id: null,
      });
      
      setShowNewProductForm(false);
    };

    const handleAddLine = async () => {
    if (!selectedProduct) {
      alert('Выберите товар для добавления');
      return;
    }

    console.log('➕ === НАЧАЛО ДОБАВЛЕНИЯ СТРОКИ ===');
    console.log('📦 Выбранный товар:', selectedProduct);
    console.log('📄 Документ:', document);
    console.log('🏷️ Тип документа:', document.document_type_id);

    // Создаем объект для отправки
    const lineData: DocumentLineCreate = {
      document_id: document.id,
      product_id: selectedProduct.id,
      quantity: 1,
      actual_quantity: 1, // ← ВАЖНО: передаем actual_quantity
      storage_zone_sender_id: undefined,
      storage_zone_receiver_id: undefined
    };

    // В зависимости от типа документа заполняем storage зоны
    switch (document.document_type_id) {
      case 1: // Приход
        const receiverZoneId = newProductForm.storage_zone_id || 
          (storageZones.length > 0 ? storageZones[0].id : null);
        lineData.storage_zone_receiver_id = receiverZoneId;
        console.log('📥 Приход: зона приемки ID:', receiverZoneId);
        break;
      
      case 2: // Расход
        const senderZoneId = storageZones.length > 0 ? storageZones[0].id : null;
        lineData.storage_zone_sender_id = senderZoneId;
        console.log('📤 Расход: зона отгрузки ID:', senderZoneId);
        break;
      
      case 3: // Перемещение
        lineData.storage_zone_sender_id = storageZones.length > 0 ? storageZones[0].id : null;
        lineData.storage_zone_receiver_id = storageZones.length > 1 ? storageZones[1].id : 
          (storageZones.length > 0 ? storageZones[0].id : null);
        console.log('🔄 Перемещение: откуда ID', lineData.storage_zone_sender_id, 
                    'куда ID', lineData.storage_zone_receiver_id);
        break;
      
      case 4: // Инвентаризация
        // Для инвентаризации нужно получать текущее количество из БД
        console.log('📊 Инвентаризация: зоны хранения не нужны');
        // Можно оставить поля undefined или null
        break;
      
      case 5: // Списание
        const writeOffZoneId = storageZones.length > 0 ? storageZones[0].id : null;
        lineData.storage_zone_sender_id = writeOffZoneId;
        console.log('🗑️ Списание: зона списания ID:', writeOffZoneId);
        break;
    }

    // Если значения null, лучше установить undefined
    if (lineData.storage_zone_sender_id === null) {
      lineData.storage_zone_sender_id = undefined;
    }
    if (lineData.storage_zone_receiver_id === null) {
      lineData.storage_zone_receiver_id = undefined;
    }

    console.log('📤 Данные для отправки на сервер:');
    console.log(JSON.stringify(lineData, null, 2));

    try {
      setLoading(true);
      
      // Отправляем данные через API
      console.log('📡 Отправка через documentLineApi.create...');
      const response = await documentLineApi.create(lineData);
      console.log('✅ Ответ от API:', response);
      
      // Проверяем ответ
      if (response) {
        // После успешного добавления обновляем список строк
        await loadDocumentLines();
        
        // Сбрасываем выбранный товар
        setSelectedProduct(null);
      }
      
    } catch (error: any) {
      console.error('❌ ПОЛНАЯ ОШИБКА:');
      console.error('Сообщение:', error.message);
      console.error('Статус:', error.response?.status);
      console.error('Данные ошибки:', error.response?.data);
      console.error('Конфиг запроса:', error.config);
      
      let errorMessage = 'Ошибка добавления строки';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLine = async (lineId: number) => {
    try {
      setLoading(true);
      await documentLineApi.delete(lineId);
      setLines(prev => prev.filter(line => line.id !== lineId));
    } catch (error: any) {
      console.error('Ошибка удаления строки:', error);
      alert(error.response?.data?.detail || 'Не удалось удалить строку документа');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (lineId: number, field: string, value: any) => {
    const lineToUpdate = lines.find(line => line.id === lineId);
    if (!lineToUpdate) return;

    const updateData: DocumentLineUpdate = {};

    switch (field) {
      case 'quantity':
        updateData.quantity = Number(value);
        break;
      case 'storage_zone_sender_id':
        updateData.storage_zone_sender_id = value ? Number(value) : null;
        break;
      case 'storage_zone_receiver_id':
        updateData.storage_zone_receiver_id = value ? Number(value) : null;
        break;
    }

    try {
      setLoading(true);
      const updatedLine = await documentLineApi.update(lineId, updateData);
      
      // Находим название категории по ID
      const categoryName = lineToUpdate.product?.category_id ? 
        categories.find(c => c.id === lineToUpdate.product!.category_id)?.name : undefined;
      
      // Находим название единицы измерения по ID
      const unitName = lineToUpdate.product?.unit_id ? 
        units.find(u => u.id === lineToUpdate.product!.unit_id)?.name : undefined;

      // Обновляем строку в состоянии
      setLines(prev => prev.map(line => 
        line.id === lineId 
          ? { 
              ...line, 
              ...updatedLine,
              product: line.product,
              purchase_price: line.purchase_price,
              sell_price: line.sell_price,
              article: line.article,
              name: line.name,
              category: categoryName,
              unit: unitName,
            } 
          : line
      ));
    } catch (error: any) {
      console.error('Ошибка обновления строки:', error);
      alert(error.response?.data?.detail || 'Не удалось обновить строку документа');
    } finally {
      setLoading(false);
    }
  };

  const handleStringFieldChange = (field: 'name' | 'category' | 'unit', value: string) => {
  setNewProductForm(prev => ({ ...prev, [field]: value }));
};

const handleNumberFieldChange = (field: 'article' | 'purchase_price' | 'sell_price', value: number) => {
  setNewProductForm(prev => {
    const newState = { ...prev, [field]: value };
    
    // Автоматически рассчитываем цену продажи при изменении цены закупки
    if (field === 'purchase_price' && prev.sell_price === 0 && value > 0) {
      newState.sell_price = value * 1.2; // Наценка 20%
    }
    
    return newState;
  });
};

const handleStorageZoneChange = (value: number | null) => {
  setNewProductForm(prev => ({ ...prev, storage_zone_id: value }));
};

  const handleSave = () => {
    onSave();
    onClose();
  };

  // Рассчитываем итоговые суммы в зависимости от типа документа
  const calculateTotals = () => {
    let totals = {
      totalQuantity: 0,
      totalAmount: 0,
      totalPurchaseAmount: 0,
      profit: 0,
    };

    lines.forEach(line => {
      totals.totalQuantity += line.quantity;

      switch (document.document_type_id) {
        case 1: // Приход
          totals.totalPurchaseAmount += (line.purchase_price || 0) * line.quantity;
          totals.totalAmount += (line.purchase_price || 0) * line.quantity;
          break;

        case 2: // Расход
          totals.totalAmount += (line.sell_price || 0) * line.quantity;
          if (line.product) {
            totals.profit += (line.sell_price || 0) * line.quantity - 
                           (line.product.purchase_price || 0) * line.quantity;
          }
          break;

        case 4: // Инвентаризация
          totals.totalAmount += (line.sell_price || 0) * line.quantity;
          break;

        case 5: // Списание
          totals.totalAmount += (line.purchase_price || 0) * line.quantity;
          break;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  // Получаем тип документа для отображения
  const getDocumentTypeName = () => {
    switch (document.document_type_id) {
      case 1: return 'приходная';
      case 2: return 'расходная';
      case 3: return 'перемещение';
      case 4: return 'инвентаризация';
      case 5: return 'списание';
      default: return 'неизвестный';
    }
  };

  // Получаем уникальные категории товаров в документе
  const categoriesInDocument = Array.from(
    new Set(
      lines
        .filter(line => line.category)
        .map(line => line.category!)
    )
  );

  // Получаем уникальные зоны хранения
  const storageZonesInDocument = Array.from(
    new Set(
      lines.flatMap(line => {
        const zones = [];
        if (line.storageZoneSender) zones.push(line.storageZoneSender.наименование);
        if (line.storageZoneReceiver) zones.push(line.storageZoneReceiver.наименование);
        return zones;
      })
    )
  );

  // Рендерим строку таблицы в зависимости от типа документа
  const renderTableRow = (line: EnhancedDocumentLine, index: number) => {
    const documentTypeId = document.document_type_id;

    switch (documentTypeId) {
      case 1: // Приходная
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {line.article || 'N/A'}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={line.category || 'Без категории'} 
                size="small" 
                sx={{ maxWidth: '100px' }}
              />
            </TableCell>
            <TableCell>{line.name || 'Без названия'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.quantity}
                onChange={(e) => handleFieldChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </TableCell>
            <TableCell>{line.unit || 'шт'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.purchase_price || 0}
                size="small"
                sx={{ width: '100px' }}
                inputProps={{ min: 0, step: 0.01 }}
                disabled // Цена закупки не редактируется здесь
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {((line.purchase_price || 0) * line.quantity).toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <TextField
                value={line.sell_price || 0}
                size="small"
                sx={{ width: '100px' }}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                disabled // Цена продажи не редактируется здесь
              />
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={line.storage_zone_receiver_id || ''}
                  onChange={(e) => handleFieldChange(line.id, 'storage_zone_receiver_id', e.target.value)}
                  disabled={loading || storageZones.length === 0}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.наименование}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
                disabled={loading}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 2: // Расходная
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {line.article || 'N/A'}
              </Typography>
            </TableCell>
            <TableCell>{line.name || 'Без названия'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.quantity}
                onChange={(e) => handleFieldChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </TableCell>
            <TableCell>{line.unit || 'шт'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.sell_price || 0}
                size="small"
                sx={{ width: '100px' }}
                inputProps={{ min: 0, step: 0.01 }}
                disabled // Цена продажи не редактируется здесь
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {((line.sell_price || 0) * line.quantity).toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={line.storage_zone_sender_id || ''}
                  onChange={(e) => handleFieldChange(line.id, 'storage_zone_sender_id', e.target.value)}
                  disabled={loading || storageZones.length === 0}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.наименование}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
                disabled={loading}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 3: // Перемещение
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {line.article || 'N/A'}
              </Typography>
            </TableCell>
            <TableCell>{line.name || 'Без названия'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.quantity}
                onChange={(e) => handleFieldChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </TableCell>
            <TableCell>{line.unit || 'шт'}</TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={line.storage_zone_sender_id || ''}
                  onChange={(e) => handleFieldChange(line.id, 'storage_zone_sender_id', e.target.value)}
                  disabled={loading || storageZones.length === 0}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.наименование}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={line.storage_zone_receiver_id || ''}
                  onChange={(e) => handleFieldChange(line.id, 'storage_zone_receiver_id', e.target.value)}
                  disabled={loading || storageZones.length === 0}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.наименование}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
                disabled={loading}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 4: // Инвентаризация
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {line.article || 'N/A'}
              </Typography>
            </TableCell>
            <TableCell>{line.name || 'Без названия'}</TableCell>
            <TableCell>{line.unit || 'шт'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.quantity}
                onChange={(e) => handleFieldChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {((line.sell_price || 0) * line.quantity).toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
                disabled={loading}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 5: // Списание
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {line.article || 'N/A'}
              </Typography>
            </TableCell>
            <TableCell>{line.name || 'Без названия'}</TableCell>
            <TableCell>{line.unit || 'шт'}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={line.quantity}
                onChange={(e) => handleFieldChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {((line.purchase_price || 0) * line.quantity).toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={line.storage_zone_sender_id || ''}
                  onChange={(e) => handleFieldChange(line.id, 'storage_zone_sender_id', e.target.value)}
                  disabled={loading || storageZones.length === 0}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.наименование}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
                disabled={loading}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      default:
        return null;
    }
  };

  // Рендерим заголовки таблицы в зависимости от типа документа
  const renderTableHeaders = () => {
    const documentTypeId = document.document_type_id;

    switch (documentTypeId) {
      case 1: // Приходная
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell width="120px">Категория</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Кол-во</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="100px">Цена закупки</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="100px">Цена продажи</TableCell>
            <TableCell width="120px">Зона хранения</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      case 2: // Расходная
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Кол-во</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="100px">Цена продажи</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="120px">Зона хранения</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      case 3: // Перемещение
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Кол-во</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="140px">Зона хранения (откуда)</TableCell>
            <TableCell width="140px">Зона хранения (куда)</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      case 4: // Инвентаризация
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="120px">Кол-во по учёту</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      case 5: // Списание
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="120px">Кол-во на складе</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="120px">Зона хранения</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      default:
        return null;
    }
  };

  // Рендерим итоговую строку в зависимости от типа документа
  const renderTableFooter = () => {
    const documentTypeId = document.document_type_id;

    switch (documentTypeId) {
      case 1: // Приходная
        return (
          <TableRow>
            <TableCell colSpan={6} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                Итого:
              </Typography>
            </TableCell>
            <TableCell colSpan={1} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                {totals.totalQuantity} ед.
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ whiteSpace: 'nowrap' }}>
                {totals.totalAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        );

      case 2: // Расходная
        return (
          <TableRow>
            <TableCell colSpan={5} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                Итого:
              </Typography>
            </TableCell>
            <TableCell colSpan={1} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                {totals.totalQuantity} ед.
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ whiteSpace: 'nowrap' }}>
                {totals.totalAmount.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="caption" color="success.main">
                Прибыль: {totals.profit.toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        );

      case 3: // Перемещение
        return (
          <TableRow>
            <TableCell colSpan={4} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                Итого:
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                {totals.totalQuantity} ед.
              </Typography>
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        );

      case 5: // Списание
        return (
          <TableRow>
            <TableCell colSpan={5} align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                Итого:
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {totals.totalAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        );

      default:
        return null;
    }
  };

  // Фильтруем товары, которые уже есть в документе
  const availableProducts = products.filter(p => 
    !lines.some(l => l.product_id === p.id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            <Box>
              <Typography variant="h6" component="div">
                Заполнение документа: {document.number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {document.date} • {document.comment}
              </Typography>
            </Box>
            <Chip
              label={getDocumentTypeName()}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ overflow: 'hidden' }}>
        {loadingLines ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Загрузка строк документа...</Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2, 
            height: '100%' 
          }}>
            {/* Левая колонка - добавление товара и статистика */}
            <Box sx={{ 
              width: { xs: '100%', md: '30%' },
              minWidth: { md: 350 },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {/* Блок добавления товара */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  <AddCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Добавить товар
                </Typography>
                
                {/* Автокомплит для поиска существующих товаров */}
                <Autocomplete
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  options={availableProducts}
                  getOptionLabel={(option) => `${option.article} - ${option.name}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Поиск товара в базе"
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      helperText="Выберите существующий товар"
                    />
                  )}
                />
                
                {/* Кнопка для добавления нового товара (только для приходных накладных) */}
                {document.document_type_id === 1 && (
                  <>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setShowNewProductForm(!showNewProductForm)}
                      sx={{ mb: 2 }}
                      endIcon={showNewProductForm ? <ExpandLess /> : <ExpandMore />}
                    >
                      {showNewProductForm ? 'Скрыть форму' : 'Добавить новый товар'}
                    </Button>
                    
                    <Collapse in={showNewProductForm}>
                      <Paper sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: 'white',
                        border: '1px solid', 
                        borderColor: 'primary.main' 
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Новый товар
                        </Typography>
                        
                        <Stack spacing={2}>
                          <TextField
                            label="Артикул"
                            value={newProductForm.article}
                            onChange={(e) => handleNumberFieldChange('article', parseInt(e.target.value) || 0)}
                            size="small"
                            fullWidth
                            required
                            type="number"
                          />
                          
                          <TextField
                            label="Наименование"
                            value={newProductForm.name}
                            onChange={(e) => handleStringFieldChange('name', e.target.value)}
                            size="small"
                            fullWidth
                            required
                          />
                          
                          <Autocomplete
                            freeSolo
                            value={newProductForm.category}
                            onChange={(_, newValue) => handleStringFieldChange('category', newValue || '')}
                            options={categories.map(c => c.name)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Категория"
                                size="small"
                                required
                                fullWidth
                              />
                            )}
                          />
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              label="Цена закупки"
                              type="number"
                              value={newProductForm.purchase_price}
                              onChange={(e) => handleNumberFieldChange('purchase_price', parseFloat(e.target.value) || 0)}
                              size="small"
                              fullWidth
                              required
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                              }}
                            />
                            
                            <TextField
                              label="Цена продажи"
                              type="number"
                              value={newProductForm.sell_price}
                              onChange={(e) => handleNumberFieldChange('sell_price', parseFloat(e.target.value) || 0)}
                              size="small"
                              fullWidth
                              required
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Autocomplete
                              freeSolo
                              value={newProductForm.unit}
                              onChange={(_, newValue) => handleStringFieldChange('unit', newValue || 'шт')}
                              options={units.map(u => u.name)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Ед. измерения"
                                  size="small"
                                  fullWidth
                                />
                              )}
                            />
                            
                            <FormControl fullWidth size="small">
                              <Select
                                value={newProductForm.storage_zone_id || ''}
                                required
                                onChange={(e) => {
                                  const value = e.target.value as string;
                                  if (value === '') {
                                    handleStorageZoneChange(null);
                                  } else {
                                    const numValue = Number(value);
                                    // Проверяем, что это валидное число (не NaN)
                                    handleStorageZoneChange(isNaN(numValue) ? null : numValue);
                                  }
                                }}
                              >
                                <MenuItem value="">Не выбрана</MenuItem>
                                {storageZones.map(zone => (
                                  <MenuItem key={zone.id} value={zone.id.toString()}>{zone.наименование}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddNewProduct}
                            disabled={!newProductForm.article || !newProductForm.name.trim()}
                            fullWidth
                          >
                            Добавить новый товар в документ
                          </Button>
                        </Stack>
                      </Paper>
                    </Collapse>
                  </>
                )}
                
                {selectedProduct && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      <strong>Выбранный товар:</strong>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Артикул:</strong> {selectedProduct.article}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Наименование:</strong> {selectedProduct.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Категория:</strong> {
                        selectedProduct.category_id ? 
                          categories.find(c => c.id === selectedProduct.category_id)?.name : 
                          'Не указана'
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>Цена закупки:</strong> {selectedProduct.purchase_price || 0} ₽
                    </Typography>
                    <Typography variant="body2">
                      <strong>Цена продажи:</strong> {selectedProduct.sell_price || 0} ₽
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ед. измерения:</strong> {
                        selectedProduct.unit_id ? 
                          units.find(u => u.id === selectedProduct.unit_id)?.name : 
                          'шт'
                      }
                    </Typography>
                  </Paper>
                )}
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddLine}
                  disabled={!selectedProduct || loading}
                  sx={{ mb: 2 }}
                  startIcon={<AddCircle />}
                >
                  {loading ? 'Добавление...' : 'Добавить выбранный товар'}
                </Button>
              </Paper>
              
              {/* Отдельный блок статистики */}
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Статистика
                </Typography>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Товаров в документе:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {lines.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Общее количество:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {totals.totalQuantity}
                      </Typography>
                    </Box>
                    
                    {document.document_type_id === 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма закупки:</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    )}
                    
                    {document.document_type_id === 2 && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Сумма продажи:</Typography>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {totals.totalAmount.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Прибыль:</Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {totals.profit.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </Box>
                      </>
                    )}
                    
                    {document.document_type_id === 4 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма по учёту:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    )}
                    
                    {document.document_type_id === 5 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма на складе:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    )}
                    
                    {categoriesInDocument.length > 0 && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>Категории:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {categoriesInDocument.map(category => (
                            <Chip 
                              key={category} 
                              label={category} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {storageZonesInDocument.length > 0 && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>Зоны хранения:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {storageZonesInDocument.map(zone => (
                            <Chip 
                              key={zone} 
                              label={zone} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Box>

            {/* Правая колонка - таблица строк документа */}
            <Box sx={{ 
              flex: 1,
              minWidth: 0 
            }}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {loadingLines ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 4
                  }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Загрузка строк документа...</Typography>
                  </Box>
                ) : lines.length > 0 ? (
                  <>
                    <TableContainer sx={{ flex: 1 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            {renderTableHeaders()}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lines.map((line, index) => renderTableRow(line, index))}
                        </TableBody>
                        <TableFooter>
                          {renderTableFooter()}
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 4
                  }}>
                    <Inventory sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Документ пуст
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Добавьте товары из списка слева
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Тип:</strong> {getDocumentTypeName()} • 
            <strong> Строк:</strong> {lines.length} • 
            <strong> Товаров:</strong> {lines.length} ед.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Закрыть без сохранения
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={loading}
          >
            Сохранить документ
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};