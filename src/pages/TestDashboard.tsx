import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Table, 
  RefreshCw, 
  ArrowLeft,
  MoreVertical,
  Loader2,
  Eye,
  Trash2,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

// Mock data as specified with connection status
const mockDB = [
  { name: "CompanyDB", tables: ["Users", "Orders", "Products"], connected: false },
  { name: "SchoolDB", tables: ["Students", "Teachers", "Courses"], connected: true },
  { name: "ShopDB", tables: ["Items", "Cart", "Invoices"], connected: false }
];

const mockTableData: Record<string, any[]> = {
  // CompanyDB tables
  Users: [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" }
  ],
  Orders: [
    { id: 11, orderNo: "A001", amount: 200, customerId: 1 },
    { id: 12, orderNo: "A002", amount: 350, customerId: 2 },
    { id: 13, orderNo: "A003", amount: 125, customerId: 1 }
  ],
  Products: [
    { id: "P1", title: "Laptop", stock: 50, price: 999.99 },
    { id: "P2", title: "Phone", stock: 120, price: 599.99 },
    { id: "P3", title: "Tablet", stock: 75, price: 399.99 }
  ],
  
  // SchoolDB tables
  Students: [
    { id: 1, name: "Alice Wilson", grade: "A", age: 20 },
    { id: 2, name: "Charlie Brown", grade: "B", age: 19 },
    { id: 3, name: "Diana Prince", grade: "A+", age: 21 }
  ],
  Teachers: [
    { id: 1, name: "Prof. Smith", subject: "Mathematics", experience: 10 },
    { id: 2, name: "Dr. Johnson", subject: "Physics", experience: 15 },
    { id: 3, name: "Ms. Davis", subject: "Chemistry", experience: 8 }
  ],
  Courses: [
    { id: 1, name: "Calculus I", credits: 4, teacherId: 1 },
    { id: 2, name: "Physics 101", credits: 3, teacherId: 2 },
    { id: 3, name: "Organic Chemistry", credits: 4, teacherId: 3 }
  ],
  
  // ShopDB tables
  Items: [
    { id: 1, name: "Coffee Mug", category: "Kitchen", price: 12.99 },
    { id: 2, name: "Notebook", category: "Office", price: 8.50 },
    { id: 3, name: "Water Bottle", category: "Sports", price: 15.99 }
  ],
  Cart: [
    { id: 1, itemId: 1, quantity: 2, userId: 1 },
    { id: 2, itemId: 3, quantity: 1, userId: 2 },
    { id: 3, itemId: 2, quantity: 3, userId: 1 }
  ],
  Invoices: [
    { id: 1001, total: 25.98, date: "2024-11-01", userId: 1 },
    { id: 1002, total: 15.99, date: "2024-11-02", userId: 2 },
    { id: 1003, total: 41.47, date: "2024-11-01", userId: 1 }
  ]
};

interface DatabaseItem {
  name: string;
  tables: string[];
  connected: boolean;
}

interface ContextMenu {
  x: number;
  y: number;
  type: 'database' | 'table';
  itemName: string;
  databaseName?: string;
}

const TestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<DatabaseItem[]>(mockDB);
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set(['SchoolDB'])); // SchoolDB starts expanded
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [connectingDatabase, setConnectingDatabase] = useState<string | null>(null);
  const [hoveredDatabase, setHoveredDatabase] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const toggleDatabase = (dbName: string) => {
    const database = databases.find(db => db.name === dbName);
    if (!database?.connected) return; // Only allow expand if connected
    
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(dbName)) {
      newExpanded.delete(dbName);
    } else {
      newExpanded.add(dbName);
    }
    setExpandedDatabases(newExpanded);
  };

  const handleTableClick = (tableName: string, dbName: string) => {
    setSelectedTable(tableName);
    setSelectedDatabase(dbName);
  };

  const handleConnect = async (dbName: string) => {
    setConnectingDatabase(dbName);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update database to connected
    setDatabases(prev => 
      prev.map(db => 
        db.name === dbName 
          ? { ...db, connected: true }
          : db
      )
    );
    
    // Auto-expand the database
    setExpandedDatabases(prev => new Set([...prev, dbName]));
    setConnectingDatabase(null);
  };

  const handleDisconnect = (dbName: string) => {
    setDatabases(prev => 
      prev.map(db => 
        db.name === dbName 
          ? { ...db, connected: false }
          : db
      )
    );
    
    // Collapse the database
    setExpandedDatabases(prev => {
      const newSet = new Set(prev);
      newSet.delete(dbName);
      return newSet;
    });
    
    // Clear selection if it was from this database
    if (selectedDatabase === dbName) {
      setSelectedTable(null);
      setSelectedDatabase(null);
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
    
    switch (action) {
      case 'refresh':
        console.log(`Refreshing ${contextMenu.type}: ${contextMenu.itemName}`);
        break;
      case 'disconnect':
        if (contextMenu.type === 'database') {
          handleDisconnect(contextMenu.itemName);
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

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const renderTableData = () => {
    if (!selectedTable || !mockTableData[selectedTable]) {
      const connectedDatabases = databases.filter(db => db.connected);
      const disconnectedDatabases = databases.filter(db => !db.connected);

      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Table
            </h3>
            <p className="text-gray-600 mb-4">
              Choose a table from the sidebar to view its data
            </p>
            
            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>{connectedDatabases.length} database(s) connected</span>
              </div>
              {disconnectedDatabases.length > 0 && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span>{disconnectedDatabases.length} database(s) disconnected</span>
                </div>
              )}
            </div>
            
            {disconnectedDatabases.length > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Click "Connect" next to database names to explore their tables
              </p>
            )}
          </div>
        </div>
      );
    }

    const data = mockTableData[selectedTable];
    if (!data || data.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Table className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600">
              The selected table contains no data
            </p>
          </div>
        </div>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="flex-1 overflow-hidden">
        {/* Table Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Table className="h-5 w-5 text-[#bc3a08]" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedTable}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    {selectedDatabase} • {data.length} rows
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => {
                // Simulate refresh
                console.log('Refreshing table data...');
              }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead 
              className="sticky top-0 z-10" 
              style={{ backgroundColor: '#bc3a08' }}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td 
                      key={column}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {row[column] !== null && row[column] !== undefined 
                        ? String(row[column]) 
                        : (
                          <span className="text-gray-400 italic">null</span>
                        )
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-white flex">
      {/* Sidebar */}
      <div 
        className="bg-white border-r border-gray-200 flex flex-col"
        style={{ width: '270px' }}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:text-[#bc3a08] hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Database Explorer</h1>
          <p className="text-sm text-gray-500">Mock Data View</p>
        </div>

        {/* Database List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {databases.map((database) => (
              <div key={database.name} className="mb-1">
                {/* Database Item */}
                <div
                  className="relative group"
                  onMouseEnter={() => setHoveredDatabase(database.name)}
                  onMouseLeave={() => setHoveredDatabase(null)}
                >
                  <button
                    onClick={() => toggleDatabase(database.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-all duration-200 hover:bg-gray-100 group"
                    style={{
                      backgroundColor: expandedDatabases.has(database.name) 
                        ? 'rgba(188, 58, 8, 0.12)' 
                        : 'transparent',
                      borderLeft: expandedDatabases.has(database.name) 
                        ? '3px solid #bc3a08' 
                        : '3px solid transparent'
                    }}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="flex items-center space-x-2">
                        {database.connected ? (
                          <Database className="h-4 w-4 text-[#bc3a08]" />
                        ) : (
                          <Database className="h-4 w-4 text-gray-400" />
                        )}
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${database.connected ? 'text-gray-900' : 'text-gray-500'}`}>
                            {database.name}
                          </span>
                          {!database.connected && (
                            <div className="flex items-center mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnect(database.name);
                                }}
                                disabled={connectingDatabase === database.name}
                                className="flex items-center space-x-1 text-xs text-[#bc3a08] hover:text-[#a0340a] disabled:text-gray-400"
                              >
                                {connectingDatabase === database.name ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Connecting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Wifi className="h-3 w-3" />
                                    <span>Connect</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Three dots menu - only show on hover */}
                      {hoveredDatabase === database.name && (
                        <button
                          onClick={(e) => handleContextMenu(e, 'database', database.name)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
                        >
                          <MoreVertical className="h-3 w-3 text-gray-500" />
                        </button>
                      )}
                      
                      {/* Chevron - only show if connected */}
                      {database.connected && (
                        expandedDatabases.has(database.name) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )
                      )}
                    </div>
                  </button>
                </div>

                {/* Tables List - only show if connected and expanded */}
                {database.connected && expandedDatabases.has(database.name) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {database.tables.map((table) => (
                      <div
                        key={table}
                        className="relative group"
                        onMouseEnter={() => setHoveredTable(table)}
                        onMouseLeave={() => setHoveredTable(null)}
                      >
                        <button
                          onClick={() => handleTableClick(table, database.name)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-all duration-200 hover:bg-gray-100"
                          style={{
                            backgroundColor: selectedTable === table 
                              ? 'rgba(188, 58, 8, 0.12)' 
                              : 'transparent',
                            borderLeft: selectedTable === table 
                              ? '3px solid #bc3a08' 
                              : '3px solid transparent',
                            color: selectedTable === table ? '#bc3a08' : '#374151'
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Table className="h-4 w-4" />
                            <span className="text-sm">
                              {table}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Three dots menu - only show on hover */}
                            {hoveredTable === table && (
                              <button
                                onClick={(e) => handleContextMenu(e, 'table', table, database.name)}
                                className="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
                              >
                                <MoreVertical className="h-3 w-3 text-gray-500" />
                              </button>
                            )}
                            
                            <span className="text-xs text-gray-400">
                              {mockTableData[table]?.length || 0}
                            </span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {renderTableData()}
      </div>

      {/* Context Menu */}
      {contextMenu && (
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
                onClick={() => handleContextAction('refresh')}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              
              {databases.find(db => db.name === contextMenu.itemName)?.connected && (
                <button
                  onClick={() => handleContextAction('disconnect')}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              )}
              
              <button
                onClick={() => handleContextAction('settings')}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleContextAction('view-structure')}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Structure</span>
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              
              <button
                onClick={() => handleContextAction('delete-table')}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Table</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestDashboard;
