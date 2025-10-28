import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Plus, Database, Server, Activity, ChevronRight, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import DatabaseConnectionModal, { DatabaseConnectionData } from '../components/database/DatabaseConnectionModal';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
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
  const { goToAuth, goToApp } = useAppNavigation();
  const [databases] = useState<DatabaseConnection[]>(mockDatabases);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);

  const handleLogout = () => {
    logout();
    goToAuth.login(true);
  };

  const handleDatabaseClick = (database: DatabaseConnection) => {
    goToApp.databaseExplorer(database.id);
  };

  const handleNewConnection = () => {
    setShowNewConnectionModal(true);
  };

  const handleConnectionCreated = (connectionData: DatabaseConnectionData) => {
    // TODO: Add the new connection to the list and navigate to explorer
    console.log('New connection created:', connectionData);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
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
      </header>

      <main className="flex-1 p-6">
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
              
              <Button
                onClick={handleNewConnection}
                className="bg-[#bc3a08] hover:bg-[#a0340a] text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Connection
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databases.map((db) => (
              <div
                key={db.id}
                onClick={() => handleDatabaseClick(db)}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
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
        </div>
      </main>

      <DatabaseConnectionModal
        isOpen={showNewConnectionModal}
        onClose={() => setShowNewConnectionModal(false)}
        onConnect={handleConnectionCreated}
      />
    </div>
  );
}