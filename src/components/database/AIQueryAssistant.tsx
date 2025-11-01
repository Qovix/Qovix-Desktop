import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Copy,
  Database,
  Table,
  Loader2,
  Sparkles,
  Code,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  History,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { AIMessage } from '../../utils/types';

interface AIQueryAssistantProps {
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

const AIQueryAssistant: React.FC<AIQueryAssistantProps> = ({
  isOpen,
  onToggle,
  database,
  selectedTable,
  onRunQuery,
  className = ''
}) => {
  const {
    messages,
    isLoading,
    serviceStatus,
    generateSQL,
    explainSQL,
    canSendMessage,
    cancelCurrentRequest,
    clearMessages
  } = useAIAssistant(database.id, database.name);

  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !canSendMessage) return;

    const userQuery = inputValue.trim();
    setInputValue('');

    try {
      const tables = selectedTable ? [selectedTable] : undefined;
      
      await generateSQL(userQuery, tables);
    } catch (error) {
      console.error('Failed to generate SQL:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleRunQuery = (sqlQuery: string) => {
    onRunQuery(sqlQuery);
  };

  const handleExplainQuery = async (sqlQuery: string) => {
    try {
      await explainSQL(sqlQuery);
    } catch (error) {
      console.error('Failed to explain query:', error);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const getValidationIcon = (message: AIMessage) => {
    if (message.is_valid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (message.is_valid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) {
    return (
      <div className={`${className}`}>
        <Button
          onClick={onToggle}
          className="bg-[#bc3a08] hover:bg-[#a0340a] text-white shadow-lg h-12 px-4 rounded-l-lg rounded-r-none border-r-0"
          title="Open AI Assistant"
        >
          <Brain className="h-5 w-5 mr-2" />
          <span className="hidden lg:inline">AI Assistant</span>
          <ChevronLeft className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
            <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-[#bc3a08]" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">AI Assistant</h3>
                {serviceStatus.isConnected ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                {serviceStatus.isConnected 
                  ? 'Generate SQL from natural language'
                  : 'Service unavailable'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <Database className="h-4 w-4 text-blue-600" />
          <span className="text-blue-900 font-medium">{database.name}</span>
          {selectedTable && (
            <>
              <span className="text-blue-600">•</span>
              <Table className="h-4 w-4 text-blue-600" />
              <span className="text-blue-900">{selectedTable}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-[#bc3a08] text-white'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {(message.type === 'assistant' || message.type === 'error') && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {message.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-[#bc3a08]" />
                    )}
                    <span className="text-xs font-medium text-[#bc3a08]">
                      {message.type === 'error' ? 'Error' : 'AI Assistant'}
                    </span>
                  </div>
                  
                  {message.type === 'assistant' && (
                    <div className="flex items-center space-x-2">
                      {getValidationIcon(message)}
                      {message.confidence && (
                        <span className={`text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                          {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              {message.sql_query && (
                <div className="mt-3 p-3 bg-gray-800 rounded text-green-400 font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Code className="h-3 w-3" />
                      <span className="text-gray-300">Generated SQL</span>
                      {message.is_valid === false && (
                        <span className="text-red-400 text-xs">⚠ Validation Issues</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyToClipboard(message.sql_query!)}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                        title="Copy query"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {message.is_valid !== false && (
                        <button
                          onClick={() => handleRunQuery(message.sql_query!)}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-green-400"
                          title="Run query"
                        >
                          <Play className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleExplainQuery(message.sql_query!)}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400"
                        title="Explain query"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap">{message.sql_query}</pre>
                  
                  {message.validation_errors && message.validation_errors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-900 bg-opacity-50 rounded text-red-300 text-xs">
                      <div className="font-medium mb-1">Validation Issues:</div>
                      {message.validation_errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {message.isLoading && (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs opacity-70">Processing...</span>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#bc3a08]" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        {!serviceStatus.isConnected && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>AI service unavailable</span>
              {serviceStatus.lastError && (
                <span className="text-xs text-red-600">({serviceStatus.lastError})</span>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedTable 
                  ? `Ask about the ${selectedTable} table...`
                  : `Ask about your ${database.name} database...`
              }
              className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent ${
                !canSendMessage ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
              }`}
              rows={2}
              disabled={!canSendMessage}
            />
          </div>
          
          <div className="flex flex-col space-y-1">
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !canSendMessage}
              className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            
            {isLoading && (
              <Button
                onClick={cancelCurrentRequest}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <History className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              title="Clear conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedTable && !isLoading && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Quick actions for {selectedTable}:</div>
            <div className="flex flex-wrap gap-2">
              {[
                'Show all records',
                'Count total rows',
                'Describe table structure',
                'Show recent records'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQueryAssistant;