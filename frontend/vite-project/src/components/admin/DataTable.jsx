import React from 'react';
import { Search, Loader2, Inbox } from 'lucide-react';
import Pagination from '../common/Pagination.jsx';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  headerActions,
  pagination,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-border shadow-card overflow-hidden ${className}`}>
      {/* Table Toolbar */}
      {(onSearchChange || headerActions) && (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          {onSearchChange ? (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-border rounded-sm text-xs font-medium text-ink focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ) : (
            <div />
          )}

          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100/80 border-b border-border text-ink font-bold uppercase tracking-wider text-[11px]">
              {columns.map((col) => (
                <th key={col.key || col.label} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 opacity-30 stroke-[1.5]" />
                    <p className="font-semibold">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || row._id || idx}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="p-3 border-t border-border flex justify-end">
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
