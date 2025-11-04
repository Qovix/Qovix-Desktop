import React, { memo } from 'react';
import { 
  Database,
  ChevronRight, 
  ChevronDown,
  MoreVertical,
  Loader2,
  Wifi,
} from 'lucide-react';
import { DatabaseItemProps } from '../../utils/types';
import { getDatabaseIcon, getStatusIndicator } from '../../utils/utils';
import TableItem from './TableItem';

const DatabaseItem: React.FC<DatabaseItemProps> = memo(({
  database,
  isExpanded,
  schema,
  isSchemaLoading,
  filteredTables,
  selectedTable,
  selectedDatabase,
  connectingDatabase,
  hoveredDatabase,
  hoveredTable,
  onHoverDatabase,
  onHoverTable,
  onToggleDatabase,
  onConnect,
  onTableClick,
  onContextMenu,
}) => {
  return (
    <div className="mb-1">
      <div
        className="relative group"
        onMouseEnter={() => onHoverDatabase(database.id)}
        onMouseLeave={() => onHoverDatabase(null)}
      >
        <button
          onClick={() => onToggleDatabase(database)}
          className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-all duration-200 hover:bg-gray-100 group"
          style={{
            backgroundColor: isExpanded 
              ? 'rgba(188, 58, 8, 0.12)' 
              : 'transparent',
            borderLeft: isExpanded 
              ? '3px solid #bc3a08' 
              : '3px solid transparent'
          }}
        >
          <div className="flex items-center space-x-2 flex-1">
            <div className="flex items-center space-x-2">
              {database.status === 'connected' ? (
                getDatabaseIcon(database.type)
              ) : (
                <Database className="h-4 w-4 text-gray-400" />
              )}
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${database.status === 'connected' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {database.name}
                </span>
                <div className="flex items-center space-x-2">
                  {getStatusIndicator(database.status)}
                  <span className={`text-xs capitalize ${
                    database.status === 'connected' ? 'text-green-600' :
                    database.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {database.status}
                  </span>
                </div>
                {database.status !== 'connected' && (
                  <div className="flex items-center mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnect(database);
                      }}
                      disabled={connectingDatabase === database.id}
                      className="flex items-center space-x-1 text-xs text-[#bc3a08] hover:text-[#a0340a] disabled:text-gray-400"
                    >
                      {connectingDatabase === database.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Wifi className="h-3 w-3" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Three dots menu - only show on hover */}
            {hoveredDatabase === database.id && (
              <button
                onClick={(e) => onContextMenu(e, 'database', database.id)}
                className="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
              >
                <MoreVertical className="h-3 w-3 text-gray-500" />
              </button>
            )}
            
            {/* Chevron - only show if connected */}
            {database.status === 'connected' && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )
            )}
          </div>
        </button>
      </div>

      {/* Tables List - only show if connected and expanded */}
      {database.status === 'connected' && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {isSchemaLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-3 w-3 animate-spin text-[#bc3a08]" />
                <span className="text-xs text-gray-600">Loading tables...</span>
              </div>
            </div>
          ) : filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <TableItem
                key={table.name}
                table={table}
                database={database}
                isSelected={selectedTable === table.name && selectedDatabase?.id === database.id}
                isHovered={hoveredTable === table.name}
                onHover={onHoverTable}
                onClick={onTableClick}
                onContextMenu={onContextMenu}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-xs text-gray-500">No tables found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DatabaseItem;