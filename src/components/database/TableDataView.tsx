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
import { Button, Input } from '../ui';

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
      <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-white">
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

      {/* Table Section - Scrollable */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}>
          <div style={{ minWidth: 'fit-content' }}>
            <table style={{ borderCollapse: 'collapse', width: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ 
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: 30,
                    backgroundColor: '#f9fafb',
                    padding: 12,
                    textAlign: 'left',
                    borderBottom: '1px solid #e5e7eb',
                    borderRight: '1px solid #e5e7eb',
                    minWidth: 48
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      style={{ borderRadius: 4 }}
                    />
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.name}
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 20,
                        padding: 12,
                        textAlign: 'left',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        minWidth: 150,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <button
                        onClick={() => handleSort(column.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: 4,
                          margin: -4,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                              {column.name}
                            </span>
                            {column.primaryKey && (
                              <span style={{ fontSize: 11, color: '#ca8a04', fontWeight: 700 }}>PK</span>
                            )}
                            {column.foreignKey && (
                              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>FK</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: getColumnTypeColor(column.type) }}>
                            {column.type} {!column.nullable && '• NOT NULL'}
                          </span>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {getSortIcon(column.name)}
                        </div>
                      </button>
                    </th>
                  ))}
                  <th style={{
                    position: 'sticky',
                    top: 0,
                    right: 0,
                    zIndex: 30,
                    backgroundColor: '#f9fafb',
                    padding: 12,
                    textAlign: 'left',
                    borderBottom: '1px solid #e5e7eb',
                    borderLeft: '1px solid #e5e7eb',
                    minWidth: 100
                  }}>
                    <MoreHorizontal style={{ width: 16, height: 16, color: '#9ca3af' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: selectedRows.has(index) ? '#eff6ff' : 'white'
                    }}
                  >
                    <td style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      backgroundColor: selectedRows.has(index) ? '#eff6ff' : 'white',
                      padding: 12,
                      borderRight: '1px solid #f3f4f6'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleRowSelect(index)}
                        style={{ borderRadius: 4 }}
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.name} style={{ padding: 12, fontSize: 14, whiteSpace: 'nowrap' }}>
                        {formatCellValue(row[column.name], column)}
                      </td>
                    ))}
                    <td style={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 10,
                      backgroundColor: selectedRows.has(index) ? '#eff6ff' : 'white',
                      padding: 12,
                      borderLeft: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => onEditRow(row, index)}
                          style={{ padding: 4, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', color: '#4b5563' }}
                          title="Edit row"
                        >
                          <Edit style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(row))}
                          style={{ padding: 4, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', color: '#4b5563' }}
                          title="Copy row"
                        >
                          <Copy style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() => onDeleteRow(row, index)}
                          style={{ padding: 4, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', color: '#4b5563' }}
                          title="Delete row"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {paginatedData.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div style={{ textAlign: 'center' }}>
              <Search style={{ width: 32, height: 32, color: '#d1d5db', margin: '0 auto 8px' }} />
              <p style={{ color: '#6b7280', margin: 0 }}>No data found</p>
              {searchTerm && (
                <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                  Try adjusting your search terms
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Fixed */}
      {totalPages > 1 && (
        <div style={{ flexShrink: 0, borderTop: '1px solid #e5e7eb', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white' }}>
          <div style={{ fontSize: 14, color: '#4b5563' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft style={{ width: 16, height: 16, marginRight: 4 }} />
              Previous
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 14,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: currentPage === page ? '#2563eb' : 'transparent',
                      color: currentPage === page ? 'white' : '#4b5563'
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center' }}
            >
              Next
              <ChevronRight style={{ width: 16, height: 16, marginLeft: 4 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDataView;