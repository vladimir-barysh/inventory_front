// src/pages/reportsPage/IndicatorsTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Document,
  DocumentLine,
  Product,
  StorageZone,
  Indicator,
} from "./types";

// Интерфейс пропсов компонента
interface IndicatorsTableProps {
  documents: Document[];
  documentLines: DocumentLine[];
  products: Product[];
  storage: StorageZone[];
}

const IndicatorsTable: React.FC<IndicatorsTableProps> = ({
  documents,
  documentLines,
  products,
  storage,
}) => {
  const totalStock = documentLines.reduce(
    (sum, line) => sum + (line.actual_quantity ?? line.quantity),
    0
  );

  const totalProducts = products.length;
  const totalCapacity = totalProducts * 2.4;
  const warehouseUsagePercent = totalCapacity
    ? (totalProducts / totalCapacity) * 100
    : 0;

  const accountingTotal = documentLines.reduce((sum, line) => {
    return sum + (line.quantity ?? 0);
  }, 0);

  const totalDeviation = documentLines.reduce((sum, line) => {
    if (line.actual_quantity === null || line.actual_quantity === undefined) {
      return sum;
    }
    return sum + Math.abs(line.quantity - line.actual_quantity);
  }, 0);

  const accuracyPercent =
    accountingTotal > 0 ? (1 - totalDeviation / accountingTotal) * 100 : 0;

  const totalValue = products.reduce((sum, product) => {
    const lines = documentLines.filter(
      (line) => line.product_id === product.id
    );
    const quantity = lines.reduce(
      (qsum, l) => qsum + (l.actual_quantity ?? l.quantity),
      0
    );
    const price = (product.sell_price as unknown as number) || 0;
    return sum + quantity * price;
  }, 0);
  const avgPrice = totalStock ? totalValue / totalStock : 0;

  const totalStockValue = products.reduce((sum, product) => {
    const lines = documentLines.filter(
      (line) => line.product_id === product.id
    );
    const quantity = lines.reduce(
      (qsum, l) => qsum + (l.actual_quantity ?? l.quantity),
      0
    );
    const price = (product.sell_price as unknown as number) || 0;
    return sum + quantity * price;
  }, 0);

  const indicators: Indicator[] = [
    totalStock > 0 && {
      name: "Остаток товара на складе",
      value: totalStock,
      unit: "шт.",
      formula: "Фактическое количество на момент расчета",
    },
    totalCapacity > 0 && {
      name: "Загруженность склада",
      value: warehouseUsagePercent.toFixed(1) + "%",
      unit: "%",
      formula: "(Занятая площадь всех зон) / (Общая площадь склада) × 100%",
    },
    accuracyPercent > 0 && {
      name: "Точность учета",
      value: accuracyPercent.toFixed(2) + "%",
      unit: "%",
      formula:
        "(1 − Σ|учётное количество − фактическое количество| / Σ учётного количества) × 100%",
    },
    avgPrice > 0 && {
      name: "Средняя цена товара на складе",
      value: avgPrice.toFixed(2),
      unit: "руб.",
      formula: "Сумма стоимости всех товаров / Количество товаров",
    },
    totalStockValue > 0 && {
      name: "Стоимость запасов",
      value: totalStockValue.toFixed(2),
      unit: "руб.",
      formula: "Сумма количества всех товаров × их цена",
    },
  ].filter(Boolean) as Indicator[];

  return (
    <Paper sx={{ p: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Наименование показателя</TableCell>
            <TableCell>Формула / способ расчета</TableCell>
            <TableCell>Ед. измерения</TableCell>
            <TableCell>Значение</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {indicators.map((ind, idx) => (
            <TableRow key={idx}>
              <TableCell>{ind.name}</TableCell>
              <TableCell>{ind.formula}</TableCell>
              <TableCell>{ind.unit}</TableCell>
              <TableCell>{ind.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default IndicatorsTable;
