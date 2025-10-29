import React from 'react';
import { useTabContext } from '../../context/TabContext';
import TabBar from './TabBar';
import Dashboard from '../../pages/Dashboard';
import DatabaseExplorer from '../../pages/DatabaseExplorer';
import QueryConsole from '../../pages/QueryConsole';

const AppLayout: React.FC = () => {
  const { tabs, activeTabId, closeTab } = useTabContext();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab.type) {
      case 'dashboard':
        return <Dashboard />;
        
      case 'database-explorer':
        return (
          <DatabaseExplorer
            database={activeTab.data}
            onBack={() => closeTab(activeTab.id)}
          />
        );
        
      case 'query-console':
        return (
          <QueryConsole
            database={activeTab.data.database}
            onBack={() => closeTab(activeTab.id)}
            initialQuery={activeTab.data.initialQuery}
          />
        );
        
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      <TabBar />
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AppLayout;