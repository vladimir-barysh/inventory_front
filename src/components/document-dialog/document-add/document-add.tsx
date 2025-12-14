import React, { useState } from 'react';
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
import { DocumentFormData } from './../../../pages';

export interface DocumentAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => void;
  initialData?: DocumentFormData;
  isEdit?: boolean;
  suppliers?: string[];
}

export const DocumentAddDialog: React.FC<DocumentAddDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  suppliers = [],
}) => {
  const [formData, setFormData] = useState<DocumentFormData>(
    initialData || {
      номер: '',
      дата: new Date().toLocaleDateString('ru-RU'),
      комментарий: '',
      тип: 'приходная',
      поставщик: '',
    }
  );

  const [supplierInput, setSupplierInput] = useState<string>('');

  const handleChange = (field: keyof DocumentFormData, value: string) => {
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
              value={formData.номер}
              onChange={(e) => handleChange('номер', e.target.value)}
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
              value={formData.дата}
              onChange={(e) => handleChange('дата', e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange fontSize="small" />
                  </InputAdornment>
                ),
              }}
              placeholder="дд.мм.гггг"
            />
          </Box>

          {/* Тип документа */}
          <FormControl fullWidth>
            <InputLabel>Тип документа</InputLabel>
            <Select
              value={formData.тип}
              label="Тип документа"
              onChange={(e) => handleChange('тип', e.target.value)}
            >
              <MenuItem value="приходная">Приходная накладная</MenuItem>
              <MenuItem value="расходная">Расходная накладная</MenuItem>
              <MenuItem value="инвентаризация">Акт инвентаризации</MenuItem>
              <MenuItem value="списание">Акт списания</MenuItem>
              <MenuItem value="перемещение">Заявка на перемещение</MenuItem>
              <MenuItem value="отчёт">Отчёт</MenuItem>
            </Select>
          </FormControl>

          {/* Поле поставщика (только для приходных накладных) */}
          {formData.тип === 'приходная' && (
            <>
              <Autocomplete
                freeSolo
                options={suppliers}
                value={formData.поставщик || ''}
                inputValue={supplierInput}
                onInputChange={(event, newInputValue) => {
                  setSupplierInput(newInputValue);
                }}
                onChange={(event, newValue) => {
                  handleChange('поставщик', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Поставщик"
                    placeholder="Начните вводить или выберите из списка"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography variant="body2">{option}</Typography>
                  </li>
                )}
                filterOptions={(options, state) => {
                  const inputValue = state.inputValue.toLowerCase();
                  return options.filter(option =>
                    option.toLowerCase().includes(inputValue)
                  );
                }}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    color: 'primary.main',
                  }
                }}
              />
            </>
          )}

          {/* Комментарий */}
          <TextField
            label="Комментарий"
            value={formData.комментарий}
            onChange={(e) => handleChange('комментарий', e.target.value)}
            fullWidth
            multiline
            rows={formData.тип === 'приходная' ? 2 : 3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Comment fontSize="small" />
                </InputAdornment>
              ),
            }}
            disabled={formData.тип === 'отчёт'}
            placeholder={'Введите комментарий'}
          />
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

export default DocumentAddDialog;