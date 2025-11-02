import React from 'react';
import { 
  Plus, 
  LogOut, 
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '../ui/input';
import { DatabaseSidebarProps } from '../../utils/types';
import DatabaseItem from './DatabaseItem';

const DatabaseSidebar: React.FC<DatabaseSidebarProps> = ({
  databases,
  loading,
  error,
  searchTerm,
  onSearchChange,
  expandedDatabases,
  selectedTable,
  selectedDatabase,
  schemas,
  schemaLoading,
  connectingDatabase,
  hoveredDatabase,
  hoveredTable,
  onHoverDatabase,
  onHoverTable,
  onNewConnection,
  onLogout,
  onLoadConnections,
  onToggleDatabase,
  onConnect,
  onTableClick,
  onContextMenu,
}) => {
  return (
    <div 
      className="bg-white border-r border-gray-200 flex flex-col"
      style={{ width: '270px' }}
    >
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900">Database Explorer</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewConnection}
              className="p-1 text-[#bc3a08] hover:bg-gray-100 rounded transition-colors duration-200"
              title="New Connection"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">Connected Databases</p>
        
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search databases..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#bc3a08]" />
                <span className="text-sm text-gray-600">Loading databases...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
              <button
                onClick={onLoadConnections}
                className="mt-2 text-xs text-red-600 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && databases.map((database) => {
            const isExpanded = expandedDatabases.has(database.id);
            const schema = schemas[database.id];
            const isSchemaLoading = schemaLoading[database.id];
            const filteredTables :any= schema?.tables.filter(table =>
              table.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [];

            if (searchTerm && !database.name.toLowerCase().includes(searchTerm.toLowerCase()) && filteredTables.length === 0) {
              return null;
            }

            return (
              <DatabaseItem
                key={database.id}
                database={database}
                isExpanded={isExpanded}
                schema={schema}
                isSchemaLoading={isSchemaLoading}
                filteredTables={filteredTables}
                selectedTable={selectedTable}
                selectedDatabase={selectedDatabase}
                connectingDatabase={connectingDatabase}
                hoveredDatabase={hoveredDatabase}
                hoveredTable={hoveredTable}
                onHoverDatabase={onHoverDatabase}
                onHoverTable={onHoverTable}
                onToggleDatabase={onToggleDatabase}
                onConnect={onConnect}
                onTableClick={onTableClick}
                onContextMenu={onContextMenu}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSidebar;