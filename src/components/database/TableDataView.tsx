import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Plus, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: boolean;
}

interface TableRow {
  [key: string]: any;
}

interface TableDataViewProps {
  tableName: string;
  columns: TableColumn[];
  data: TableRow[];
  totalRows: number;
  onRefresh: () => void;
  onInsertRow: () => void;
  onExportCSV: () => void;
  onEditRow: (row: TableRow, index: number) => void;
  onDeleteRow: (row: TableRow, index: number) => void;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

const TableDataView: React.FC<TableDataViewProps> = ({
  tableName,
  columns,
  data,
  totalRows,
  onRefresh,
  onInsertRow,
  onExportCSV,
  onEditRow,
  onDeleteRow
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: string) => {
    setSortConfig(prevSort => {
      if (prevSort?.field === field && prevSort?.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) {
      return <div className="w-4 h-4" />; 
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  };

  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.toString()}
        </span>
      );
    }
    
    if (column.type.includes('date') || column.type.includes('time')) {
      return <span className="text-blue-600">{new Date(value).toLocaleString()}</span>;
    }
    
    const stringValue = value.toString();
    if (stringValue.length > 50) {
      return (
        <span className="truncate block max-w-xs" title={stringValue}>
          {stringValue.substring(0, 50)}...
        </span>
      );
    }
    
    return stringValue;
  };

  const getColumnTypeColor = (type: string) => {
    if (type.includes('int') || type.includes('number')) return 'text-blue-600';
    if (type.includes('char') || type.includes('text')) return 'text-green-600';
    if (type.includes('date') || type.includes('time')) return 'text-purple-600';
    if (type.includes('bool')) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tableName}</h2>
            <p className="text-sm text-gray-500">
              {sortedData.length.toLocaleString()} of {totalRows.toLocaleString()} rows
              {searchTerm && ` (filtered)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onInsertRow}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Insert Row
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-gray-600 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search in table data..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
            <span>rows</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#bc3a08] focus:ring-[#bc3a08]"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className="px-4 py-3 text-left border-b border-gray-200"
                >
                  <button
                    onClick={() => handleSort(column.name)}
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded p-1 -m-1 group"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">
                          {column.name}
                        </span>
                        {column.primaryKey && (
                          <span className="text-xs text-yellow-600 font-bold">PK</span>
                        )}
                        {column.foreignKey && (
                          <span className="text-xs text-blue-600 font-bold">FK</span>
                        )}
                      </div>
                      <span className={`text-xs ${getColumnTypeColor(column.type)}`}>
                        {column.type} {!column.nullable && '• NOT NULL'}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon(column.name)}
                    </div>
                  </button>
                </th>
              ))}
              <th className="w-12 px-4 py-3 text-left">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  selectedRows.has(index) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={() => handleRowSelect(index)}
                    className="rounded border-gray-300 text-[#bc3a08] focus:ring-[#bc3a08]"
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.name} className="px-4 py-3 text-sm">
                    {formatCellValue(row[column.name], column)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditRow(row, index)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-blue-600"
                      title="Edit row"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(row))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-green-600"
                      title="Copy row"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteRow(row, index)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-red-600"
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No data found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? 'bg-[#bc3a08] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDataView;