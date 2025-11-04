import React, { memo } from 'react';
import { 
  RefreshCw, 
  WifiOff, 
  Settings, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { ContextMenu, DatabaseConnection } from '../../utils/types';

interface ContextMenuComponentProps {
  contextMenu: ContextMenu | null;
  databases: DatabaseConnection[];
  onAction: (action: string) => void;
}

const ContextMenuComponent: React.FC<ContextMenuComponentProps> = memo(({
  contextMenu,
  databases,
  onAction,
}) => {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[150px]"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      {contextMenu.type === 'database' ? (
        <>
          <button
            onClick={() => onAction('refresh')}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          {databases.find(db => db.id === contextMenu.itemName)?.status === 'connected' && (
            <button
              onClick={() => onAction('disconnect')}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <WifiOff className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          )}
          
          <button
            onClick={() => onAction('settings')}
            className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onAction('open-in-tab')}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Open in New Tab</span>
          </button>
          
          <button
            onClick={() => onAction('view-structure')}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>View Structure</span>
          </button>
          
          <div className="border-t border-gray-200 my-1"></div>
          
          <button
            onClick={() => onAction('delete-table')}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Table</span>
          </button>
        </>
      )}
    </div>
  );
});

export default ContextMenuComponent;