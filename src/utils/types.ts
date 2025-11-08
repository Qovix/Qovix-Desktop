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
  database?: {
    id: string;
    name: string;
    type: string;
  };
  isAIOpen?: boolean;
  onToggleAI?: () => void;
  onRunQuery?: (query: string) => void;
}
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
export interface DatabaseTable {
  name: string;
  type: 'table' | 'view';
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
export interface QueryResultData {
  columns: string[];
  rows: any[][];
  count: number;
  message?: string;
  executionTime?: number;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  sql_query?: string;
  explanation?: string;
  confidence?: number;
  is_valid?: boolean;
  validation_errors?: string[];
  query_result?: QueryResultData;
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
export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: number;
  database?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  version?: string;
  schemas?: string[];
}
export interface ContextMenu {
  x: number;
  y: number;
  type: 'database' | 'table';
  itemName: string;
  databaseName?: string;
}
export interface DatabaseSidebarProps {
  databases: DatabaseConnection[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  expandedDatabases: Set<string>;
  selectedTable: string | null;
  selectedDatabase: DatabaseConnection | null;
  schemas: Record<string, DatabaseSchema>;
  schemaLoading: Record<string, boolean>;
  connectingDatabase: string | null;
  hoveredDatabase: string | null;
  hoveredTable: string | null;
  onHoverDatabase: (id: string | null) => void;
  onHoverTable: (name: string | null) => void;
  onNewConnection: () => void;
  onLogout: () => void;
  onLoadConnections: () => void;
  onToggleDatabase: (database: DatabaseConnection) => void;
  onConnect: (database: DatabaseConnection) => void;
  onTableClick: (tableName: string, database: DatabaseConnection) => void;
  onContextMenu: (e: React.MouseEvent, type: 'database' | 'table', itemName: string, databaseName?: string) => void;
}
export interface DatabaseItemProps {
  database: DatabaseConnection;
  isExpanded: boolean;
  schema: DatabaseSchema | undefined;
  isSchemaLoading: boolean;
  filteredTables: Array<{ name: string; type: 'table'; columns: any[]; rowCount?: number }>;
  selectedTable: string | null;
  selectedDatabase: DatabaseConnection | null;
  connectingDatabase: string | null;
  hoveredDatabase: string | null;
  hoveredTable: string | null;
  onHoverDatabase: (id: string | null) => void;
  onHoverTable: (name: string | null) => void;
  onToggleDatabase: (database: DatabaseConnection) => void;
  onConnect: (database: DatabaseConnection) => void;
  onTableClick: (tableName: string, database: DatabaseConnection) => void;
  onContextMenu: (e: React.MouseEvent, type: 'database' | 'table', itemName: string, databaseName?: string) => void;
}

export interface MainContentAreaProps {
  selectedTable: string | null;
  selectedDatabase: DatabaseConnection | null;
  databases: DatabaseConnection[];
  schemas: Record<string, DatabaseSchema>;
  isAIOpen: boolean;
  onToggleAI: () => void;
  onRunQuery: (query: string) => void;
  queryResult?: {
    query: string;
    data: any[];
    columns: string[];
    totalRows: number;
    database: DatabaseConnection;
    executionTime?: number;
  } | null;
  queryLoading?: boolean;
  queryError?: string | null;
  onClearQueryResults?: () => void;
}
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_verified: boolean;
  provider: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
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

export interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connection: DatabaseConnectionData) => void;
}

export interface DatabaseConnectionData {
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  saveConnection: boolean;
  connectionId?: string;
  version?: string;
  schemas?: string[];
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface RouteConfig {
  path: string;
  requireAuth: boolean;
  requireVerification: boolean;
  title: string;
  description?: string;
}

export interface QueryResult {
  id: string;
  query: string;
  status: 'success' | 'error' | 'running';
  data?: any[];
  columns?: string[];
  rowCount?: number;
  duration?: number;
  error?: string;
  timestamp: Date;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  duration?: number;
  status: 'success' | 'error';
}

export interface QueryTab {
  id: string;
  name: string;
  query: string;
  isModified: boolean;
}

export interface QueryConsoleProps {
  database: {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
  };
  onBack: () => void;
  initialQuery?: string;
}