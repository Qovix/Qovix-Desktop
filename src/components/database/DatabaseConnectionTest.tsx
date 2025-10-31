import React, { useState } from 'react';
import { Button } from '../ui/button';

interface DatabaseTestProps {
  connectionId: string;
}

export const DatabaseConnectionTest: React.FC<DatabaseTestProps> = ({ connectionId }) => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('');

    try {
      const token = localStorage.getItem('qovix_token');
      if (!token) {
        setTestResult('❌ No authentication token found');
        return;
      }

      setTestResult('🔍 Testing API connection...\n');
      
      const statusResponse = await fetch(`http://localhost:8080/api/database/connections/${connectionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statusResponse.ok) {
        setTestResult(prev => prev + '✅ Connection status API works\n');
      } else {
        setTestResult(prev => prev + `❌ Status API failed: ${statusResponse.status}\n`);
      }

      const schemaResponse = await fetch(`http://localhost:8080/api/database/connections/${connectionId}/schema`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        setTestResult(prev => prev + `✅ Schema API works - Found ${schemaData.data?.tables?.length || 0} tables\n`);
        if (schemaData.data?.tables) {
          setTestResult(prev => prev + `📋 Tables: ${schemaData.data.tables.map((t: any) => t.name).join(', ')}\n`);
        }
      } else {
        const errorData = await schemaResponse.json();
        setTestResult(prev => prev + `❌ Schema API failed: ${schemaResponse.status} - ${errorData.message || 'Unknown error'}\n`);
      }

    } catch (error) {
      setTestResult(prev => prev + `💥 Network error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium text-gray-900 mb-2">API Connection Test</h3>
      <p className="text-sm text-gray-600 mb-3">Connection ID: {connectionId}</p>
      
      <Button 
        onClick={testAPI} 
        disabled={loading}
        className="mb-3"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </Button>
      
      {testResult && (
        <pre className="text-xs bg-white p-2 rounded border whitespace-pre-wrap font-mono">
          {testResult}
        </pre>
      )}
    </div>
  );
};