import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTabContext } from '../context/TabContext';
import { Plus, Database, Server, Activity, ChevronRight, Settings, LogOut, RefreshCw, AlertCircle, Trash2, Power, PowerOff, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import DatabaseConnectionModal, { DatabaseConnectionData } from '../components/database/DatabaseConnectionModal';
import { databaseService } from '../services/databaseService';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: number;
  database?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  version?: string;
  schemas?: string[];
}

const mockDatabases: DatabaseConnection[] = [
  {
    id: '1',
    name: 'Production MySQL',
    type: 'mysql',
    host: 'prod-mysql.example.com',
    port: 3306,
    status: 'connected',
    lastConnected: new Date('2024-10-27T10:30:00')
  },
  {
    id: '2',
    name: 'Analytics PostgreSQL',
    type: 'postgresql',
    host: 'analytics.example.com',
    port: 5432,
    status: 'disconnected',
    lastConnected: new Date('2024-10-26T15:45:00')
  },
  {
    id: '3',
    name: 'User Data MongoDB',
    type: 'mongodb',
    host: 'mongo-cluster.example.com',
    port: 27017,
    status: 'error',
    lastConnected: new Date('2024-10-25T09:15:00')
  }
];

const getDatabaseIcon = (type: string) => {
  switch (type) {
    case 'mysql':
      return <Database className="h-5 w-5 text-orange-600" />;
    case 'postgresql':
      return <Database className="h-5 w-5 text-blue-600" />;
    case 'mongodb':
      return <Database className="h-5 w-5 text-green-600" />;
    case 'sqlserver':
      return <Server className="h-5 w-5 text-red-600" />;
    default:
      return <Database className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'connected':
      return <div className="h-2 w-2 bg-green-500 rounded-full" />;
    case 'disconnected':
      return <div className="h-2 w-2 bg-gray-400 rounded-full" />;
    case 'error':
      return <div className="h-2 w-2 bg-red-500 rounded-full" />;
    default:
      return <div className="h-2 w-2 bg-gray-400 rounded-full" />;
  }
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { openTab } = useTabContext();
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    connection: DatabaseConnection;
  } | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
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
      
      // If it's an authentication error, redirect to login
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

  const handleDatabaseClick = async (database: DatabaseConnection) => {
    try {
      if (database.status === 'connected') {
        // If already connected, just open the tab
        openTab({
          id: `db-${database.id}`,
          type: 'database-explorer',
          title: database.name,
          data: {
            id: database.id,
            name: database.name,
            type: database.type,
            host: database.host,
            port: database.port,
            database: database.database,
            status: database.status,
            version: database.version,
            schemas: database.schemas,
          }
        });
      } else {
        // Try to connect to the saved connection
        const result = await databaseService.connectToSavedConnection(database.id);
        
        openTab({
          id: database.id,
          type: 'database-explorer',
          title: database.name,
          data: {
            id: database.id,
            name: database.name,
            type: database.type,
            host: database.host,
            port: database.port,
            database: result.database || database.database,
            status: 'connected',
            version: result.version,
            schemas: result.schemas,
          }
        });

        // Refresh the connections list to update status
        loadConnections();
      }
    } catch (err) {
      console.error('Failed to connect to database:', err);
      alert(err instanceof Error ? err.message : 'Failed to connect to database');
    }
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
    
    // Refresh the connections list to show the new connection
    loadConnections();
  };

  const handleContextMenu = (e: React.MouseEvent, connection: DatabaseConnection) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      connection,
    });
  };

  const handleDeleteConnection = async (connection: DatabaseConnection) => {
    if (!confirm(`Are you sure you want to delete "${connection.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await databaseService.deleteConnection(connection.id);
      setDatabases(prev => prev.filter(db => db.id !== connection.id));
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to delete connection:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete connection');
    }
  };

  const handleReconnect = async (connection: DatabaseConnection) => {
    try {
      // Optimistically update the UI
      setDatabases(prev => prev.map(db => 
        db.id === connection.id 
          ? { ...db, status: 'connected' as const }
          : db
      ));
      setContextMenu(null);

      // Call the backend
      await databaseService.connectToSavedConnection(connection.id);
      
      // Refresh to get the actual status from server
      setTimeout(() => loadConnections(), 500);
    } catch (err) {
      console.error('Failed to reconnect:', err);
      // Revert the optimistic update on error
      setDatabases(prev => prev.map(db => 
        db.id === connection.id 
          ? { ...db, status: 'disconnected' as const }
          : db
      ));
      alert(err instanceof Error ? err.message : 'Failed to reconnect to database');
    }
  };

  const handleDisconnect = async (connection: DatabaseConnection) => {
    try {
      setDatabases(prev => prev.map(db => 
        db.id === connection.id 
          ? { ...db, status: 'disconnected' as const }
          : db
      ));
      setContextMenu(null);

      await databaseService.disconnectActiveConnection(connection.id);
      
      setTimeout(() => loadConnections(), 500);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setDatabases(prev => prev.map(db => 
        db.id === connection.id 
          ? { ...db, status: 'connected' as const }
          : db
      ));
      alert(err instanceof Error ? err.message : 'Failed to disconnect from database');
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold tracking-wide" 
              style={{ 
                color: '#bc3a08',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}
            >
              Qovix
            </h1>
            <div className="text-sm text-gray-500">Database Management</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#bc3a08] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Database Connections
                </h1>
                <p className="text-gray-600">
                  Manage your database connections and explore your data
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={loadConnections}
                  variant="outline"
                  disabled={loading}
                  className="shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleNewConnection}
                  className="bg-[#bc3a08] hover:bg-[#a0340a] text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Connection
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load connections</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={loadConnections}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading connections...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map((db) => (
              <div
                key={db.id}
                onClick={() => handleDatabaseClick(db)}
                onContextMenu={(e) => handleContextMenu(e, db)}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getDatabaseIcon(db.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#bc3a08] transition-colors">
                        {db.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {db.type}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIndicator(db.status)}
                    <span className={`text-sm font-medium capitalize ${
                      db.status === 'connected' ? 'text-green-600' :
                      db.status === 'error' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {db.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    <div className="flex items-center space-x-1 mb-1">
                      <Server className="h-3 w-3" />
                      <span>{db.host}:{db.port}</span>
                    </div>
                    {db.lastConnected && (
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Last: {db.lastConnected.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div
              onClick={handleNewConnection}
              className="group bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#bc3a08] hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            >
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-[#bc3a08] transition-colors mb-3" />
              <h3 className="font-medium text-gray-700 group-hover:text-[#bc3a08] transition-colors mb-1">
                Add New Connection
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Connect to MySQL, PostgreSQL, MongoDB, or SQL Server
              </p>
            </div>
          </div>
          )}

          {!loading && databases.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Connected</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {databases.filter(db => db.status === 'connected').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Offline</p>
                  <p className="text-2xl font-semibold text-gray-600">
                    {databases.filter(db => db.status === 'disconnected').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Errors</p>
                  <p className="text-2xl font-semibold text-red-700">
                    {databases.filter(db => db.status === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleDatabaseClick(contextMenu.connection)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Database className="h-4 w-4 mr-2" />
            Open Connection
          </button>
          
          {contextMenu.connection.status === 'connected' ? (
            <button
              onClick={() => handleDisconnect(contextMenu.connection)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => handleReconnect(contextMenu.connection)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Power className="h-4 w-4 mr-2" />
              Reconnect
            </button>
          )}
          
          <button
            onClick={() => console.log('Edit connection:', contextMenu.connection)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Connection
          </button>
          
          <hr className="my-1" />
          
          <button
            onClick={() => handleDeleteConnection(contextMenu.connection)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Connection
          </button>
        </div>
      )}

      <DatabaseConnectionModal
        isOpen={showNewConnectionModal}
        onClose={() => setShowNewConnectionModal(false)}
        onConnect={handleConnectionCreated}
      />
    </div>
  );
}