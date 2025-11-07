import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Save,
  FileText,
  Clock,
  Plus,
  X,
  Copy,
  Database,
  Terminal,
  CheckCircle,
  XCircle,
  Minimize2,
  Code
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { databaseService } from '../services/databaseService';

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
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  
  const [showHistory, setShowHistory] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);
  
  // Bottom sheet state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(400); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const [currentQueryStatus, setCurrentQueryStatus] = useState<'success' | 'error' | null>(null);
  const [currentQueryError, setCurrentQueryError] = useState<string | null>(null);
  const [bottomSheetData, setBottomSheetData] = useState<{
    columns: string[];
    rows: any[][];
    count: number;
    query: string;
    duration?: number;
  } | null>(null);
  
  // Query input state
  const [showQueryInput, setShowQueryInput] = useState(true);
  const [floatingQuery, setFloatingQuery] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [activeTab?.query]);

  // Cleanup: abort any running queries when component unmounts
  useEffect(() => {
    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, [currentAbortController]);

  // Handle mouse resize for bottom sheet
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = windowHeight - 200;
      
      setBottomSheetHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleExecuteClick = () => {
    executeQuery();
  };

  const handleBottomSheetResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const executeQuery = async (queryText?: string) => {
    const queryToExecute = queryText || activeTab?.query.trim() || floatingQuery.trim();
    if (!queryToExecute || isRunning) return;

    // Create abort controller for this query
    const abortController = new AbortController();
    setCurrentAbortController(abortController);

    setIsRunning(true);
    const startTime = Date.now();

    const result: QueryResult = {
      id: Date.now().toString(),
      query: queryToExecute,
      status: 'running',
      timestamp: new Date()
    };

    try {
      // Execute the actual query using the database service
      const queryResult = await databaseService.executeQuery(
        database.id, 
        queryToExecute, 
        1000,
        abortController.signal
      );
      
      // Check if the query was cancelled
      if (abortController.signal.aborted) {
        return;
      }

      const duration = Date.now() - startTime;
      setBottomSheetData({
        columns: queryResult.columns,
        rows: queryResult.rows || [],
        count: queryResult.count,
        query: queryToExecute,
        duration
      });
      setCurrentQueryStatus('success');
      setCurrentQueryError(null);
      setShowBottomSheet(true);

      // Add to query history
      setHistory(prev => [{
        id: result.id,
        query: result.query,
        timestamp: result.timestamp,
        duration,
        status: 'success'
      }, ...prev]);

    } catch (error) {
      // Check if the query was cancelled
      if (abortController.signal.aborted) {
        return;
      }

      const duration = Date.now() - startTime;
      
      const updatedResult: QueryResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration
      };
      
      // Show error in bottom sheet as well
      setBottomSheetData({
        columns: [],
        rows: [],
        count: 0,
        query: queryToExecute,
        duration
      });
      setCurrentQueryStatus('error');
      setCurrentQueryError(updatedResult.error || 'An unexpected error occurred');
      setShowBottomSheet(true);

      // Add to query history even for failed queries
      setHistory(prev => [{
        id: result.id,
        query: result.query,
        timestamp: result.timestamp,
        duration,
        status: 'error'
      }, ...prev]);
    } finally {
      setIsRunning(false);
      setCurrentAbortController(null);
    }
  };

  const stopQuery = () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    setIsRunning(false);
    setCurrentAbortController(null);
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

  return (
    <div className="h-full w-full bg-white flex flex-col relative">
      {/* Query Console Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
              onClick={() => setShowQueryInput(!showQueryInput)}
              className={showQueryInput ? 'bg-gray-100' : ''}
            >
              <Code className="h-4 w-4 mr-2" />
              {showQueryInput ? 'Hide' : 'Show'} Input
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

      <div className="flex-1 flex overflow-hidden relative">
        {showHistory && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
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

        {/* Main Content Area */}
        <div 
          className="flex-1 flex flex-col bg-gray-50" 
          style={{ 
            paddingBottom: showBottomSheet ? `${bottomSheetHeight}px` : 0,
            transition: showBottomSheet ? 'none' : 'padding-bottom 0.3s ease-out'
          }}
        >
          {/* Collapsible Query Input */}
          {showQueryInput && (
            <div className="bg-white border-b border-gray-200 flex-shrink-0">
              {/* Tabs */}
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

              {/* Query Input Area */}
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
                        onClick={handleExecuteClick}
                        size="sm"
                        className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
                        disabled={!activeTab?.query.trim() && !floatingQuery.trim()}
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
                  placeholder="Enter your SQL query here... (Ctrl/Cmd + Enter to execute)"
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent resize-none"
                  style={{ minHeight: '120px' }}
                />
                
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>Press Ctrl/Cmd+Enter to execute • Ctrl/Cmd+\ to toggle input</span>
                  <button
                    onClick={() => setShowQueryInput(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main workspace area */}
          <div className="flex-1 p-6 flex items-center justify-center">
            {!showBottomSheet ? (
              <div className="text-center">
                <Terminal className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Ready to Execute Queries
                </h3>
                <p className="text-gray-600 mb-4">
                  {showQueryInput 
                    ? 'Write your SQL query above and press Execute to see results' 
                    : 'Press Ctrl/Cmd+\\ to show query input or type anywhere to start writing'
                  }
                </p>
                {!showQueryInput && (
                  <div className="max-w-md mx-auto">
                    <textarea
                      value={floatingQuery}
                      onChange={(e) => setFloatingQuery(e.target.value)}
                      placeholder="Type your SQL query here..."
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent resize-none"
                      style={{ minHeight: '120px' }}
                    />
                    <div className="mt-3 flex justify-center">
                      <Button
                        onClick={handleExecuteClick}
                        size="sm"
                        className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
                        disabled={!floatingQuery.trim()}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute Query
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Query results shown below</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sheet for Query Results */}
        {showBottomSheet && bottomSheetData && (
          <div
            ref={bottomSheetRef}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50"
            style={{ 
              height: `${bottomSheetHeight}px`,
              transition: isResizing ? 'none' : 'height 0.3s ease-out'
            }}
          >
            {/* Resize Handle */}
            <div
              ref={resizeRef}
              className="h-2 w-full cursor-row-resize bg-gray-100 hover:bg-gray-200 border-b border-gray-200 flex items-center justify-center"
              onMouseDown={handleBottomSheetResize}
            >
              <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
            </div>

            {/* Bottom Sheet Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {currentQueryStatus === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-gray-900">
                    Query Results
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {bottomSheetData.count} rows • {bottomSheetData.duration}ms
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(bottomSheetData.query)}
                  className="text-gray-600"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Query
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBottomSheet(false)}
                  className="text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results Content */}
            <div className="flex-1 overflow-hidden">
              {currentQueryStatus === 'error' ? (
                <div className="p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Query Error</h3>
                    <p className="text-red-600 font-mono text-sm">{currentQueryError}</p>
                  </div>
                </div>
              ) : !bottomSheetData.rows || bottomSheetData.rows.length === 0 ? (
                <div className="p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">No Results</h3>
                    <p className="text-gray-600">The query executed successfully but returned no data.</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Simple table header */}
                  <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      {bottomSheetData.rows.length} row{bottomSheetData.rows.length !== 1 ? 's' : ''} • {bottomSheetData.columns.length} column{bottomSheetData.columns.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Table container with horizontal scroll */}
                  <div className="flex-1 overflow-auto">
                    <div className="min-w-full">
                      <table className="w-full border-collapse" style={{ minWidth: `${Math.max(850, bottomSheetData.columns.length * 200 + 50)}px` }}>
                        <thead className="sticky top-0 bg-gray-50 z-10">
                          <tr>
                            {/* Row count header */}
                            <th
                              className="px-3 py-3 text-center text-sm font-medium text-gray-500 border-b border-gray-200 bg-gray-100"
                              style={{ 
                                width: '50px',
                                minWidth: '50px',
                                maxWidth: '50px',
                                position: 'sticky',
                                left: 0,
                                zIndex: 11
                              }}
                            >
                              #
                            </th>
                            {bottomSheetData.columns.map((column, index) => (
                              <th
                                key={`${column}-${index}`}
                                className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200 whitespace-nowrap"
                                style={{ 
                                  minWidth: '180px',
                                  maxWidth: '300px',
                                  width: bottomSheetData.columns.length <= 4 ? 'auto' : '200px'
                                }}
                              >
                                <div className="flex items-center space-x-1">
                                  <span className="truncate" title={column}>
                                    {column}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bottomSheetData.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className={`border-b border-gray-100 ${
                                rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-blue-50`}
                            >
                              {/* Row count cell */}
                              <td
                                className={`px-3 py-3 text-center text-xs font-medium text-gray-500 border-r border-gray-200 ${
                                  rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'
                                }`}
                                style={{ 
                                  width: '50px',
                                  minWidth: '50px',
                                  maxWidth: '50px',
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1
                                }}
                              >
                                {rowIndex + 1}
                              </td>
                              {row.map((cellValue, cellIndex) => (
                                <td
                                  key={`${rowIndex}-${cellIndex}`}
                                  className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                                  style={{ 
                                    minWidth: '180px',
                                    maxWidth: '300px',
                                    width: bottomSheetData.columns.length <= 4 ? 'auto' : '200px'
                                  }}
                                >
                                  <div className="truncate" title={cellValue === null || cellValue === undefined ? 'NULL' : String(cellValue)}>
                                    {cellValue === null || cellValue === undefined ? (
                                      <span className="text-gray-400 italic">NULL</span>
                                    ) : (
                                      String(cellValue)
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {bottomSheetData.rows.length > 50 && (
                    <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-600">
                        Showing first 50 rows. Use LIMIT clause to see more results efficiently.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryConsole;