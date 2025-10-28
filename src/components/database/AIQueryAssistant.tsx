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
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  query?: string;
  timestamp: Date;
}

interface AIQueryAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  database: {
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
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI database assistant. I can help you with queries for the **${database.name}** database.${selectedTable ? ` Currently viewing the **${selectedTable}** table.` : ''}\n\nTry asking me things like:\n• "Show me all users"\n• "Count orders by status"\n• "Find products with low inventory"`,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const generateAIResponse = async (userMessage: string): Promise<{ content: string; query?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('show') || lowerMessage.includes('select') || lowerMessage.includes('get')) {
      const tableName = selectedTable || 'users';
      return {
        content: `Here's a query to show data from the **${tableName}** table:`,
        query: `SELECT * FROM ${tableName} LIMIT 100;`
      };
    }
    
    if (lowerMessage.includes('count')) {
      const tableName = selectedTable || 'orders';
      return {
        content: `Here's a query to count records in the **${tableName}** table:`,
        query: `SELECT COUNT(*) as total_count FROM ${tableName};`
      };
    }
    
    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
      const tableName = selectedTable || 'products';
      return {
        content: `Here's a summary query for the **${tableName}** table:`,
        query: `SELECT 
  COUNT(*) as total_rows,
  COUNT(DISTINCT id) as unique_ids,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM ${tableName};`
      };
    }
    
    if (lowerMessage.includes('join') || lowerMessage.includes('relationship')) {
      return {
        content: `Here's a query showing relationships between tables:`,
        query: `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;`
      };
    }
    
    return {
      content: `I understand you're asking about "${userMessage}". Here's a general query that might help:`,
      query: selectedTable ? `SELECT * FROM ${selectedTable} LIMIT 10;` : `SHOW TABLES;`
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(userMessage.content);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        query: response.query,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
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
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">
                {database.name} • {selectedTable || 'No table selected'}
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
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#bc3a08]" />
                  <span className="text-xs font-medium text-[#bc3a08]">AI Assistant</span>
                </div>
              )}
              
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              {message.query && (
                <div className="mt-3 p-3 bg-gray-800 rounded text-green-400 font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Code className="h-3 w-3" />
                      <span className="text-gray-300">SQL Query</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyQuery(message.query!)}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                        title="Copy query"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRunQuery(message.query!)}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-green-400"
                        title="Run query"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap">{message.query}</pre>
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
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${selectedTable || 'your database'}...`}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#bc3a08] hover:bg-[#a0340a] text-white self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AIQueryAssistant;