import React, { useState } from 'react';
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
  Document, 
  Product, 
  DocumentLine, 
  ПриходнаяСтрока, 
  РасходнаяСтрока, 
  ИнвентаризацияСтрока, 
  ПеремещениеСтрока, 
  СписаниеСтрока,
  storageZones 
} from '../../../pages';

// Диалог для заполнения документа строками
interface DocumentLineDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document;
  products: Product[];
  onSave: (document: Document) => void;
}

// Интерфейс для нового товара
interface NewProductFormData {
  артикул: string;
  наименование: string;
  категория: string;
  единицаИзмерения: string;
  ценаЗакупки: number;
  ценаПродажи: number;
  зонаХранения: string;
}

export const DocumentLineDialog: React.FC<DocumentLineDialogProps> = ({ 
  open, 
  onClose, 
  document, 
  products,
  onSave 
}) => {
  const [lines, setLines] = useState<DocumentLine[]>(document.строки || []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductForm, setNewProductForm] = useState<NewProductFormData>({
    артикул: '',
    наименование: '',
    категория: '',
    единицаИзмерения: 'шт',
    ценаЗакупки: 0,
    ценаПродажи: 0,
    зонаХранения: 'A-1',
  });

  // Добавляем новые категории для выбора
  const categories = [
    'Электроника',
    'Канцтовары',
    'Мебель',
    'Оборудование',
    'Хозтовары',
    'Продукты',
    'Медицинские товары',
    'Строительные материалы',
    'Текстиль',
    'Другое'
  ];

  const units = ['шт', 'упак', 'набор'];

  const handleAddNewProduct = () => {
    if (!newProductForm.артикул.trim() || !newProductForm.наименование.trim()) {
      alert('Заполните артикул и наименование товара');
      return;
    }

    // Генерируем временный ID (в реальном приложении это делается на бэкенде)
    const tempId = -Date.now();

    // Создаем строку документа для приходной накладной
    const newLine: ПриходнаяСтрока = {
      id: Date.now(),
      documentId: document.id,
      товарId: tempId,
      артикул: newProductForm.артикул.trim(),
      наименование: newProductForm.наименование.trim(),
      категория: newProductForm.категория || 'Другое',
      единицаИзмерения: newProductForm.единицаИзмерения || 'шт',
      количество: 1,
      ценаЗакупки: newProductForm.ценаЗакупки || 0,
      ценаПродажи: newProductForm.ценаПродажи || 0,
      сумма: (newProductForm.ценаЗакупки || 0) * 1,
      зонаХранения: newProductForm.зонаХранения || 'A-1',
      тип: 'приходная'
    };

    setLines(prev => [...prev, newLine]);
    
    // Сбрасываем форму
    setNewProductForm({
      артикул: '',
      наименование: '',
      категория: '',
      единицаИзмерения: 'шт',
      ценаЗакупки: 0,
      ценаПродажи: 0,
      зонаХранения: 'A-1',
    });
    
    setShowNewProductForm(false);
  };

  const handleAddLine = () => {
    if (!selectedProduct) return;

    let newLine: DocumentLine;

    switch (document.тип) {
      case 'приходная':
        newLine = {
          id: Date.now(),
          documentId: document.id,
          товарId: selectedProduct.id,
          артикул: selectedProduct.артикул,
          наименование: selectedProduct.наименование,
          категория: selectedProduct.категория,
          единицаИзмерения: selectedProduct.единицаИзмерения,
          количество: 1,
          ценаЗакупки: selectedProduct.ценаЗакупки,
          ценаПродажи: selectedProduct.ценаПродажи,
          сумма: selectedProduct.ценаЗакупки * 1,
          зонаХранения: selectedProduct.зонаХранения || 'A-1',
          тип: 'приходная'
        } as ПриходнаяСтрока;
        break;

      case 'расходная':
        newLine = {
          id: Date.now(),
          documentId: document.id,
          товарId: selectedProduct.id,
          артикул: selectedProduct.артикул,
          наименование: selectedProduct.наименование,
          единицаИзмерения: selectedProduct.единицаИзмерения,
          количество: 1,
          ценаПродажи: selectedProduct.ценаПродажи,
          сумма: selectedProduct.ценаПродажи * 1,
          зонаХранения: selectedProduct.зонаХранения || 'A-1',
          тип: 'расходная'
        } as РасходнаяСтрока;
        break;

      case 'инвентаризация':
        newLine = {
          id: Date.now(),
          documentId: document.id,
          товарId: selectedProduct.id,
          артикул: selectedProduct.артикул,
          наименование: selectedProduct.наименование,
          единицаИзмерения: selectedProduct.единицаИзмерения,
          количество: selectedProduct.остаток,
          фактическоеКоличество: selectedProduct.остаток,
          цена: selectedProduct.ценаПродажи,
          суммаПоУчету: selectedProduct.ценаПродажи * selectedProduct.остаток,
          суммаФактическая: selectedProduct.ценаПродажи * selectedProduct.остаток,
          тип: 'инвентаризация'
        } as ИнвентаризацияСтрока;
        break;

      case 'списание':
        newLine = {
          id: Date.now(),
          documentId: document.id,
          товарId: selectedProduct.id,
          артикул: selectedProduct.артикул,
          наименование: selectedProduct.наименование,
          единицаИзмерения: selectedProduct.единицаИзмерения,
          количество: selectedProduct.остаток,
          количествоСписания: 0,
          цена: selectedProduct.ценаЗакупки,
          сумма: selectedProduct.ценаЗакупки * selectedProduct.остаток,
          суммаСписания: 0,
          зонаХранения: selectedProduct.зонаХранения || 'A-1',
          тип: 'списание'
        } as СписаниеСтрока;
        break;

      case 'перемещение':
        newLine = {
          id: Date.now(),
          documentId: document.id,
          товарId: selectedProduct.id,
          артикул: selectedProduct.артикул,
          наименование: selectedProduct.наименование,
          единицаИзмерения: selectedProduct.единицаИзмерения,
          количество: 1,
          зонаХраненияОткуда: selectedProduct.зонаХранения || 'A-1',
          зонаХраненияКуда: 'A-1',
          тип: 'перемещение'
        } as ПеремещениеСтрока;
        break;

      default:
        return;
    }

    setLines(prev => [...prev, newLine]);
    setSelectedProduct(null);
  };

  const handleRemoveLine = (lineId: number) => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const handleFieldChange = (lineId: number, field: string, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        
        // Пересчитываем суммы в зависимости от типа документа
        switch (updatedLine.тип) {
          case 'приходная':
            const приходнаяЛиния = updatedLine as ПриходнаяСтрока;
            if (field === 'количество' || field === 'ценаЗакупки') {
              приходнаяЛиния.сумма = приходнаяЛиния.количество * приходнаяЛиния.ценаЗакупки;
            }
            if (field === 'ценаПродажи') {
              // Автоматически устанавливаем цену продажи на основе цены закупки если не заполнена
              if (!приходнаяЛиния.ценаПродажи && приходнаяЛиния.ценаЗакупки) {
                приходнаяЛиния.ценаПродажи = приходнаяЛиния.ценаЗакупки * 1.2; // Наценка 20%
              }
            }
            break;

          case 'расходная':
            const расходнаяЛиния = updatedLine as РасходнаяСтрока;
            if (field === 'количество' || field === 'ценаПродажи') {
              расходнаяЛиния.сумма = расходнаяЛиния.количество * расходнаяЛиния.ценаПродажи;
            }
            break;

          case 'инвентаризация':
            const инвЛиния = updatedLine as ИнвентаризацияСтрока;
            if (field === 'количество' || field === 'цена') {
              инвЛиния.суммаПоУчету = инвЛиния.количество * инвЛиния.цена;
            }
            if (field === 'фактическоеКоличество' || field === 'цена') {
              инвЛиния.суммаФактическая = инвЛиния.фактическоеКоличество * инвЛиния.цена;
            }
            break;

          case 'списание':
            const списаниеЛиния = updatedLine as СписаниеСтрока;
            if (field === 'количество' || field === 'цена') {
              списаниеЛиния.сумма = списаниеЛиния.количество * списаниеЛиния.цена;
            }
            if (field === 'количествоСписания' || field === 'цена') {
              списаниеЛиния.суммаСписания = списаниеЛиния.количествоСписания * списаниеЛиния.цена;
            }
            break;
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const handleNewProductFieldChange = (field: keyof NewProductFormData, value: string | number) => {
    setNewProductForm(prev => ({ ...prev, [field]: value }));
    
    // Автоматически рассчитываем цену продажи при изменении цены закупки
    if (field === 'ценаЗакупки' && newProductForm.ценаПродажи === 0) {
      const purchasePrice = Number(value) || 0;
      if (purchasePrice > 0) {
        setNewProductForm(prev => ({ 
          ...prev, 
          ценаПродажи: purchasePrice * 1.2 // Наценка 20%
        }));
      }
    }
  };

  const handleSave = () => {
    const updatedDocument = {
      ...document,
      строки: lines,
    };
    onSave(updatedDocument);
    onClose();
  };

  // Рассчитываем итоговые суммы в зависимости от типа документа
  const calculateTotals = () => {
    let totals = {
      totalQuantity: 0,
      totalAmount: 0,
      totalActualQuantity: 0,
      discrepancy: 0,
      totalPurchaseAmount: 0,
      profit: 0,
      totalWriteOffAmount: 0,
    };

    lines.forEach(line => {
      totals.totalQuantity += line.количество;

      switch (line.тип) {
        case 'приходная':
          totals.totalPurchaseAmount += (line as ПриходнаяСтрока).сумма;
          totals.totalAmount += (line as ПриходнаяСтрока).сумма;
          break;

        case 'расходная':
          totals.totalAmount += (line as РасходнаяСтрока).сумма;
          const product = products.find(p => p.id === line.товарId);
          if (product) {
            totals.profit += (line as РасходнаяСтрока).сумма - (product.ценаЗакупки * line.количество);
          }
          break;

        case 'инвентаризация':
          totals.totalAmount += (line as ИнвентаризацияСтрока).суммаПоУчету;
          totals.totalActualQuantity += (line as ИнвентаризацияСтрока).фактическоеКоличество;
          break;

        case 'списание':
          totals.totalAmount += (line as СписаниеСтрока).сумма;
          totals.totalWriteOffAmount += (line as СписаниеСтрока).суммаСписания;
          break;
      }
    });

    if (document.тип === 'инвентаризация') {
      totals.discrepancy = totals.totalActualQuantity - totals.totalQuantity;
    }

    return totals;
  };

  const totals = calculateTotals();

  // Получаем уникальные категории товаров в документе
  const categoriesInDocument = Array.from(
    new Set(
      lines
        .filter((line): line is ПриходнаяСтрока => line.тип === 'приходная')
        .map(line => (line as ПриходнаяСтрока).категория)
    )
  );

  // Получаем уникальные зоны хранения
  const storageZonesInDocument = Array.from(
    new Set(
      lines.flatMap(line => {
        if (line.тип === 'приходная') return [(line as ПриходнаяСтрока).зонаХранения];
        if (line.тип === 'расходная') return [(line as РасходнаяСтрока).зонаХранения];
        if (line.тип === 'списание') return [(line as СписаниеСтрока).зонаХранения];
        if (line.тип === 'перемещение') return [
          (line as ПеремещениеСтрока).зонаХраненияОткуда,
          (line as ПеремещениеСтрока).зонаХраненияКуда
        ];
        return [];
      }).filter(Boolean)
    )
  );

  // Рендерим строку таблицы в зависимости от типа документа
  const renderTableRow = (line: DocumentLine, index: number) => {
    switch (line.тип) {
      case 'приходная':
        const приходная = line as ПриходнаяСтрока;
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {приходная.артикул}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={приходная.категория} 
                size="small" 
                sx={{ maxWidth: '100px' }}
              />
            </TableCell>
            <TableCell>{приходная.наименование}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={приходная.количество}
                onChange={(e) => handleFieldChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell>{приходная.единицаИзмерения}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={приходная.ценаЗакупки}
                onChange={(e) => handleFieldChange(line.id, 'ценаЗакупки', parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ width: '100px' }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {приходная.сумма.toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <TextField
                value={приходная.ценаПродажи}
                onChange={(e) => handleFieldChange(line.id, 'ценаПродажи', parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ width: '100px' }}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={приходная.зонаХранения}
                  onChange={(e) => handleFieldChange(line.id, 'зонаХранения', e.target.value)}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 'расходная':
        const расходная = line as РасходнаяСтрока;
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {расходная.артикул}
              </Typography>
            </TableCell>
            <TableCell>{расходная.наименование}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={расходная.количество}
                onChange={(e) => handleFieldChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell>{расходная.единицаИзмерения}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={расходная.ценаПродажи}
                onChange={(e) => handleFieldChange(line.id, 'ценаПродажи', parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ width: '100px' }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {расходная.сумма.toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={расходная.зонаХранения}
                  onChange={(e) => handleFieldChange(line.id, 'зонаХранения', e.target.value)}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 'инвентаризация':
        const инвентаризация = line as ИнвентаризацияСтрока;
        const расхождение = инвентаризация.фактическоеКоличество - инвентаризация.количество;
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {инвентаризация.артикул}
              </Typography>
            </TableCell>
            <TableCell>{инвентаризация.наименование}</TableCell>
            <TableCell>{инвентаризация.единицаИзмерения}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={инвентаризация.количество}
                onChange={(e) => handleFieldChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {инвентаризация.суммаПоУчету.toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={инвентаризация.фактическоеКоличество}
                onChange={(e) => handleFieldChange(line.id, 'фактическоеКоличество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: расхождение < 0 ? 'error.main' : 'inherit', whiteSpace: 'nowrap' }}>
              {инвентаризация.суммаФактическая.toLocaleString('ru-RU')} ₽
              {расхождение !== 0 && (
                <Typography variant="caption" display="block" color={расхождение < 0 ? 'error' : 'success'}>
                  {расхождение > 0 ? '+' : ''}{расхождение} ед.
                </Typography>
              )}
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 'перемещение':
        const перемещение = line as ПеремещениеСтрока;
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {перемещение.артикул}
              </Typography>
            </TableCell>
            <TableCell>{перемещение.наименование}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={перемещение.количество}
                onChange={(e) => handleFieldChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell>{перемещение.единицаИзмерения}</TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={перемещение.зонаХраненияОткуда}
                  onChange={(e) => handleFieldChange(line.id, 'зонаХраненияОткуда', e.target.value)}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={перемещение.зонаХраненияКуда}
                  onChange={(e) => handleFieldChange(line.id, 'зонаХраненияКуда', e.target.value)}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
              >
                <Close />
              </IconButton>
            </TableCell>
          </TableRow>
        );

      case 'списание':
        const списание = line as СписаниеСтрока;
        return (
          <TableRow key={line.id} hover>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {списание.артикул}
              </Typography>
            </TableCell>
            <TableCell>{списание.наименование}</TableCell>
            <TableCell>{списание.единицаИзмерения}</TableCell>
            <TableCell>
              <TextField
                type="number"
                value={списание.количество}
                onChange={(e) => handleFieldChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0 }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {списание.сумма.toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={списание.количествоСписания}
                onChange={(e) => handleFieldChange(line.id, 'количествоСписания', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: '80px' }}
                inputProps={{ min: 0, max: списание.количество }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'error.main', whiteSpace: 'nowrap' }}>
              {списание.суммаСписания.toLocaleString('ru-RU')} ₽
            </TableCell>
            <TableCell>
              <FormControl fullWidth size="small">
                <Select
                  value={списание.зонаХранения}
                  onChange={(e) => handleFieldChange(line.id, 'зонаХранения', e.target.value)}
                >
                  {storageZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell align="center">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLine(line.id)}
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
    switch (document.тип) {
      case 'приходная':
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

      case 'расходная':
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

      case 'инвентаризация':
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="120px">Кол-во по учёту</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="120px">Кол-во фактическое</TableCell>
            <TableCell width="130px">Сумма</TableCell>
            <TableCell width="60px" align="center">Действия</TableCell>
          </>
        );

      case 'перемещение':
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

      case 'списание':
        return (
          <>
            <TableCell width="50px">№</TableCell>
            <TableCell width="100px">Артикул</TableCell>
            <TableCell>Наименование</TableCell>
            <TableCell width="90px">Ед. изм.</TableCell>
            <TableCell width="120px">Кол-во на складе</TableCell>
            <TableCell width="120px">Сумма</TableCell>
            <TableCell width="120px">Кол-во списания</TableCell>
            <TableCell width="130px">Сумма списания</TableCell>
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
    switch (document.тип) {
      case 'приходная':
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

      case 'расходная':
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

      case 'инвентаризация':
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
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {totals.totalAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                {totals.totalActualQuantity} ед.
              </Typography>
              {totals.discrepancy !== 0 && (
                <Typography variant="caption" color={totals.discrepancy < 0 ? 'error' : 'success'}>
                  Расхождение: {totals.discrepancy > 0 ? '+' : ''}{totals.discrepancy} ед.
                </Typography>
              )}
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {(totals.totalAmount + totals.discrepancy * (lines[0] as ИнвентаризацияСтрока)?.цена || 0).toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        );

      case 'списание':
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
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600}>
                {lines.reduce((sum, line) => sum + (line as СписаниеСтрока).количествоСписания, 0)} ед.
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight={600} color="error.main" sx={{ whiteSpace: 'nowrap' }}>
                {totals.totalWriteOffAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        );

      case 'перемещение':
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

      default:
        return null;
    }
  };

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
                Заполнение документа: {document.номер}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {document.дата} • {document.комментарий}
              </Typography>
            </Box>
            <Chip
              label={document.тип}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ overflow: 'hidden' }}>
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
            gap: 2, // Добавляем отступ между компонентами
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
                options={products.filter(p => !lines.some(l => l.товарId === p.id))}
                getOptionLabel={(option) => `${option.артикул} - ${option.наименование}`}
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
                {document.тип === 'приходная' && (
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
                            value={newProductForm.артикул}
                            onChange={(e) => handleNewProductFieldChange('артикул', e.target.value)}
                            size="small"
                            fullWidth
                            required
                        />
                        
                        <TextField
                            label="Наименование"
                            value={newProductForm.наименование}
                            onChange={(e) => handleNewProductFieldChange('наименование', e.target.value)}
                            size="small"
                            fullWidth
                            required
                        />
                        
                        <Autocomplete
                            freeSolo
                            value={newProductForm.категория}
                            onChange={(_, newValue) => handleNewProductFieldChange('категория', newValue || '')}
                            options={categories}
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
                            value={newProductForm.ценаЗакупки}
                            onChange={(e) => handleNewProductFieldChange('ценаЗакупки', parseFloat(e.target.value) || 0)}
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
                            value={newProductForm.ценаПродажи}
                            onChange={(e) => handleNewProductFieldChange('ценаПродажи', parseFloat(e.target.value) || 0)}
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
                            value={newProductForm.единицаИзмерения}
                            onChange={(_, newValue) => handleNewProductFieldChange('единицаИзмерения', newValue || 'шт')}
                            options={units}
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
                                value={newProductForm.зонаХранения}
                                required
                                onChange={(e) => handleNewProductFieldChange('зонаХранения', e.target.value)}
                            >
                                {storageZones.map(zone => (
                                <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                                ))}
                            </Select>
                            </FormControl>
                        </Box>
                        
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddNewProduct}
                            disabled={!newProductForm.артикул.trim() || !newProductForm.наименование.trim() }
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
                    <strong>Артикул:</strong> {selectedProduct.артикул}
                    </Typography>
                    <Typography variant="body2">
                    <strong>Наименование:</strong> {selectedProduct.наименование}
                    </Typography>
                    <Typography variant="body2">
                    <strong>Категория:</strong> {selectedProduct.категория}
                    </Typography>
                    <Typography variant="body2">
                    <strong>Цена закупки:</strong> {selectedProduct.ценаЗакупки} ₽
                    </Typography>
                    <Typography variant="body2">
                    <strong>Цена продажи:</strong> {selectedProduct.ценаПродажи} ₽
                    </Typography>
                    <Typography variant="body2">
                    <strong>Остаток на складе:</strong> {selectedProduct.остаток} {selectedProduct.единицаИзмерения}
                    </Typography>
                    <Typography variant="body2">
                    <strong>Зона хранения:</strong> {selectedProduct.зонаХранения || 'Не указана'}
                    </Typography>
                </Paper>
                )}
                
                <Button
                variant="contained"
                fullWidth
                onClick={handleAddLine}
                disabled={!selectedProduct}
                sx={{ mb: 2 }}
                startIcon={<AddCircle />}
                >
                Добавить выбранный товар
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
                    
                    {document.тип === 'приходная' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма закупки:</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                        {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                    </Box>
                    )}
                    
                    {document.тип === 'расходная' && (
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
                    
                    {document.тип === 'инвентаризация' && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма по учёту:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Фактическое кол-во:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {totals.totalActualQuantity}
                        </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Расхождение:</Typography>
                        <Typography variant="body2" fontWeight={600} color={totals.discrepancy !== 0 ? "error" : "success"}>
                            {totals.discrepancy > 0 ? '+' : ''}{totals.discrepancy} ед.
                        </Typography>
                        </Box>
                    </>
                    )}
                    
                    {document.тип === 'списание' && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма на складе:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {totals.totalAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Сумма списания:</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                            {totals.totalWriteOffAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                        </Box>
                    </>
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
              {lines.length > 0 ? (
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
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Тип:</strong> {document.тип} • 
            <strong> Строк:</strong> {lines.length} • 
            <strong> Товаров:</strong> {lines.length} ед.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined">
            Закрыть без сохранения
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={lines.length === 0}
          >
            Сохранить документ
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};