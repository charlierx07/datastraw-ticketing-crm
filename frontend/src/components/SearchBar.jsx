import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export const SearchBar = ({ search, onSearchChange, status, onStatusChange, totalMatches }) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce input to avoid firing requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const statuses = ['All', 'Open', 'In Progress', 'Closed'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by customer name, ticket ID (TKT-001), email, or description..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1 hidden lg:flex">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          {statuses.map((s) => {
            const isActive = (status || 'All') === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

      </div>

      {/* Query summary indicator */}
      {(search || (status && status !== 'All')) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing results for {status && status !== 'All' ? `status "${status}"` : 'all statuses'}
            {search ? ` matching "${search}"` : ''}
          </span>
          <button
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
              onStatusChange('All');
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
