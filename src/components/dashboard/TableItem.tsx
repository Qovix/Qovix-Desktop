import React, { memo } from 'react';
import { Table, MoreVertical } from 'lucide-react';
import { DatabaseConnection } from '../../utils/types';

interface TableItemProps {
  table: { name: string; type: 'table'; columns: any[]; rowCount?: number };
  database: DatabaseConnection;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (name: string | null) => void;
  onClick: (tableName: string, database: DatabaseConnection) => void;
  onContextMenu: (e: React.MouseEvent, type: 'database' | 'table', itemName: string, databaseName?: string) => void;
}

const TableItem: React.FC<TableItemProps> = memo(({
  table,
  database,
  isSelected,
  isHovered,
  onHover,
  onClick,
  onContextMenu,
}) => {
  return (
    <div
      className="relative group"
      onMouseEnter={() => onHover(table.name)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        onClick={() => onClick(table.name, database)}
        className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-all duration-200 hover:bg-gray-100"
        style={{
          backgroundColor: isSelected
            ? 'rgba(188, 58, 8, 0.12)' 
            : 'transparent',
          borderLeft: isSelected
            ? '3px solid #bc3a08' 
            : '3px solid transparent',
          color: isSelected ? '#bc3a08' : '#374151'
        }}
      >
        <div className="flex items-center space-x-2">
          <Table className="h-4 w-4" />
          <span className="text-sm">
            {table.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Three dots menu - only show on hover */}
          {isHovered && (
            <button
              onClick={(e) => onContextMenu(e, 'table', table.name, database.id)}
              className="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
            >
              <MoreVertical className="h-3 w-3 text-gray-500" />
            </button>
          )}
        </div>
      </button>
    </div>
  );
});

export default TableItem;