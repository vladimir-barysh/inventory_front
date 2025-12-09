export interface Document {
  id: number;
  number: string;
  date: string; 
  comment?: string;
  company?: string | null;
  document_type: string;
}
