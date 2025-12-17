// src/pages/reportsPage/ReportsPage.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import IndicatorsTable from "./IndicatorsTable";
import DocumentReportsTable from "./DocumentReportsTable";
import axios from "axios";
import {
  Document,
  DocumentLine,
  Product,
  StorageZone,
  Category,
  DocumentType
} from "./types"; // создаём типы
import ProductStockTable from "./ProductStockTable";
import CategoryStockTable from "./CategoryStockTable";
import DocumentJournalTable from "./DocumentJournalTable";

const ReportsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentLines, setDocumentLines] = useState<DocumentLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storage, setStorage] = useState<StorageZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, productsRes, storageRes, typesRes] = await Promise.all([
          axios.get("/documents"),
          axios.get("/products"),
          axios.get("/storagezones"),
          axios.get("/documenttypes"),
        ]);

        setDocuments(docsRes.data);
        setProducts(productsRes.data);
        setStorage(storageRes.data);
        setDocumentTypes(typesRes.data);

        // Получаем documentLines для всех документов
        let allLines: DocumentLine[] = [];
        for (const doc of docsRes.data) {
          const linesRes = await axios.get(`/documentlines/document/${doc.id}`);
          allLines = allLines.concat(linesRes.data.lines);
        }

        setDocumentLines(allLines);

        const categoriesRes = await axios.get("/categories");
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Ошибка загрузки данных для отчетов", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Загрузка данных...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Показатели
      </Typography>
      <IndicatorsTable
        documents={documents}
        documentLines={documentLines}
        products={products}
        storage={storage}
      />
      <DocumentReportsTable
        documents={documents}
        documentLines={documentLines}
        products={products}
      />
      <ProductStockTable products={products} documentLines={documentLines} />
      <CategoryStockTable
        products={products}
        documentLines={documentLines}
        categories={categories}
      />
      <DocumentJournalTable
        documents={documents}
        documentLines={documentLines}
        products={products}
        documentTypes={documentTypes}
      />
    </Box>
  );
};

export default ReportsPage;
