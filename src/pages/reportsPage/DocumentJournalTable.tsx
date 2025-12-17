// src/pages/reportsPage/DocumentJournalTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { Document, DocumentLine, Product, DocumentType } from "./types";

interface DocumentJournalTableProps {
  documents: Document[];
  documentLines: DocumentLine[];
  products: Product[];
  documentTypes: DocumentType[]; // добавляем сюда массив типов документов
}

const DocumentJournalTable: React.FC<DocumentJournalTableProps> = ({
  documents,
  documentLines,
  products,
  documentTypes,
}) => {
  if (!documents.length) return <Typography>Нет документов</Typography>;

  // Создаем мапу id -> name для типов документов
  const documentTypeMap: Record<number, string> = {};
  documentTypes.forEach((dt) => {
    documentTypeMap[dt.id] = dt.name;
  });

  // Функция для расчета общей суммы документа
  const getDocumentTotal = (docId: number) => {
    const lines = documentLines.filter((line) => line.document_id === docId);
    let total = 0;
    lines.forEach((line) => {
      const product = products.find((p) => p.id === line.product_id);
      if (product && (line.actual_quantity ?? line.quantity) > 0) {
        total += (line.actual_quantity ?? line.quantity) * ((product.sell_price as number) || 0);
      }
    });
    return total.toFixed(2);
  };

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Журнал накладных
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Номер документа</TableCell>
            <TableCell>Тип документа</TableCell>
            <TableCell>Дата документа</TableCell>
            <TableCell>Количество позиций</TableCell>
            <TableCell>Сумма документа</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => {
            const lines = documentLines.filter((line) => line.document_id === doc.id);
            const positionsCount = lines.reduce(
              (sum, l) => sum + (l.actual_quantity ?? l.quantity),
              0
            );
            if (positionsCount === 0) return null; // не выводим пустые документы

            const docTypeName = documentTypeMap[doc.document_type_id] || "Не определен";

            return (
              <TableRow key={doc.id}>
                <TableCell>{doc.number}</TableCell>
                <TableCell>{docTypeName}</TableCell>
                <TableCell>{doc.date || "—"}</TableCell>
                <TableCell>{positionsCount}</TableCell>
                <TableCell>{getDocumentTotal(doc.id)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DocumentJournalTable;
