import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService, SQLQueryResponse, QueryHistory } from '../services/aiService';
import { AIMessage, AIServiceStatus } from '../utils/types';

export const useAIAssistant = (databaseId?: string, databaseName?: string) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<AIServiceStatus>({
    isConnected: true,
    isLoading: false,
  });
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (databaseName && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your AI database assistant for **${databaseName}**. I can help you generate SQL queries from natural language.\n\n**Try asking me:**\n• "Show me all users"\n• "Count orders by status"\n• "Find products with low inventory"\n• "Get sales data for this month"`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [databaseName, messages.length]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const addMessage = useCallback((message: AIMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((updates: Partial<AIMessage>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0) {
        newMessages[lastIndex] = { ...newMessages[lastIndex], ...updates };
      }
      return newMessages;
    });
  }, []);

  const generateSQL = useCallback(async (
    userQuery: string,
    selectedTables?: string[]
  ): Promise<SQLQueryResponse | null> => {
    if (!databaseId || !databaseName) {
      throw new Error('Database connection required');
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setServiceStatus(prev => ({ ...prev, isLoading: true, lastError: undefined }));

    try {
      // Add user message
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: userQuery,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      // Add loading assistant message
      const loadingMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: 'Generating SQL query...',
        timestamp: new Date(),
        isLoading: true,
      };
      addMessage(loadingMessage);

      // Generate SQL using AI service
      const response = await aiService.generateSQLForDatabase(
        { id: databaseId, name: databaseName } as any,
        userQuery,
        selectedTables,
        true
      );

      // Update the loading message with the response
      updateLastMessage({
        content: response.explanation || 'Here\'s the generated SQL query:',
        sql_query: response.sql_query,
        explanation: response.explanation,
        confidence: response.confidence,
        is_valid: response.is_valid,
        validation_errors: response.validation_errors,
        isLoading: false,
      });

      setServiceStatus(prev => ({ ...prev, isConnected: true, isLoading: false }));
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate SQL query';
      
      // Update loading message to show error
      updateLastMessage({
        type: 'error',
        content: `❌ **Error:** ${errorMessage}\n\nPlease try rephrasing your question or check your connection.`,
        isLoading: false,
      });

      setServiceStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false, 
        lastError: errorMessage 
      }));

      throw error;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [databaseId, databaseName, addMessage, updateLastMessage]);

  const validateSQL = useCallback(async (sqlQuery: string) => {
    try {
      const response = await aiService.validateSQL({ sql_query: sqlQuery });
      return response;
    } catch (error) {
      console.error('Failed to validate SQL:', error);
      throw error;
    }
  }, []);

  const explainSQL = useCallback(async (sqlQuery: string) => {
    try {
      setIsLoading(true);
      
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: `Please explain this SQL query:\n\`\`\`sql\n${sqlQuery}\n\`\`\``,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      const loadingMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: 'Analyzing SQL query...',
        timestamp: new Date(),
        isLoading: true,
      };
      addMessage(loadingMessage);

      const response = await aiService.explainSQL({ sql_query: sqlQuery });

      updateLastMessage({
        content: response.explanation,
        sql_query: response.sql_query,
        isLoading: false,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to explain SQL query';
      
      updateLastMessage({
        type: 'error',
        content: `❌ **Error:** ${errorMessage}`,
        isLoading: false,
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateLastMessage]);

  const loadQueryHistory = useCallback(async (limit = 20, offset = 0) => {
    try {
      const response = await aiService.getQueryHistory(limit, offset);
      setQueryHistory(response.queries);
      return response;
    } catch (error) {
      console.error('Failed to load query history:', error);
      throw error;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setServiceStatus(prev => ({ ...prev, isLoading: false }));
  }, []);

  return {
    // State
    messages,
    isLoading,
    serviceStatus,
    queryHistory,
    
    // Actions
    generateSQL,
    validateSQL,
    explainSQL,
    loadQueryHistory,
    clearMessages,
    cancelCurrentRequest,
    addMessage,
    
    // Utils
    canSendMessage: !isLoading && serviceStatus.isConnected,
  };
};