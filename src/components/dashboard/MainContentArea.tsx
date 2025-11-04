import React from 'react';
import { AlertCircle, Database, Loader2, RefreshCw, Brain, X, Clock } from 'lucide-react';
import { DatabaseConnection, DatabaseSchema, MainContentAreaProps } from '../../utils/types';
import { TableDataView } from '../database';
import { Button } from '../ui';
import { databaseService } from '../../services/databaseService';

const TableDataViewWrapper: React.FC<{ 
  selectedTable: string; 
  database: DatabaseConnection; 
  schemas: { [key: string]: DatabaseSchema };
  isAIOpen: boolean;
  onToggleAI: () => void;
  onRunQuery: (query: string) => void;
}> = React.memo(({ selectedTable, database, schemas, isAIOpen, onToggleAI, onRunQuery }) => {
  const [tableData, setTableData] = React.useState<any[]>([]);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [tableError, setTableError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalRows, setTotalRows] = React.useState(0);
  const [hasLoadedInitialData, setHasLoadedInitialData] = React.useState(false);
  const [lastLoadedTable, setLastLoadedTable] = React.useState<string | null>(null);
  
  const rowsPerPage = React.useMemo(() => 50, []);

  const schema = React.useMemo(() => schemas[database.id], [schemas, database.id]);
  const tableSchema = React.useMemo(() => 
    schema?.tables.find(table => table.name === selectedTable), 
    [schema, selectedTable]
  );
  
  const columns = React.useMemo(() => 
    tableSchema?.columns?.map(col => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      primaryKey: col.is_primary_key,
      foreignKey: false 
    })) || [], 
    [tableSchema]
  );

  const loadTableData = React.useCallback(async (page = 1) => {
    if (!database.id || !selectedTable) {
      console.log('Missing required data for loading table:', { databaseId: database.id, selectedTable });
      return;
    }

    setTableLoading(true);
    setTableError(null);

    try {
      const query = `SELECT TOP (${rowsPerPage}) * FROM [${selectedTable}]`;
      const result = await databaseService.executeQuery(database.id, query, rowsPerPage);
      
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
          console.log('Total rows count result:', countResult);
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
  }, [database.id, selectedTable, rowsPerPage]);

  React.useEffect(() => {
    if (selectedTable !== lastLoadedTable) {
      console.log('Table changed from', lastLoadedTable, 'to', selectedTable);
      setTableData([]);
      setTableError(null);
      setCurrentPage(1);
      setTotalRows(0);
      setHasLoadedInitialData(false);
      setLastLoadedTable(selectedTable);
    }
  }, [selectedTable, lastLoadedTable]);

  React.useEffect(() => {
    if (selectedTable && database.id && tableSchema && !hasLoadedInitialData && !tableLoading) {
      console.log('Loading table data for:', selectedTable, 'in database:', database.id);
      setHasLoadedInitialData(true);
      loadTableData(1);
    }
  }, [selectedTable, database.id, tableSchema, hasLoadedInitialData, tableLoading]);

  const handleRefresh = React.useCallback(() => {
    console.log('Refreshing table data');
    setHasLoadedInitialData(false);
    loadTableData(currentPage);
  }, [loadTableData, currentPage]);

  if (tableError || tableLoading) {

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
      onEditRow={(row: any, index: number) => console.log('Edit row', row, index)}
      onDeleteRow={(row: any, index: number) => console.log('Delete row', row, index)}
      database={{
        id: database.id,
        name: database.name,
        type: database.type
      }}
      isAIOpen={isAIOpen}
      onToggleAI={onToggleAI}
      onRunQuery={onRunQuery}
    />
  );
});

const MainContentArea: React.FC<MainContentAreaProps> = ({
  selectedTable,
  selectedDatabase,
  databases,
  schemas,
  isAIOpen,
  onToggleAI,
  onRunQuery,
  queryResult,
  queryLoading,
  queryError,
  onClearQueryResults,
}) => {
  const renderTableData = () => {
    // Show query results if available
    if (queryResult) {
      const columns = queryResult.columns.map(col => ({
        name: col,
        type: 'text', // We don't have type info from query results
        nullable: true,
        primaryKey: false,
        foreignKey: false
      }));

      return (
        <div className="flex-1 flex flex-col">
          {/* AI Query Result Banner */}
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Query Result</span>
                </div>
                <div className="text-sm text-blue-700">
                  {queryResult.totalRows} row{queryResult.totalRows !== 1 ? 's' : ''} found
                  {queryResult.executionTime && (
                    <>
                      <Clock className="h-3 w-3 inline mx-1" />
                      {queryResult.executionTime}ms
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRunQuery(queryResult.query)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                {onClearQueryResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearQueryResults}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs font-mono text-blue-800 bg-blue-100 p-2 rounded">
              {queryResult.query.length > 100 
                ? `${queryResult.query.substring(0, 100)}...`
                : queryResult.query
              }
            </div>
          </div>

          {/* Table Data */}
          <div className="flex-1">
            <TableDataView
              tableName={`Query Result (${queryResult.database.name})`}
              columns={columns}
              data={queryResult.data}
              totalRows={queryResult.totalRows}
              onRefresh={() => {
                // Re-execute the query
                onRunQuery(queryResult.query);
              }}
              onInsertRow={() => console.log('Insert not available for query results')}
              onExportCSV={() => console.log('Export CSV')}
              onEditRow={(row: any, index: number) => console.log('Edit not available for query results')}
              onDeleteRow={(row: any, index: number) => console.log('Delete not available for query results')}
              database={{
                id: queryResult.database.id,
                name: queryResult.database.name,
                type: queryResult.database.type
              }}
              isAIOpen={isAIOpen}
              onToggleAI={onToggleAI}
              onRunQuery={onRunQuery}
            />
          </div>
        </div>
      );
    }

    // Show loading state for query execution
    if (queryLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#bc3a08]" />
            <span className="text-lg text-gray-600">Executing query...</span>
          </div>
        </div>
      );
    }

    // Show query error
    if (queryError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Query Execution Error
            </h3>
            <p className="text-red-600 mb-4">{queryError}</p>
          </div>
        </div>
      );
    }

    // Show table data if a table is selected
    if (selectedTable && selectedDatabase && schemas[selectedDatabase.id]) {
      return <TableDataViewWrapper 
        selectedTable={selectedTable} 
        database={selectedDatabase} 
        schemas={schemas}
        isAIOpen={isAIOpen}
        onToggleAI={onToggleAI}
        onRunQuery={onRunQuery}
      />;
    }

    // Default state - no table selected and no query results
    const connectedDatabases = databases.filter(db => db.status === 'connected');
    const disconnectedDatabases = databases.filter(db => db.status !== 'connected');

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Table or Run a Query
          </h3>
          <p className="text-gray-600 mb-4">
            Connect to a database and choose a table to view its data, or use the AI assistant to run queries
          </p>
          
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>{connectedDatabases.length} database(s) connected</span>
            </div>
            {disconnectedDatabases.length > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <span>{disconnectedDatabases.length} database(s) disconnected</span>
              </div>
            )}
          </div>
          
          {disconnectedDatabases.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              Click database names in the sidebar to connect and explore tables
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {renderTableData()}
    </div>
  );
};

export default MainContentArea;