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
import { Product, DocumentLine } from "./types";

interface ProductStockTableProps {
  products: Product[];
  documentLines: DocumentLine[];
}

const ProductStockTable: React.FC<ProductStockTableProps> = ({
  products,
  documentLines,
}) => {
  const stockByProduct = products
    .map((product) => {
      const lines = documentLines.filter(
        (line) => line.product_id === product.id
      );
      const total = lines.reduce(
        (sum, l) => sum + (l.actual_quantity ?? l.quantity),
        0
      );
      return { name: product.name, total };
    })
    .filter((p) => p.total > 0);

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Отчет об остатках товаров
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Товар</TableCell>
            <TableCell>Остаток на складе</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stockByProduct.map((p, idx) => (
            <TableRow key={idx}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default ProductStockTable;
