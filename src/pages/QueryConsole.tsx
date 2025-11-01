import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Save,
  FileText,
  Clock,
  ArrowLeft,
  Plus,
  X,
  Download,
  Copy,
  Database,
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface QueryResult {
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

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  duration?: number;
  status: 'success' | 'error';
}

interface QueryTab {
  id: string;
  name: string;
  query: string;
  isModified: boolean;
}

interface QueryConsoleProps {
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

const QueryConsole: React.FC<QueryConsoleProps> = ({
  database,
  onBack,
  initialQuery = ''
}) => {
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: '1',
      name: 'Query 1',
      query: initialQuery,
      isModified: false
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState('1');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [history, setHistory] = useState<QueryHistoryItem[]>([
    {
      id: '1',
      query: 'SELECT * FROM users LIMIT 10;',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      duration: 125,
      status: 'success'
    },
    {
      id: '2',
      query: 'SELECT COUNT(*) FROM orders WHERE status = "completed";',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      duration: 89,
      status: 'success'
    }
  ]);
  
  const [showHistory, setShowHistory] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [activeTab?.query]);

  const executeQuery = async () => {
    if (!activeTab?.query.trim() || isRunning) return;

    setIsRunning(true);
    const startTime = Date.now();

    const result: QueryResult = {
      id: Date.now().toString(),
      query: activeTab.query.trim(),
      status: 'running',
      timestamp: new Date()
    };

    setResults(prev => [result, ...prev]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const isSelectQuery = activeTab.query.toLowerCase().trim().startsWith('select');
      const isCountQuery = activeTab.query.toLowerCase().includes('count');
      
      let mockData: any[] = [];
      let columns: string[] = [];
      
      if (isSelectQuery) {
        if (isCountQuery) {
          columns = ['count'];
          mockData = [{ count: Math.floor(Math.random() * 10000) }];
        } else {
          columns = ['id', 'name', 'email', 'created_at'];
          mockData = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString()
          }));
        }
      }

      const duration = Date.now() - startTime;
      const success = Math.random() > 0.1;

      const updatedResult: QueryResult = {
        ...result,
        status: success ? 'success' : 'error',
        data: success ? mockData : undefined,
        columns: success ? columns : undefined,
        rowCount: success ? mockData.length : undefined,
        duration,
        error: success ? undefined : 'Table "unknown_table" doesn\'t exist'
      };

      setResults(prev => prev.map(r => r.id === result.id ? updatedResult : r));

      setHistory(prev => [{
        id: result.id,
        query: result.query,
        timestamp: result.timestamp,
        duration,
        status: success ? 'success' : 'error'
      }, ...prev]);

    } catch (error) {
      const updatedResult: QueryResult = {
        ...result,
        status: 'error',
        error: 'Connection failed',
        duration: Date.now() - startTime
      };
      
      setResults(prev => prev.map(r => r.id === result.id ? updatedResult : r));
    } finally {
      setIsRunning(false);
    }
  };

  const stopQuery = () => {
    setIsRunning(false);
  };

  const updateQuery = (query: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, query, isModified: query !== initialQuery }
        : tab
    ));
  };

  const addNewTab = () => {
    const newTab: QueryTab = {
      id: Date.now().toString(),
      name: `Query ${tabs.length + 1}`,
      query: '',
      isModified: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; 
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs[0]?.id || tabs[0]?.id);
    }
  };

  const loadHistoryQuery = (historyItem: QueryHistoryItem) => {
    updateQuery(historyItem.query);
    setShowHistory(false);
  };

  const getResultStatusIcon = (status: QueryResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Query Console Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="h-5 w-5 text-[#bc3a08]" />
            <div>
              <h1 className="font-semibold text-gray-900">Query Console</h1>
              <p className="text-xs text-gray-500">
                {database.name} • {database.type} • {database.host}:{database.port}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? 'bg-gray-100' : ''}
            >
              <Clock className="h-4 w-4 mr-2" />
              History
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showHistory && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Query History</h3>
              <p className="text-sm text-gray-500 mt-1">Recent queries</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryQuery(item)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {item.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {item.duration && (
                      <span className="text-xs text-gray-400">
                        {item.duration}ms
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded truncate group-hover:bg-gray-50">
                    {item.query}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-200 cursor-pointer ${
                    activeTabId === tab.id ? 'bg-white border-b-2 border-[#bc3a08]' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {tab.name}
                    {tab.isModified && '*'}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addNewTab}
                className="p-2 hover:bg-gray-100 text-gray-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-700">SQL Query</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isRunning ? (
                    <Button
                      onClick={stopQuery}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      onClick={executeQuery}
                      size="sm"
                      className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
                      disabled={!activeTab?.query.trim()}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </Button>
                  )}
                </div>
              </div>
              
              <textarea
                ref={textareaRef}
                value={activeTab?.query || ''}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent resize-none"
                style={{ minHeight: '120px' }}
              />
              
              <div className="mt-2 text-xs text-gray-500">
                Press Ctrl+Enter to execute query
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {results.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Execute
                  </h3>
                  <p className="text-gray-600">
                    Write your SQL query above and click Execute to see results
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {results.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        {getResultStatusIcon(result.status)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.status === 'success' && result.rowCount !== undefined
                              ? `${result.rowCount} rows returned`
                              : result.status === 'error'
                              ? 'Query failed'
                              : 'Executing query...'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                            {result.duration && ` • ${result.duration}ms`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(result.query)}
                          className="p-2 hover:bg-gray-200 rounded text-gray-600"
                          title="Copy query"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        
                        {result.status === 'success' && result.data && (
                          <button
                            className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            title="Export results"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800 text-green-400 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">{result.query}</pre>
                    </div>

                    {result.status === 'error' && (
                      <div className="p-4 bg-red-50 border-t border-red-200">
                        <div className="flex items-center space-x-2 text-red-700">
                          <XCircle className="h-4 w-4" />
                          <span className="font-medium">Error:</span>
                        </div>
                        <p className="text-red-600 mt-1 font-mono text-sm">{result.error}</p>
                      </div>
                    )}

                    {result.status === 'success' && result.data && result.columns && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {result.columns.map((column) => (
                                <th
                                  key={column}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.slice(0, 100).map((row, index) => (
                              <tr
                                key={index}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                              >
                                {result.columns!.map((column) => (
                                  <td
                                    key={column}
                                    className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200"
                                  >
                                    {row[column] === null || row[column] === undefined
                                      ? <span className="text-gray-400 italic">NULL</span>
                                      : String(row[column])
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {result.data.length > 100 && (
                          <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
                            Showing first 100 rows of {result.data.length} total rows
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryConsole;