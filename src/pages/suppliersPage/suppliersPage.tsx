import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Button, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search, Add, Edit, Delete } from '@mui/icons-material';
import { Company, CompanyType, getCompanies, getCompanyTypes, postCompany, putCompany, deleteCompanyById } from './makeData';

// Тип компании с иконкой
const typeConfig: Record<string, { icon: string; color: string }> = {
  'ООО': { icon: '🏢', color: '#1565c0' },
  'ИП': { icon: '👤', color: '#7b1fa2' },
  'АО': { icon: '🏛️', color: '#2e7d32' },
  'ЗАО': { icon: '🔒', color: '#ef6c00' },
  'ТОО': { icon: '🌐', color: '#ff5722' },  
};


const TypeChip: React.FC<{ typeName: string | null }> = ({ typeName }) => {
  if (!typeName) return null;
  const cfg = typeConfig[typeName] || { icon: '', color: '#000' };
  return <Chip label={`${cfg.icon} ${typeName}`} sx={{ color: cfg.color }} size="small" />;
};

// Диалог добавления/редактирования компании
interface CompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; company_type_id: number }) => void;
  initialData?: { name: string; company_type_id: number };
  companyTypes: CompanyType[];
  isEdit?: boolean;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({ open, onClose, onSubmit, initialData, companyTypes, isEdit = false }) => {
  const [formData, setFormData] = useState<{ name: string; company_type_id: number }>({
    name: initialData?.name || '',
    company_type_id: initialData?.company_type_id || (companyTypes[0]?.id ?? 0),
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: 'name' | 'company_type_id', value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Редактировать компанию' : 'Добавить компанию'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Тип компании</InputLabel>
            <Select
              value={formData.company_type_id}
              onChange={e => handleChange('company_type_id', Number(e.target.value))}
            >
              {companyTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Наименование"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">{isEdit ? 'Сохранить' : 'Добавить'}</Button>
      </DialogActions>
    </Dialog>
  );
};

// Основная страница
export const SuppliersPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getCompanyTypes();
        setCompanyTypes(types);
        const comps = await getCompanies();
        setCompanies(comps);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company_type ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => { setSelectedCompany(null); setIsEditing(false); setDialogOpen(true); };
  const handleEdit = (company: Company) => { setSelectedCompany(company); setIsEditing(true); setDialogOpen(true); };
  const handleDelete = async (company: Company) => {
    if (!window.confirm(`Удалить компанию "${company.name}"?`)) return;
    await deleteCompanyById(company.id);
    setCompanies(prev => prev.filter(c => c.id !== company.id));
  };

  const handleDialogSubmit = async (data: { name: string; company_type_id: number }) => {
    try {
      if (isEditing && selectedCompany) {
        const updated = await putCompany(selectedCompany.id, data);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await postCompany(data);
        setCompanies(prev => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Добавить</Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Наименование</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map(c => (
                <TableRow key={c.id}>
                  <TableCell><TypeChip typeName={c.company_type} /></TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(c)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredCompanies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
        />
      </Paper>

      <CompanyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialData={selectedCompany ? { name: selectedCompany.name, company_type_id: selectedCompany.company_type_id } : undefined}
        companyTypes={companyTypes}
        isEdit={isEditing}
      />
    </Box>
  );
};
