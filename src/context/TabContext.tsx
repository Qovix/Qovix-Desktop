import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  type: 'dashboard' | 'database-explorer' | 'query-console';
  title: string;
  icon?: string;
  data?: any;
  isActive: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string;
  openTab: (tab: Omit<Tab, 'isActive'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};

interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'dashboard',
      type: 'dashboard',
      title: 'Dashboard',
      icon: 'home',
      isActive: true,
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState('dashboard');

  const openTab = (newTab: Omit<Tab, 'isActive'>) => {
    setTabs(prevTabs => {
      // Check if tab already exists
      const existingTab = prevTabs.find(tab => tab.id === newTab.id);
      if (existingTab) {
        // If tab exists, just activate it
        return prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === newTab.id
        }));
      }

      // Add new tab and set it as active
      return prevTabs.map(tab => ({ ...tab, isActive: false })).concat({
        ...newTab,
        isActive: true
      });
    });
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    // Don't allow closing the dashboard tab
    if (tabId === 'dashboard') return;

    setTabs(prevTabs => {
      const filteredTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to dashboard
      if (activeTabId === tabId) {
        const updatedTabs = filteredTabs.map(tab => ({
          ...tab,
          isActive: tab.id === 'dashboard'
        }));
        setActiveTabId('dashboard');
        return updatedTabs;
      }
      
      return filteredTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    );
    setActiveTabId(tabId);
  };

  const updateTabTitle = (tabId: string, title: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, title } : tab
      )
    );
  };

  return (
    <TabContext.Provider value={{
      tabs,
      activeTabId,
      openTab,
      closeTab,
      setActiveTab,
      updateTabTitle,
    }}>
      {children}
    </TabContext.Provider>
  );
};