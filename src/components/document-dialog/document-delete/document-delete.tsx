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
  Chip,
} from '@mui/material';
import { Company, Document, DocumentType } from '../../../pages';
import { 
  ShoppingCart, 
  ArrowForward, 
  Inventory, 
  RemoveCircle, 
  Assessment 
} from '@mui/icons-material';

export interface DocumentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDocument: Document | null;
  documentTypes?: DocumentType[]; // Добавлено для отображения типа
  companies?: Company[]; // Добавлено для отображения компании
}

export const DocumentDeleteDialog: React.FC<DocumentDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedDocument,
  documentTypes = [],
  companies = [],
}) => {
  // Находим тип документа по ID
  const getDocumentTypeConfig = (typeId: number) => {
    const typeConfig = {
      1: { // Приход
        bgColor: '#d4edda',
        color: '#155724',
        icon: <ShoppingCart fontSize="small" />,
        label: 'Приход'
      },
      2: { // Расход
        bgColor: '#f8d7da',
        color: '#721c24',
        icon: <ShoppingCart fontSize="small" />,
        label: 'Расход'
      },
      3: { // Перемещение
        bgColor: '#cce5ff',
        color: '#004085',
        icon: <ArrowForward fontSize="small" />,
        label: 'Перемещение'
      },
      4: { // Инвентаризация
        bgColor: '#fff3cd',
        color: '#856404',
        icon: <Inventory fontSize="small" />,
        label: 'Инвентаризация'
      },
      5: { // Списание
        bgColor: '#d1ecf1',
        color: '#0c5460',
        icon: <RemoveCircle fontSize="small" />,
        label: 'Списание'
      },
      6: { // Отчёт
        bgColor: '#e6ccff',
        color: '#6610f2',
        icon: <Assessment fontSize="small" />,
        label: 'Отчёт'
      },
    };

    return typeConfig[typeId as keyof typeof typeConfig] || {
      bgColor: '#e0e0e0',
      color: '#424242',
      icon: null,
      label: 'Неизвестный тип'
    };
  };

  // Находим название типа документа
  const getDocumentTypeName = (typeId: number) => {
    const docType = documentTypes.find(type => type.id === typeId);
    return docType ? docType.name : 'Неизвестный тип';
  };

  // Находим название компании
  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Не указан';
  };

  if (!selectedDocument) {
    return null;
  }

  const typeConfig = getDocumentTypeConfig(selectedDocument.document_type_id);
  const typeName = getDocumentTypeName(selectedDocument.document_type_id);
  const companyName = getCompanyName(selectedDocument.company_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Вы уверены, что хотите удалить документ "{selectedDocument.number}"?
          Это действие нельзя отменить.
        </Alert>
        
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Тип документа:
            </Typography>
            <Chip
              icon={typeConfig.icon}
              label={typeName}
              size="small"
              sx={{
                backgroundColor: typeConfig.bgColor,
                color: typeConfig.color,
                fontWeight: 500,
                ml: 2,
              }}
            />
          </Box>
          
          <Typography variant="body2" paragraph>
            <strong>Номер:</strong> {selectedDocument.number}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Дата:</strong> {selectedDocument.date}
          </Typography>
          
          {selectedDocument.comment && (
            <Typography variant="body2" paragraph>
              <strong>Комментарий:</strong> {selectedDocument.comment}
            </Typography>
          )}
          
          {selectedDocument.document_type_id === 1 && selectedDocument.company_id && (
            <Typography variant="body2" paragraph>
              <strong>Поставщик:</strong> {companyName}
            </Typography>
          )}
          
          {/* Здесь можно добавить отображение количества строк, если есть */}
          {/* <Typography variant="body2" color="text.secondary">
            <strong>Строк товаров:</strong> {selectedDocument.строки?.length || 0}
          </Typography> */}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
          Отмена
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          sx={{ minWidth: 100 }}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDeleteDialog;