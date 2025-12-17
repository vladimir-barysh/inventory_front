// src/pages/reportsPage/CategoryStockTable.tsx
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
import { Product, DocumentLine, Category } from "./types";

interface CategoryStockTableProps {
  products: Product[];
  documentLines: DocumentLine[];
  categories: Category[]; // массив категорий
}

const CategoryStockTable: React.FC<CategoryStockTableProps> = ({
  products,
  documentLines,
  categories,
}) => {
  // Создаем мапу: category_id → name
  const categoryMap: Record<number, string> = {};
  categories.forEach((cat) => {
    categoryMap[Number(cat.id)] = cat.name; // приводим id к числу
  });

  // Группируем продукты по категориям
  const categoriesMap: Record<
    number,
    { categoryName: string; totalQuantity: number; totalValue: number }
  > = {};

  products.forEach((product) => {
    const lines = documentLines.filter((line) => line.product_id === product.id);
    const quantity = lines.reduce(
      (sum, l) => sum + (l.actual_quantity ?? l.quantity),
      0
    );
    if (quantity === 0) return; // если нет на складе, пропускаем

    const value = quantity * ((product.sell_price as number) || 0);

    const catId = Number(product.category_id); // приводим к числу
    const catName = categoryMap[catId] || "Без категории";

    if (!categoriesMap[catId]) {
      categoriesMap[catId] = {
        categoryName: catName,
        totalQuantity: 0,
        totalValue: 0,
      };
    }

    categoriesMap[catId].totalQuantity += quantity;
    categoriesMap[catId].totalValue += value;
  });

  const categoryStocks = Object.values(categoriesMap).filter(
    (c) => c.totalQuantity > 0
  );

  if (categoryStocks.length === 0)
    return <Typography>Нет данных по категориям</Typography>;

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Запасы по категориям
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Категория</TableCell>
            <TableCell>Количество</TableCell>
            <TableCell>Стоимость</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categoryStocks.map((cat, idx) => (
            <TableRow key={idx}>
              <TableCell>{cat.categoryName}</TableCell>
              <TableCell>{cat.totalQuantity}</TableCell>
              <TableCell>{cat.totalValue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default CategoryStockTable;
