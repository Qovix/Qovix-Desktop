import { DatabaseConnectionData } from '../components/database/DatabaseConnectionModal';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  database: string;
  version?: string;
  schemas?: string[];
}

export interface DatabaseSchema {
  name: string;
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes?: IndexSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default_value?: string;
  is_primary_key: boolean;
  is_auto_increment: boolean;
  max_length?: number;
}

export interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
  primary: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  count: number;
  message?: string;
}

class DatabaseService {
  private baseUrl = 'http://localhost:8080/api/database';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('qovix_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async testConnection(connectionData: DatabaseConnectionData): Promise<{
    status: string;
    message: string;
    version?: string;
    schemas?: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name: connectionData.name,
        type: connectionData.type,
        host: connectionData.host,
        port: parseInt(connectionData.port),
        database: connectionData.database,
        username: connectionData.username,
        password: connectionData.password,
        save: false,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Connection test failed');
    }

    return data.data;
  }

  async createConnection(connectionData: DatabaseConnectionData): Promise<{
    id: string;
    status: string;
    message: string;
    version?: string;
    schemas?: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/connect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name: connectionData.name,
        type: connectionData.type,
        host: connectionData.host,
        port: parseInt(connectionData.port),
        database: connectionData.database,
        username: connectionData.username,
        password: connectionData.password,
        save: connectionData.saveConnection,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create connection');
    }

    return data.data;
  }

  async getConnectionStatus(connectionId: string): Promise<{
    id: string;
    status: string;
    database: string;
  }> {
    const response = await fetch(`${this.baseUrl}/connections/${connectionId}/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get connection status');
    }

    return data.data;
  }

  async getSchema(connectionId: string): Promise<DatabaseSchema> {
    const response = await fetch(`${this.baseUrl}/connections/${connectionId}/schema`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get database schema');
    }

    return data.data;
  }

  async executeQuery(connectionId: string, query: string, limit?: number): Promise<QueryResult> {
    const response = await fetch(`${this.baseUrl}/connections/${connectionId}/query`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        connection_id: connectionId,
        query: query,
        limit: limit || 100,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Query execution failed');
    }

    return data.data;
  }

  async disconnectDatabase(connectionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/connections/${connectionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to disconnect database');
    }
  }
}

export const databaseService = new DatabaseService();