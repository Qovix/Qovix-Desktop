import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTabContext } from '../context/TabContext';
import DatabaseConnectionModal, { DatabaseConnectionData } from '../components/database/DatabaseConnectionModal';
import { databaseService, DatabaseSchema as APISchema } from '../services/databaseService';
import { ContextMenu, DatabaseConnection, DatabaseSchema } from '../utils/types';
import { 
  DatabaseSidebar, 
  ContextMenuComponent, 
  MainContentArea 
} from '../components/dashboard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { openTab } = useTabContext();
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
  
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseConnection | null>(null);
  const [connectingDatabase, setConnectingDatabase] = useState<string | null>(null);
  const [hoveredDatabase, setHoveredDatabase] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const [schemas, setSchemas] = useState<Record<string, DatabaseSchema>>({});
  const [schemaLoading, setSchemaLoading] = useState<Record<string, boolean>>({});
  
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('qovix_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const connections = await databaseService.getUserConnections();
      setDatabases(connections || []);
    } catch (err) {
      console.error('Failed to load connections:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load connections';
      setError(errorMessage);
      
      if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
        setTimeout(() => {
          logout();
          window.location.reload();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleNewConnection = () => {
    setShowNewConnectionModal(true);
  };

  const handleConnectionCreated = (connectionData: DatabaseConnectionData) => {
    if (connectionData.connectionId) {
      openTab({
        id: connectionData.connectionId,
        type: 'database-explorer',
        title: connectionData.name,
        data: {
          id: connectionData.connectionId,
          name: connectionData.name,
          type: connectionData.type,
          host: connectionData.host,
          port: connectionData.port,
          database: connectionData.database,
          status: 'connected',
          version: connectionData.version,
          schemas: connectionData.schemas,
        }
      });
    }
    
    setShowNewConnectionModal(false);
    
    loadConnections();
  };

  const toggleDatabase = async (database: DatabaseConnection) => {
    if (database.status !== 'connected') {
      await handleConnect(database);
      return;
    }
    
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(database.id)) {
      newExpanded.delete(database.id);
    } else {
      newExpanded.add(database.id);
      if (!schemas[database.id]) {
        loadDatabaseSchema(database);
      }
    }
    setExpandedDatabases(newExpanded);
  };

  const handleConnect = async (database: DatabaseConnection) => {
    setConnectingDatabase(database.id);
    
    try {
      if (database.status === 'connected') {
        setExpandedDatabases(prev => new Set([...prev, database.id]));
        if (!schemas[database.id]) {
          loadDatabaseSchema(database);
        }
      } else {
        const result = await databaseService.connectToSavedConnection(database.id);
        
        setDatabases(prev => 
          prev.map(db => 
            db.id === database.id 
              ? { ...db, status: 'connected' as const, version: result.version, schemas: result.schemas }
              : db
          )
        );
        
        setExpandedDatabases(prev => new Set([...prev, database.id]));
        loadDatabaseSchema({ ...database, status: 'connected' as const });
      }
    } catch (err) {
      console.error('Failed to connect:', err);
      alert(err instanceof Error ? err.message : 'Failed to connect to database');
    } finally {
      setConnectingDatabase(null);
    }
  };

  const handleTableClick = (tableName: string, database: DatabaseConnection) => {
    setSelectedTable(tableName);
    setSelectedDatabase(database);
  };

  const loadDatabaseSchema = async (database: DatabaseConnection) => {
    if (!database.id || schemaLoading[database.id]) return;

    setSchemaLoading(prev => ({ ...prev, [database.id]: true }));

    try {
      const apiSchema = await databaseService.getSchema(database.id);
      console.log('Loaded database schema:', apiSchema);
      const uiSchema: DatabaseSchema = {
        name: apiSchema.name,
        tables: apiSchema.tables.map(table => ({
          name: table.name,
          type: 'table' as const,
          columns: table.columns,
        })),
        views: [], 
        procedures: []
      };
      
      setSchemas(prev => ({ ...prev, [database.id]: uiSchema }));
    } catch (err) {
      console.error('Failed to load database schema:', err);
    } finally {
      setSchemaLoading(prev => ({ ...prev, [database.id]: false }));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'database' | 'table', itemName: string, databaseName?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      itemName,
      databaseName
    });
  };

  const handleContextAction = (action: string) => {
    if (!contextMenu) return;
    
    const database = databases.find(db => db.name === contextMenu.itemName || db.id === contextMenu.itemName);
    
    switch (action) {
      case 'refresh':
        if (contextMenu.type === 'database' && database) {
          loadDatabaseSchema(database);
        }
        break;
      case 'disconnect':
        if (contextMenu.type === 'database' && database) {
          handleDisconnectFromSidebar(database);
        }
        break;
      case 'settings':
        console.log(`Settings for ${contextMenu.type}: ${contextMenu.itemName}`);
        break;
      case 'view-structure':
        console.log(`View structure for table: ${contextMenu.itemName}`);
        break;
      case 'delete-table':
        console.log(`Delete table: ${contextMenu.itemName}`);
        break;
    }
    setContextMenu(null);
  };

  const handleDisconnectFromSidebar = async (database: DatabaseConnection) => {
    try {
      setDatabases(prev => 
        prev.map(db => 
          db.id === database.id 
            ? { ...db, status: 'disconnected' as const }
            : db
        )
      );
      
      setExpandedDatabases(prev => {
        const newSet = new Set(prev);
        newSet.delete(database.id);
        return newSet;
      });
      
      if (selectedDatabase?.id === database.id) {
        setSelectedTable(null);
        setSelectedDatabase(null);
      }

      await databaseService.disconnectActiveConnection(database.id);
      setTimeout(() => loadConnections(), 500);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setDatabases(prev => prev.map(db => 
        db.id === database.id 
          ? { ...db, status: 'connected' as const }
          : db
      ));
      alert(err instanceof Error ? err.message : 'Failed to disconnect from database');
    }
  };

  const handleRunQuery = (query: string) => {
    if (!selectedDatabase) return;
    
    openTab({
      id: `query-${selectedDatabase.id}-${Date.now()}`,
      type: 'query-console',
      title: `Query - ${selectedDatabase.name}`,
      data: {
        database: selectedDatabase,
        initialQuery: query
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div className="h-full w-full bg-white flex">
      <DatabaseSidebar
        databases={databases}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        expandedDatabases={expandedDatabases}
        selectedTable={selectedTable}
        selectedDatabase={selectedDatabase}
        schemas={schemas}
        schemaLoading={schemaLoading}
        connectingDatabase={connectingDatabase}
        hoveredDatabase={hoveredDatabase}
        hoveredTable={hoveredTable}
        onHoverDatabase={setHoveredDatabase}
        onHoverTable={setHoveredTable}
        onNewConnection={handleNewConnection}
        onLogout={handleLogout}
        onLoadConnections={loadConnections}
        onToggleDatabase={toggleDatabase}
        onConnect={handleConnect}
        onTableClick={handleTableClick}
        onContextMenu={handleContextMenu}
      />

      <MainContentArea
        selectedTable={selectedTable}
        selectedDatabase={selectedDatabase}
        databases={databases}
        schemas={schemas}
        isAIOpen={isAIOpen}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        onRunQuery={handleRunQuery}
      />

      <ContextMenuComponent
        contextMenu={contextMenu}
        databases={databases}
        onAction={handleContextAction}
      />

      <DatabaseConnectionModal
        isOpen={showNewConnectionModal}
        onClose={() => setShowNewConnectionModal(false)}
        onConnect={handleConnectionCreated}
      />
    </div>
  );
}