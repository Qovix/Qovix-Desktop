export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: boolean;
}

export interface TableRow {
  [key: string]: any;
}

export interface TableDataViewProps {
  tableName: string;
  columns: TableColumn[];
  data: TableRow[];
  totalRows: number;
  onRefresh: () => void;
  onInsertRow: () => void;
  onExportCSV: () => void;
  onEditRow: (row: TableRow, index: number) => void;
  onDeleteRow: (row: TableRow, index: number) => void;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DatabaseTable {
  name: string;
  type: 'table' | 'view';
  rowCount?: number;
  columns?: any[];
}

export interface DatabaseSchema {
  name: string;
  tables: DatabaseTable[];
  views: DatabaseTable[];
  procedures?: string[];
}

export interface ContextMenuProps {
  x: number;
  y: number;
  target: {
    type: 'database' | 'table' | 'view' | 'procedure';
    name: string;
  };
  onClose: () => void;
  onAction: (action: string, target: any) => void;
}

export interface DatabaseExplorerProps {
  database: {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
  };
  onBack: () => void;
}

// AI Assistant Types
export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  sql_query?: string;
  explanation?: string;
  confidence?: number;
  is_valid?: boolean;
  validation_errors?: string[];
  timestamp: Date;
  isLoading?: boolean;
}

export interface AIQueryAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  database: {
    id: string;
    name: string;
    type: string;
  };
  selectedTable?: string;
  onRunQuery: (query: string) => void;
  className?: string;
}

export interface AIServiceStatus {
  isConnected: boolean;
  lastError?: string;
  isLoading: boolean;
}