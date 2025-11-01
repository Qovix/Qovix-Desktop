import React, { useState } from 'react';
import { Button } from '../ui/button';
import { aiService } from '../../services/aiService';
import { databaseService } from '../../services/databaseService';
import { Brain, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Example component showing AI integration
const AIIntegrationExample: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock database connection for example
  const mockDatabase = {
    id: 'conn_example123',
    name: 'ShoppeStore',
    type: 'sqlserver' as const
  };

  const handleGenerateSQL = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Generate SQL using AI service
      const response = await aiService.generateSQL({
        database: mockDatabase.name,
        tables: ['users', 'orders', 'products'], // You could get these from schema
        query: query,
        connection_id: mockDatabase.id,
        save_history: true
      });

      setResult(response);

      // If query is valid, you could also execute it
      if (response.is_valid && response.sql_query) {
        // Example of executing the query (commented out for demo)
        // const queryResult = await databaseService.executeQuery(
        //   mockDatabase.id, 
        //   response.sql_query, 
        //   100
        // );
        // console.log('Query result:', queryResult);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SQL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSQL = async (sqlQuery: string) => {
    try {
      const validation = await aiService.validateSQL({ sql_query: sqlQuery });
      console.log('Validation result:', validation);
      return validation;
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const handleExplainSQL = async (sqlQuery: string) => {
    try {
      const explanation = await aiService.explainSQL({ sql_query: sqlQuery });
      console.log('Explanation:', explanation);
      return explanation;
    } catch (err) {
      console.error('Explanation failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-[#bc3a08]" />
          AI SQL Assistant Integration Example
        </h2>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Natural Language Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me all users who made orders in the last month"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bc3a08] focus:border-transparent"
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateSQL}
            disabled={!query.trim() || isLoading}
            className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating SQL...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate SQL Query
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <XCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Validation Status */}
            <div className={`flex items-center p-3 rounded-lg ${
              result.is_valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.is_valid ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">Valid SQL Query</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-red-700 font-medium">SQL Validation Issues</span>
                </>
              )}
              
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Generated SQL */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Generated SQL Query</span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(result.sql_query)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    Copy
                  </Button>
                  {result.is_valid && (
                    <Button
                      size="sm"
                      onClick={() => handleValidateSQL(result.sql_query)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Validate
                    </Button>
                  )}
                </div>
              </div>
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {result.sql_query}
              </pre>
            </div>

            {/* Explanation */}
            {result.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Query Explanation</h3>
                <p className="text-blue-800">{result.explanation}</p>
              </div>
            )}

            {/* Validation Errors */}
            {result.validation_errors && result.validation_errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Validation Issues</h3>
                <ul className="text-red-800 space-y-1">
                  {result.validation_errors.map((error: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <Button
                onClick={() => handleExplainSQL(result.sql_query)}
                variant="outline"
                size="sm"
              >
                Explain Query
              </Button>
              
              <Button
                onClick={() => handleValidateSQL(result.sql_query)}
                variant="outline"
                size="sm"
              >
                Re-validate
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Integration Features</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">✅ Implemented</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Natural language to SQL conversion</li>
              <li>• SQL validation and safety checks</li>
              <li>• Query explanation generation</li>
              <li>• Schema-aware query generation</li>
              <li>• Real-time AI assistant chat</li>
              <li>• Query history tracking</li>
              <li>• Error handling and user feedback</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">🔧 Usage</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Integrated in DatabaseExplorer</li>
              <li>• Available in QueryConsole</li>
              <li>• Automatic table detection</li>
              <li>• Connection-aware context</li>
              <li>• Professional UI/UX</li>
              <li>• TypeScript type safety</li>
              <li>• Scalable architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntegrationExample;