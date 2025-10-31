import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Eye, 
  Terminal,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Search,
  Folder,
  FolderOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import TableDataView from '../components/database/TableDataView';
import AIQueryAssistant from '../components/database/AIQueryAssistant';
import { useTabContext } from '../context/TabContext';
import { databaseService, DatabaseSchema as APISchema } from '../services/databaseService';
import { DatabaseConnectionTest } from '../components/database/DatabaseConnectionTest';
import { DatabaseExplorerProps, DatabaseSchema } from 'src/utils/types';
import { ContextMenu } from '../components/database';

export default function DatabaseExplorer({ database }: DatabaseExplorerProps) {
  const { openTab } = useTabContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    target: any;
  } | null>(null);

  const [schema, setSchema] = useState<DatabaseSchema>({
    name: database.name,
    tables: [],
    views: [],
    procedures: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    tables: true,
    views: false,
    procedures: false,
  });

  useEffect(() => {
    loadDatabaseSchema();
  }, [database.id]);

  const loadDatabaseSchema = async () => {
    if (!database.id) return;

    setLoading(true);
    setError(null);

    try {
      const apiSchema = await databaseService.getSchema(database.id);
      console.log('Loaded database schema:', apiSchema);
      const uiSchema: DatabaseSchema = {
        name: apiSchema.name,
        tables: apiSchema.tables.map(table => ({
          name: table.name,
          type: 'table' as const,
          columns: table.columns,
          rowCount: undefined 
        })),
        views: [], 
        procedures: []
      };

      setSchema(uiSchema);
    } catch (err) {
      console.error('Failed to load database schema:', err);
      setError(err instanceof Error ? err.message : 'Failed to load database schema');
    } finally {
      setLoading(false);
    }
  };

  const handleRightClick = (event: React.MouseEvent, type: string, name: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      target: { type, name }
    });
  };

  const handleContextAction = (action: string, target: any) => {
    console.log('Context action:', action, 'on', target);
  };

  const handleRunQuery = (query: string) => {
    console.log('Running query:', query);
  };

  const TableDataViewWrapper: React.FC<{ selectedTable: string }> = ({ selectedTable }) => {
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [tableError, setTableError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const rowsPerPage = 50;

    console.log('TableDataViewWrapper state:', { tableData, tableLoading, tableError, columns: tableData?.length });

    const tableSchema = schema.tables.find(table => table.name === selectedTable);
    
    console.log('Table schema for', selectedTable, ':', tableSchema);
    
    const columns = tableSchema?.columns?.map(col => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      primaryKey: col.is_primary_key,
      foreignKey: false 
    })) || [];

    const loadTableData = async (page = 1) => {
      if (!database.id || !selectedTable) return;

      setTableLoading(true);
      setTableError(null);

      try {
        const query = `SELECT TOP (${rowsPerPage}) * FROM [${selectedTable}]`;
        
        const result = await databaseService.executeQuery(database.id, query, rowsPerPage);
        
        console.log('Query result:', result);
        
        const formattedData = (result.rows || []).map(row => {
          const rowObj: any = {};
          (result.columns || []).forEach((colName, index) => {
            rowObj[colName] = row?.[index];
          });
          return rowObj;
        });

        setTableData(formattedData);
        
        if (page === 1) {
          try {
            const countResult = await databaseService.executeQuery(database.id, `SELECT COUNT(*) as total FROM [${selectedTable}]`, 1);
            setTotalRows(countResult.rows?.[0]?.[0] || 0);
          } catch (countError) {
            console.warn('Failed to get row count:', countError);
            setTotalRows(formattedData.length);
          }
        }

      } catch (err) {
        console.error('Failed to load table data:', err);
        setTableError(err instanceof Error ? err.message : 'Failed to load table data');
        setTableData([]);
        setTotalRows(0);
      } finally {
        setTableLoading(false);
      }
    };

    useEffect(() => {
      if (selectedTable && tableSchema) {
        setCurrentPage(1);
        loadTableData(1);
      }
    }, [selectedTable, database.id]);

    const handleRefresh = () => {
      loadTableData(currentPage);
    };

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
      loadTableData(newPage);
    };

    if (!tableSchema) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Table Schema Not Found
            </h3>
            <p className="text-gray-600">
              Unable to find schema information for table: {selectedTable}
            </p>
          </div>
        </div>
      );
    }

    if (tableError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Table Data
            </h3>
            <p className="text-red-600 mb-4">{tableError}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (tableLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#bc3a08]" />
            <span className="text-lg text-gray-600">Loading table data...</span>
          </div>
        </div>
      );
    }

    return (
      <TableDataView
        tableName={selectedTable}
        columns={columns || []}
        data={tableData || []}
        totalRows={totalRows}
        onRefresh={handleRefresh}
        onInsertRow={() => console.log('Insert row')}
        onExportCSV={() => console.log('Export CSV')}
        onEditRow={(row, index) => console.log('Edit row', row, index)}
        onDeleteRow={(row, index) => console.log('Delete row', row, index)}
      />
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredViews = schema.views.filter(view =>
    view.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProcedures = schema.procedures?.filter(proc =>
    proc.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-[#bc3a08]" />
            <div>
              <h1 className="font-semibold text-gray-900">{database.name}</h1>
              <p className="text-xs text-gray-500">
                {database.type} • {database.host}:{database.port}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDatabaseSchema}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Button
              onClick={() => openTab({
                id: `console-${database.id}`,
                type: 'query-console',
                title: `Console: ${database.name}`,
                data: {
                  database: database,
                  initialQuery: ''
                }
              })}
              size="sm"
              className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Query Console
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tables, views..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#bc3a08]" />
                  <span className="text-sm text-gray-600">Loading schema...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {!loading && !error && 
              <div className="space-y-2">
                <div
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  onContextMenu={(e) => handleRightClick(e, 'database', database.name)}
                >
                  <Database className="h-4 w-4 text-[#bc3a08]" />
                  <span className="font-medium text-gray-900">{database.name}</span>
                </div>
                </div>
              }

            <div>
              <button
                onClick={() => toggleSection('tables')}
                className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
              >
                {expandedSections.tables ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <Folder className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Tables ({filteredTables?.length})
                </span>
              </button>

              {expandedSections.tables && (
                <div className="ml-6 space-y-1">
                  {filteredTables?.map((table) => (
                    <div
                      key={table.name}
                      className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer ${
                        selectedItem === table.name ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedItem(table.name)}
                      onContextMenu={(e) => handleRightClick(e, 'table', table.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <Table className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{table.name}</span>
                      </div>
                      {table.rowCount && (
                        <span className="text-xs text-gray-400">
                          {table.rowCount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection('views')}
                className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
              >
                {expandedSections.views ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <FolderOpen className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Views ({filteredViews?.length})
                </span>
              </button>

              {expandedSections.views && (
                <div className="ml-6 space-y-1">
                  {filteredViews?.map((view) => (
                    <div
                      key={view.name}
                      className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                        selectedItem === view.name ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedItem(view.name)}
                      onContextMenu={(e) => handleRightClick(e, 'view', view.name)}
                    >
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">{view.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {schema.procedures && schema.procedures.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('procedures')}
                  className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
                >
                  {expandedSections.procedures ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <Folder className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Procedures ({filteredProcedures?.length})
                  </span>
                </button>

                {expandedSections.procedures && (
                  <div className="ml-6 space-y-1">
                    {filteredProcedures?.map((procedure) => (
                      <div
                        key={procedure}
                        className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                          selectedItem === procedure ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedItem(procedure)}
                        onContextMenu={(e) => handleRightClick(e, 'procedure', procedure)}
                      >
                        <Terminal className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-700">{procedure}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex">
          <div className={`flex-1 flex flex-col ${isAIOpen ? 'mr-0' : ''}`}>
            {selectedItem ? (
              <TableDataViewWrapper selectedTable={selectedItem} />
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col space-y-4">
                <div className="text-center">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Table or View
                  </h3>
                  <p className="text-gray-600">
                    Choose an item from the sidebar to view its data
                  </p>
                </div>
                
                {database.id && (
                  <DatabaseConnectionTest connectionId={database.id} />
                )}
              </div>
            )}
          </div>

          <AIQueryAssistant
            isOpen={isAIOpen}
            onToggle={() => setIsAIOpen(!isAIOpen)}
            database={database}
            selectedTable={selectedItem || undefined}
            onRunQuery={handleRunQuery}
            className={isAIOpen ? 'w-96' : 'fixed right-4 top-1/2 transform -translate-y-1/2 z-10'}
          />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  );
}