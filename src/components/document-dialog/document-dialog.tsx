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
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  Description,
  Close,
  AddCircle,
  RemoveCircle,
  Save,
  Inventory,
  Assessment,
} from '@mui/icons-material';
import { Document, DocumentLine, Product } from './../../pages';

// Диалог для заполнения документа строками
interface FillDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document;
  products: Product[];
  onSave: (document: Document) => void;
}

export const FillDocumentDialog: React.FC<FillDocumentDialogProps> = ({ 
  open, 
  onClose, 
  document, 
  products,
  onSave 
}) => {
  const [lines, setLines] = useState<DocumentLine[]>(document.строки || []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Проверяем, нужны ли фактические количества для этого типа документа
  const needsActualQuantity = ['инвентаризация', 'списание'].includes(document.тип);
  
  // Проверяем, является ли документ расходным для отображения остатков
  const isOutgoingDocument = ['расходная', 'списание'].includes(document.тип);

  const handleAddLine = () => {
    if (!selectedProduct) return;

    // Проверяем остатки для расходных документов
    if (isOutgoingDocument) {
      const currentLinesQuantity = lines
        .filter(line => line.товарId === selectedProduct.id)
        .reduce((sum, line) => sum + line.количество, 0);
      
      if (currentLinesQuantity + 1 > selectedProduct.остаток) {
        alert(`Недостаточно остатков! Доступно: ${selectedProduct.остаток} ${selectedProduct.единицаИзмерения}`);
        return;
      }
    }

    const newLine: DocumentLine = {
      id: Date.now(),
      documentId: document.id,
      товарId: selectedProduct.id,
      артикул: selectedProduct.артикул,
      наименование: selectedProduct.наименование,
      ценаЗакупки: selectedProduct.ценаЗакупки,
      ценаПродажи: document.тип === 'приходная' ? selectedProduct.ценаЗакупки : selectedProduct.ценаПродажи,
      количество: 1,
      фактическоеКоличество: needsActualQuantity ? 1 : undefined,
      единицаИзмерения: selectedProduct.единицаИзмерения,
      категория: selectedProduct.категория,
      сумма: (document.тип === 'приходная' ? selectedProduct.ценаЗакупки : selectedProduct.ценаПродажи) * 1,
    };

    setLines(prev => [...prev, newLine]);
    setSelectedProduct(null);
  };

  const handleRemoveLine = (lineId: number) => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const handleQuantityChange = (lineId: number, field: 'количество' | 'фактическоеКоличество', value: number) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const newQuantity = field === 'количество' ? value : line.количество;
        const actualQuantity = field === 'фактическоеКоличество' ? value : line.фактическоеКоличество;
        
        // Для расходных документов проверяем остатки
        if (field === 'количество' && isOutgoingDocument) {
          const product = products.find(p => p.id === line.товарId);
          if (product) {
            const otherLinesQuantity = lines
              .filter(l => l.id !== lineId && l.товарId === product.id)
              .reduce((sum, l) => sum + l.количество, 0);
            
            if (otherLinesQuantity + value > product.остаток) {
              alert(`Недостаточно остатков! Доступно: ${product.остаток - otherLinesQuantity} ${product.единицаИзмерения}`);
              return line;
            }
          }
        }

        return {
          ...line,
          [field]: value,
          сумма: line.ценаПродажи * newQuantity,
          ...(field === 'фактическоеКоличество' ? { фактическоеКоличество: value } : { количество: value })
        };
      }
      return line;
    }));
  };

  const handlePriceChange = (lineId: number, field: 'ценаЗакупки' | 'ценаПродажи', value: number) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          [field]: value,
          сумма: field === 'ценаПродажи' ? value * line.количество : line.сумма
        };
      }
      return line;
    }));
  };

  const handleSave = () => {
    const updatedDocument = {
      ...document,
      строки: lines,
    };
    onSave(updatedDocument);
    onClose();
  };

  // Рассчитываем итоговые суммы
  const totalQuantity = lines.reduce((sum, line) => sum + line.количество, 0);
  const totalAmount = lines.reduce((sum, line) => sum + line.сумма, 0);
  const totalActualQuantity = lines.reduce((sum, line) => sum + (line.фактическоеКоличество || line.количество), 0);
  const discrepancy = needsActualQuantity ? totalActualQuantity - totalQuantity : 0;
  const totalPurchaseAmount = lines.reduce((sum, line) => sum + (line.ценаЗакупки * line.количество), 0);
  const profit = totalAmount - totalPurchaseAmount;

  // Получаем уникальные категории товаров в документе
  const categoriesInDocument = Array.from(new Set(lines.map(line => line.категория)));

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
            minWidth: { md: 300 },
            flexShrink: 0 
          }}>
            <Paper sx={{ p: 2, mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                <AddCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Добавить товар
              </Typography>
              
              <Autocomplete
                value={selectedProduct}
                onChange={(_, newValue) => setSelectedProduct(newValue)}
                options={products.filter(p => !lines.some(l => l.товарId === p.id))}
                getOptionLabel={(option) => `${option.артикул} - ${option.наименование}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Поиск товара"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                )}
              />
              
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
                  <Typography variant="body2" color={isOutgoingDocument && selectedProduct.остаток === 0 ? "error" : "text.primary"}>
                    <strong>Остаток на складе:</strong> {selectedProduct.остаток} {selectedProduct.единицаИзмерения}
                  </Typography>
                </Paper>
              )}
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddLine}
                disabled={!selectedProduct}
                sx={{ mb: 3 }}
                startIcon={<AddCircle />}
              >
                Добавить в документ
              </Button>
              
              <Divider sx={{ my: 2 }} />
              
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
                      {totalQuantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Сумма документа:</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {totalAmount.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                  {needsActualQuantity && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Фактическое кол-во:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {totalActualQuantity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Расхождение:</Typography>
                        <Typography variant="body2" fontWeight={600} color={discrepancy !== 0 ? "error" : "success"}>
                          {discrepancy > 0 ? '+' : ''}{discrepancy}
                        </Typography>
                      </Box>
                    </>
                  )}
                  {document.тип === 'расходная' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Прибыль:</Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {profit.toLocaleString('ru-RU')} ₽
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
                          <TableCell width="80px">№</TableCell>
                          <TableCell width="120px">Артикул</TableCell>
                          <TableCell>Наименование товара</TableCell>
                          <TableCell width="100px">Категория</TableCell>
                          <TableCell width="90px" align="center">Ед. изм.</TableCell>
                          <TableCell width="120px" align="right">Цена закупки</TableCell>
                          <TableCell width="120px" align="right">Цена продажи</TableCell>
                          <TableCell width="140px" align="center">Количество по учёту</TableCell>
                          {needsActualQuantity && (
                            <TableCell width="140px" align="center">Фактическое количество</TableCell>
                          )}
                          <TableCell width="120px" align="right">Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lines.map((line, index) => {
                          const product = products.find(p => p.id === line.товарId);
                          const discrepancy = needsActualQuantity && line.фактическоеКоличество !== undefined 
                            ? line.фактическоеКоличество - line.количество 
                            : 0;
                          
                          return (
                            <TableRow key={line.id} hover>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {line.артикул}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">{line.наименование}</Typography>
                                  {isOutgoingDocument && product && (
                                    <Typography variant="caption" color="text.secondary">
                                      Остаток: {product.остаток} {product.единицаИзмерения}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={line.категория} 
                                  size="small" 
                                  sx={{ maxWidth: '100px' }}
                                />
                              </TableCell>
                              <TableCell align="center">{line.единицаИзмерения}</TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  value={line.ценаЗакупки}
                                  onChange={(e) => handlePriceChange(line.id, 'ценаЗакупки', parseFloat(e.target.value) || 0)}
                                  size="small"
                                  sx={{ width: '100px' }}
                                  inputProps={{ 
                                    min: 0, 
                                    style: { textAlign: 'left' }
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  value={line.ценаПродажи}
                                  onChange={(e) => handlePriceChange(line.id, 'ценаПродажи', parseFloat(e.target.value) || 0)}
                                  size="small"
                                  sx={{ width: '100px' }}
                                  inputProps={{ 
                                    min: 0, 
                                    style: { textAlign: 'left' }
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                type="number"
                                value={line.количество}
                                onChange={(e) => handleQuantityChange(line.id, 'количество', parseInt(e.target.value) || 0)}
                                size="small"
                                sx={{ width: '80px' }}
                                inputProps={{ 
                                    min: 0,
                                    style: { textAlign: 'left' }
                                }}
                                />
                              </TableCell>
                              {needsActualQuantity && (
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleQuantityChange(line.id, 'фактическоеКоличество', Math.max(0, (line.фактическоеКоличество || 0) - 1))}
                                    >
                                      <RemoveCircle fontSize="small" />
                                    </IconButton>
                                    <TextField
                                      type="number"
                                      value={line.фактическоеКоличество || ''}
                                      onChange={(e) => handleQuantityChange(line.id, 'фактическоеКоличество', parseInt(e.target.value) || 0)}
                                      size="small"
                                      sx={{ width: '60px' }}
                                      inputProps={{ 
                                        min: 0,
                                        style: { textAlign: 'center' }
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleQuantityChange(line.id, 'фактическоеКоличество', (line.фактическоеКоличество || 0) + 1)}
                                    >
                                      <AddCircle fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  {discrepancy !== 0 && (
                                    <Typography 
                                      variant="caption" 
                                      color={discrepancy > 0 ? "success.main" : "error.main"}
                                      display="block"
                                    >
                                      {discrepancy > 0 ? '+' : ''}{discrepancy}
                                    </Typography>
                                  )}
                                </TableCell>
                              )}
                              <TableCell align="left" sx={{ fontWeight: 600 }}>
                                {line.сумма.toLocaleString('ru-RU')} ₽
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
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={needsActualQuantity ? 8 : 7} align="right">
                            <Typography variant="subtitle1" fontWeight={600}>
                              Итого:
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                              {totalQuantity}
                            </Typography>
                          </TableCell>
                          {needsActualQuantity && (
                            <TableCell align="center">
                              <Typography variant="subtitle1" fontWeight={600}>
                                {totalActualQuantity}
                              </Typography>
                              {discrepancy !== 0 && (
                                <Typography 
                                  variant="caption" 
                                  color={discrepancy > 0 ? "success.main" : "error.main"}
                                  display="block"
                                >
                                  Расхождение: {discrepancy > 0 ? '+' : ''}{discrepancy}
                                </Typography>
                              )}
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight={600} color="primary">
                              {totalAmount.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
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
            <strong> Сумма:</strong> {totalAmount.toLocaleString('ru-RU')} ₽
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