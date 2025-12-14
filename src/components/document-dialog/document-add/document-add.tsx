import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Description,
  DateRange,
  Comment,
} from '@mui/icons-material';
import { DocumentType, Company, Document, DocumentCreate} from './../../../pages';

export interface DocumentAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentCreate) => void;
  initialData?: Document; 
  isEdit?: boolean;
  suppliers?: Company[];
  documentTypes: DocumentType[];
}

export const DocumentAddDialog: React.FC<DocumentAddDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  suppliers = [],
  documentTypes,
}) => {
  // Инициализация формы
  type FormData = Omit<DocumentCreate, 'comment'> & {
    comment?: string;
  };

  const [formData, setFormData] = useState<FormData>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    comment: '',
    company_id: undefined,
    document_type_id: documentTypes[0]?.id || 1,
  });

  const [selectedSupplier, setSelectedSupplier] = useState<Company | null>(null);

  // Эффект для обновления формы
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        number: initialData.number || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        comment: initialData.comment || '',
        company_id: initialData.company_id,
        document_type_id: initialData.document_type_id || documentTypes[0]?.id || 1,
      });

      // Находим поставщика по ID
      if (initialData.company_id && suppliers.length > 0) {
        const supplier = suppliers.find(s => s.id === initialData.company_id);
        setSelectedSupplier(supplier || null);
      } else {
        setSelectedSupplier(null);
      }
    } else if (!initialData && open) {
      // Сброс формы для создания нового документа
      setFormData({
        number: '',
        date: new Date().toISOString().split('T')[0],
        comment: '',
        company_id: undefined,
        document_type_id: documentTypes[0]?.id || 1,
      });
      setSelectedSupplier(null);
    }
  }, [initialData, suppliers, documentTypes, open]);

  const handleChange = (field: keyof DocumentCreate, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (newValue: Company | null) => {
    setSelectedSupplier(newValue);
    handleChange('company_id', newValue?.id);
  };

  const handleSubmit = () => {
    const formattedData: DocumentCreate = {
      number: formData.number,
      date: formData.date || new Date().toISOString().split('T')[0],
      comment: formData.comment?.trim() || undefined,
      company_id: formData.company_id,
      document_type_id: formData.document_type_id,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          {isEdit ? 'Редактировать документ' : 'Добавить новый документ'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {/* Основная информация */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Номер документа"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Дата"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Тип документа из БД */}
          <FormControl fullWidth>
            <InputLabel>Тип документа</InputLabel>
            <Select
              value={formData.document_type_id}
              label="Тип документа"
              onChange={(e) => handleChange('document_type_id', Number(e.target.value))}
            >
              {documentTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Поле поставщика (только для приходных документов) */}
          {formData.document_type_id === 1 && suppliers.length > 0 && (
            <Autocomplete
              options={suppliers}
              value={selectedSupplier}
              onChange={(event, newValue) => handleSupplierChange(newValue)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Поставщик"
                  placeholder="Выберите поставщика"
                  fullWidth
                />
              )}
              renderOption={(props, option) => {
                // Извлекаем key из props и используем его отдельно
                const { key, ...restProps } = props;
                return (
                  <li key={key} {...restProps}>
                    <Typography variant="body2">{option.name}</Typography>
                  </li>
                );
              }}
            />
          )}

          {/* Комментарий */}
          <TextField
            label="Комментарий"
            value={formData.comment || ''}
            onChange={(e) => handleChange('comment', e.target.value)}
            fullWidth
            multiline
            rows={formData.document_type_id === 1 ? 2 : 3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Comment fontSize="small" />
                </InputAdornment>
              ),
            }}
            placeholder="Введите комментарий"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.number || !formData.document_type_id || (formData.document_type_id === 1 && !formData.company_id)}
        >
          {isEdit ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentAddDialog;