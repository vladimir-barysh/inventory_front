// src/pages/reportsPage/DocumentReportsTable.tsx
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { Document, DocumentLine, Product } from "./types";

export interface DocumentReportsTableProps {
  documents: Document[];
  documentLines: DocumentLine[];
  products: Product[];
}

const DocumentReportsTable: React.FC<DocumentReportsTableProps> = ({ documents, documentLines, products }) => {
  // Фильтруем документы, у которых есть строки
  const docsWithLines = documents
    .map(doc => {
      const linesCount = documentLines.filter(line => line.document_id === doc.id).length;
      return { doc, linesCount };
    })
    .filter(d => d.linesCount > 0); // только документы с позициями

  if (docsWithLines.length === 0) return null; // если нет данных, скрываем таблицу

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Отчеты по документам
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Название документа</TableCell>
            <TableCell>Количество позиций</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {docsWithLines.map(({ doc, linesCount }) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.number}</TableCell>
              <TableCell>{linesCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DocumentReportsTable;
