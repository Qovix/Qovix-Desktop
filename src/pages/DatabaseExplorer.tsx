import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Eye, 
  Terminal,
  Brain,
  Trash2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Server,
  ArrowLeft,
  Settings,
  Search,
  Folder,
  FolderOpen
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import TableDataView from '../components/database/TableDataView';
import AIQueryAssistant from '../components/database/AIQueryAssistant';
import { useTabContext } from '../context/TabContext';

interface DatabaseTable {
  name: string;
  type: 'table' | 'view';
  rowCount?: number;
}

interface DatabaseSchema {
  name: string;
  tables: DatabaseTable[];
  views: DatabaseTable[];
  procedures?: string[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  target: {
    type: 'database' | 'table' | 'view' | 'procedure';
    name: string;
  };
  onClose: () => void;
  onAction: (action: string, target: any) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, target, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = {
    database: [
      { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
      { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
      { icon: Settings, label: 'Connection Settings', action: 'settings' },
      { icon: Server, label: 'Disconnect', action: 'disconnect' },
    ],
    table: [
      { icon: Eye, label: 'View Data', action: 'view-data' },
      { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
      { icon: Brain, label: 'Ask AI about Table', action: 'ask-ai' },
      { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
      { icon: Trash2, label: 'Delete Table', action: 'delete', danger: true },
    ],
    view: [
      { icon: Eye, label: 'View Data', action: 'view-data' },
      { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
      { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
    ],
    procedure: [
      { icon: Terminal, label: 'Execute Procedure', action: 'execute' },
      { icon: Eye, label: 'View Definition', action: 'view-definition' },
    ]
  } as const;

  const items = menuItems[target.type] || [];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isDanger = 'danger' in item && item.danger;
        return (
          <button
            key={index}
            onClick={() => {
              onAction(item.action, target);
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
              isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface DatabaseExplorerProps {
  database: {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
  };
  onBack: () => void;
}

export default function DatabaseExplorer({ database, onBack }: DatabaseExplorerProps) {
  const { openTab } = useTabContext();
  const [schema, setSchema] = useState<DatabaseSchema>({
    name: database.name,
    tables: [
      { name: 'users', type: 'table', rowCount: 1250 },
      { name: 'orders', type: 'table', rowCount: 5800 },
      { name: 'products', type: 'table', rowCount: 340 },
      { name: 'categories', type: 'table', rowCount: 25 },
      { name: 'order_items', type: 'table', rowCount: 12400 },
      { name: 'payments', type: 'table', rowCount: 4200 },
    ],
    views: [
      { name: 'user_orders_summary', type: 'view' },
      { name: 'product_sales_stats', type: 'view' },
    ],
    procedures: ['calculate_monthly_revenue', 'update_inventory', 'process_refund']
  });

  const [expandedSections, setExpandedSections] = useState({
    tables: true,
    views: false,
    procedures: false,
  });

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    target: any;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleRightClick = (event: React.MouseEvent, type: string, name: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      target: { type, name }
    });
  };

  const handleContextAction = (action: string, target: any) => {
    console.log('Context action:', action, 'on', target);
  };

  const handleRunQuery = (query: string) => {
    console.log('Running query:', query);
  };

  const TableDataViewWrapper: React.FC<{ selectedTable: string }> = ({ selectedTable }) => {
    const mockColumns = [
      { name: 'id', type: 'int', nullable: false, primaryKey: true },
      { name: 'name', type: 'varchar(255)', nullable: false },
      { name: 'email', type: 'varchar(255)', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
      { name: 'created_at', type: 'timestamp', nullable: false },
    ];

    const mockData = Array.from({ length: 65 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,

      des:'sfsdf',
      ordreId:'ssdf',
      vffd:"df",
      df:'df',
      dfgd:'dg',
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
    }));

    return (
      <TableDataView
        tableName={selectedTable}
        columns={mockColumns}
        data={mockData}
        totalRows={1250}
        onRefresh={() => console.log('Refresh table')}
        onInsertRow={() => console.log('Insert row')}
        onExportCSV={() => console.log('Export CSV')}
        onEditRow={(row, index) => console.log('Edit row', row, index)}
        onDeleteRow={(row, index) => console.log('Delete row', row, index)}
      />
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredViews = schema.views.filter(view =>
    view.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProcedures = schema.procedures?.filter(proc =>
    proc.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Database Explorer Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-[#bc3a08]" />
            <div>
              <h1 className="font-semibold text-gray-900">{database.name}</h1>
              <p className="text-xs text-gray-500">
                {database.type} • {database.host}:{database.port}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              onClick={() => openTab({
                id: `console-${database.id}`,
                type: 'query-console',
                title: `Console: ${database.name}`,
                data: {
                  database: database,
                  initialQuery: ''
                }
              })}
              size="sm"
              className="bg-[#bc3a08] hover:bg-[#a0340a] text-white"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Query Console
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tables, views..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
              onContextMenu={(e) => handleRightClick(e, 'database', database.name)}
            >
              <Database className="h-4 w-4 text-[#bc3a08]" />
              <span className="font-medium text-gray-900">{database.name}</span>
            </div>

            <div>
              <button
                onClick={() => toggleSection('tables')}
                className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
              >
                {expandedSections.tables ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <Folder className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Tables ({filteredTables.length})
                </span>
              </button>

              {expandedSections.tables && (
                <div className="ml-6 space-y-1">
                  {filteredTables.map((table) => (
                    <div
                      key={table.name}
                      className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer ${
                        selectedItem === table.name ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedItem(table.name)}
                      onContextMenu={(e) => handleRightClick(e, 'table', table.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <Table className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{table.name}</span>
                      </div>
                      {table.rowCount && (
                        <span className="text-xs text-gray-400">
                          {table.rowCount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection('views')}
                className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
              >
                {expandedSections.views ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <FolderOpen className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Views ({filteredViews.length})
                </span>
              </button>

              {expandedSections.views && (
                <div className="ml-6 space-y-1">
                  {filteredViews.map((view) => (
                    <div
                      key={view.name}
                      className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                        selectedItem === view.name ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedItem(view.name)}
                      onContextMenu={(e) => handleRightClick(e, 'view', view.name)}
                    >
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">{view.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {schema.procedures && schema.procedures.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('procedures')}
                  className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 text-left"
                >
                  {expandedSections.procedures ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <Folder className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Procedures ({filteredProcedures.length})
                  </span>
                </button>

                {expandedSections.procedures && (
                  <div className="ml-6 space-y-1">
                    {filteredProcedures.map((procedure) => (
                      <div
                        key={procedure}
                        className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                          selectedItem === procedure ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedItem(procedure)}
                        onContextMenu={(e) => handleRightClick(e, 'procedure', procedure)}
                      >
                        <Terminal className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-700">{procedure}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex">
          <div className={`flex-1 flex flex-col ${isAIOpen ? 'mr-0' : ''}`}>
            {selectedItem ? (
              <TableDataViewWrapper selectedTable={selectedItem} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Table or View
                  </h3>
                  <p className="text-gray-600">
                    Choose an item from the sidebar to view its data
                  </p>
                </div>
              </div>
            )}
          </div>

          <AIQueryAssistant
            isOpen={isAIOpen}
            onToggle={() => setIsAIOpen(!isAIOpen)}
            database={database}
            selectedTable={selectedItem || undefined}
            onRunQuery={handleRunQuery}
            className={isAIOpen ? 'w-96' : 'fixed right-4 top-1/2 transform -translate-y-1/2 z-10'}
          />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  );
}