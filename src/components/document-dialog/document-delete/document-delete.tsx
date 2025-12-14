import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { Document } from './../../../pages';

export interface DocumentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDocument: Document | null;
}

export const DocumentDeleteDialog: React.FC<DocumentDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedDocument,
}) => {
  const DocumentTypeChip: React.FC<{ type: Document['тип'] }> = ({ type }) => {
    const typeConfig = {
      'приходная': { 
        bgColor: '#d4edda', 
        color: '#155724',
        label: 'Приходная'
      },
      'расходная': { 
        bgColor: '#f8d7da', 
        color: '#721c24',
        label: 'Расходная'
      },
      'инвентаризация': { 
        bgColor: '#fff3cd', 
        color: '#856404',
        label: 'Инвентаризация'
      },
      'списание': { 
        bgColor: '#d1ecf1', 
        color: '#0c5460',
        label: 'Списание'
      },
      'перемещение': { 
        bgColor: '#cce5ff', 
        color: '#004085',
        label: 'Перемещение'
      },
      'отчёт': { 
        bgColor: '#e6ccff', 
        color: '#6610f2',
        label: 'Отчёт'
      },
    };

    const config = typeConfig[type];
    
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: config.bgColor,
          color: config.color,
          fontSize: '0.75rem',
          fontWeight: 500,
          ml: 1,
        }}
      >
        {config.label}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вы уверены, что хотите удалить документ "{selectedDocument?.номер}"?
          Это действие нельзя отменить.
        </Alert>
        {selectedDocument && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Тип:</strong> <DocumentTypeChip type={selectedDocument.тип} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Дата:</strong> {selectedDocument.дата}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Комментарий:</strong> {selectedDocument.комментарий}
            </Typography>
            {selectedDocument.поставщик && selectedDocument.тип === 'приходная' && (
              <Typography variant="body2" color="text.secondary">
                <strong>Поставщик:</strong> {selectedDocument.поставщик}
              </Typography>
            )}
            {selectedDocument.строки && selectedDocument.строки.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                <strong>Строк товаров:</strong> {selectedDocument.строки.length}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDeleteDialog;