import React from 'react';
import { X, Home, Database, Terminal } from 'lucide-react';
import { useTabContext } from '../../context/TabContext';

const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabContext();

  const getTabIcon = (type: string, iconName?: string) => {
    switch (type) {
      case 'dashboard':
        return <Home className="h-4 w-4" />;
      case 'database-explorer':
        return <Database className="h-4 w-4" />;
      case 'query-console':
        return <Terminal className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div className="bg-white border-b border-gray-200 flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center space-x-2 px-4 py-3 border-r border-gray-200 cursor-pointer min-w-0 max-w-xs transition-all duration-200 ${
            tab.isActive
              ? 'bg-white border-b-2 border-[#bc3a08] text-[#bc3a08]'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {/* Tab Icon */}
          <div className="flex-shrink-0">
            {getTabIcon(tab.type, tab.icon)}
          </div>

          {/* Tab Title */}
          <span className="text-sm font-medium truncate min-w-0">
            {truncateTitle(tab.title)}
          </span>

          {/* Close Button - only show for non-dashboard tabs */}
          {tab.id !== 'dashboard' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors ${
                tab.isActive ? 'hover:bg-red-100' : ''
              } opacity-0 group-hover:opacity-100`}
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Connection Status Indicator for Database Tabs */}
          {tab.type === 'database-explorer' && tab.data?.status && (
            <div className="flex-shrink-0">
              <div className={`h-2 w-2 rounded-full ${
                tab.data.status === 'connected' ? 'bg-green-500' :
                tab.data.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
            </div>
          )}
        </div>
      ))}

      {/* Tab Bar Gradient Fade for Overflow */}
      <div className="flex-1 bg-gray-50 border-r border-gray-200" />
      
      {/* New Tab Button */}
      <div className="flex-shrink-0 px-2">
        <button
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
          title="New tab options available from Dashboard"
        >
          <Database className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TabBar;