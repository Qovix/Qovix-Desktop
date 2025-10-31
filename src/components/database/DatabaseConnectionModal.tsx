import React, { useState } from 'react';
import { X, Database, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { databaseService } from '../../services/databaseService';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connection: DatabaseConnectionData) => void;
}

export interface DatabaseConnectionData {
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  saveConnection: boolean;
  connectionId?: string;
  version?: string;
  schemas?: string[];
}

const databaseTypes = [
  { value: 'sqlserver', label: 'SQL Server', port: '1433', icon: '🏢', available: true },
  { value: 'mysql', label: 'MySQL - Coming Soon', port: '3306', icon: '�', available: false },
  { value: 'postgresql', label: 'PostgreSQL - Coming Soon', port: '5432', icon: '🐘', available: false },
  { value: 'mongodb', label: 'MongoDB - Coming Soon', port: '27017', icon: '�', available: false },
];

export default function DatabaseConnectionModal({ isOpen, onClose, onConnect }: DatabaseConnectionModalProps) {
  const [formData, setFormData] = useState<DatabaseConnectionData>({
    name: '',
    type: 'sqlserver',
    host: 'localhost',
    port: '1433',
    database: '',
    username: '',
    password: '',
    saveConnection: true,
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'testing' | 'success'>('form');

  React.useEffect(() => {
    if (isOpen) {
      setStep('form');
      setError('');
      setIsConnecting(false);
    }
  }, [isOpen]);

  const handleTypeChange = (type: string) => {
    const dbType = databaseTypes.find(db => db.value === type);
    setFormData(prev => ({
      ...prev,
      type: type as DatabaseConnectionData['type'],
      port: dbType?.port || prev.port,
    }));
  };

  const handleInputChange = (field: keyof DatabaseConnectionData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Connection name is required';
    if (!formData.host.trim()) return 'Host is required';
    if (!formData.port.trim()) return 'Port is required';
    if (!formData.database.trim()) return 'Database name is required';
    if (!formData.username.trim()) return 'Username is required';
    return null;
  };

  const handleConnect = async () => {
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    setIsConnecting(true);
    setStep('testing');
    setError('');

    try {
      const token = localStorage.getItem('qovix_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const result = await databaseService.testConnection(formData);

      if (result.status === 'connected') {
        setStep('success');
        setTimeout(() => {
          if (formData.saveConnection) {
            createConnection();
          } else {
            onConnect({
              ...formData,
              connectionId: `temp_${Date.now()}`,
              version: result.version,
              schemas: result.schemas,
            });
            onClose();
            resetForm();
          }
        }, 1500);
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setStep('form');
    } finally {
      setIsConnecting(false);
    }
  };

  const createConnection = async () => {
    try {
      const result = await databaseService.createConnection(formData);

      onConnect({
        ...formData,
        connectionId: result.id,
        version: result.version,
        schemas: result.schemas,
      });
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
      setStep('form');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sqlserver',
      host: 'localhost',
      port: '1433',
      database: '',
      username: '',
      password: '',
      saveConnection: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-[#bc3a08]" />
            <h2 className="text-lg font-semibold text-gray-900">
              New Database Connection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Database Connection"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Database Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {databaseTypes.map((db) => (
                    <button
                      key={db.value}
                      type="button"
                      onClick={() => db.available && handleTypeChange(db.value)}
                      disabled={!db.available}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.type === db.value
                          ? 'border-[#bc3a08] bg-[#bc3a08]/5'
                          : db.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg ${!db.available ? 'grayscale opacity-50' : ''}`}>
                          {db.icon}
                        </span>
                        <span className={`font-medium text-sm ${
                          !db.available ? 'text-gray-400' : ''
                        }`}>
                          {db.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    placeholder="3306"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  value={formData.database}
                  onChange={(e) => handleInputChange('database', e.target.value)}
                  placeholder="my_database"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="root"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveConnection"
                  checked={formData.saveConnection}
                  onChange={(e) => handleInputChange('saveConnection', e.target.checked)}
                  className="rounded border-gray-300 text-[#bc3a08] focus:ring-[#bc3a08]"
                />
                <Label htmlFor="saveConnection" className="text-sm">
                  Save connection for future use
                </Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#bc3a08] hover:bg-[#a0340a]"
                  disabled={isConnecting}
                >
                  Connect
                </Button>
              </div>
            </form>
          )}

          {step === 'testing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc3a08] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Testing Connection
              </h3>
              <p className="text-gray-600">
                Connecting to {formData.host}:{formData.port}...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Connection Successful!
              </h3>
              <p className="text-gray-600">
                Opening database explorer...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}