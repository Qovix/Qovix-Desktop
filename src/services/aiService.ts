import { DatabaseConnection } from './databaseService';

export interface SQLQueryRequest {
  database: string;
  tables: string[];
  query: string;
  connection_id?: string;
  max_retries?: number;
  save_history?: boolean;
}

export interface SQLQueryResponse {
  sql_query: string;
  explanation: string;
  confidence: number;
  is_valid: boolean;
  validation_errors?: string[];
  metadata?: Record<string, any>;
}

export interface ValidateSQLRequest {
  sql_query: string;
}

export interface ValidateSQLResponse {
  is_valid: boolean;
  validation_errors?: string[];
  sql_query: string;
}

export interface ExplainSQLRequest {
  sql_query: string;
}

export interface ExplainSQLResponse {
  sql_query: string;
  explanation: string;
}

export interface QueryHistory {
  id: string;
  user_id: string;
  database: string;
  tables: string[];
  user_query: string;
  generated_sql: string;
  explanation: string;
  confidence: number;
  is_valid: boolean;
  executed_at?: string;
  created_at: string;
}

export interface QueryHistoryResponse {
  queries: QueryHistory[];
  total_count: number;
  stats?: {
    total_queries: number;
    successful_queries: number;
    average_confidence: number;
    most_used_database: string;
  };
}

export interface AIServiceError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

class AIService {
  private baseUrl = 'http://localhost:8080/api/ai';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('qovix_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: AIServiceError = data;
      throw new Error(error.message || `AI service error: ${response.status}`);
    }

    return data;
  }

  /**
   * Generate SQL query from natural language
   */
  async generateSQL(request: SQLQueryRequest): Promise<SQLQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-sql`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse<SQLQueryResponse>(response);
    } catch (error) {
      console.error('Failed to generate SQL:', error);
      throw error;
    }
  }

  /**
   * Validate SQL query for safety and correctness
   */
  async validateSQL(request: ValidateSQLRequest): Promise<ValidateSQLResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-sql`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse<ValidateSQLResponse>(response);
    } catch (error) {
      console.error('Failed to validate SQL:', error);
      throw error;
    }
  }

  /**
   * Get natural language explanation of SQL query
   */
  async explainSQL(request: ExplainSQLRequest): Promise<ExplainSQLResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/explain-sql`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse<ExplainSQLResponse>(response);
    } catch (error) {
      console.error('Failed to explain SQL:', error);
      throw error;
    }
  }

  /**
   * Get user's query history with pagination
   */
  async getQueryHistory(limit = 20, offset = 0): Promise<QueryHistoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<QueryHistoryResponse>(response);
    } catch (error) {
      console.error('Failed to get query history:', error);
      throw error;
    }
  }

  /**
   * Helper method to generate SQL with automatic table detection
   */
  async generateSQLForDatabase(
    database: DatabaseConnection,
    userQuery: string,
    selectedTables?: string[],
    saveHistory = true
  ): Promise<SQLQueryResponse> {
    // If no tables specified, try to infer from query or use common table names
    const tables = selectedTables || this.inferTablesFromQuery(userQuery) || ['users'];

    const request: SQLQueryRequest = {
      database: database.name,
      tables,
      query: userQuery,
      connection_id: database.id,
      save_history: saveHistory,
    };

    return this.generateSQL(request);
  }

  /**
   * Simple table name inference from user query
   */
  private inferTablesFromQuery(query: string): string[] | null {
    const lowerQuery = query.toLowerCase();
    const commonTables = ['users', 'orders', 'products', 'customers', 'sales', 'inventory', 'employees'];
    
    const mentionedTables = commonTables.filter(table => 
      lowerQuery.includes(table) || lowerQuery.includes(table.slice(0, -1)) // singular form
    );

    return mentionedTables.length > 0 ? mentionedTables : null;
  }

  /**
   * Validate and execute SQL query safely
   */
  async validateAndExecuteSQL(
    connectionId: string,
    sqlQuery: string,
    executeQuery: (query: string) => Promise<any>
  ): Promise<{ isValid: boolean; result?: any; errors?: string[] }> {
    try {
      // First validate the SQL
      const validation = await this.validateSQL({ sql_query: sqlQuery });
      
      if (!validation.is_valid) {
        return {
          isValid: false,
          errors: validation.validation_errors
        };
      }

      // If valid, execute the query
      const result = await executeQuery(sqlQuery);
      
      return {
        isValid: true,
        result
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }
}

export const aiService = new AIService();