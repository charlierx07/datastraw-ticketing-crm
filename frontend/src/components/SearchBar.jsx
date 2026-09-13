import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export const SearchBar = ({ search, onSearchChange, status, onStatusChange, totalMatches }) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Synchronize local search if parent search changes (e.g. from topbar or reset)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce input to avoid firing requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const statuses = ['All', 'Open', 'In Progress', 'Closed'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs mb-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by customer name, ticket ID, email, or issue description..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 md:pb-0">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mr-1 hidden lg:flex">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {statuses.map((s) => {
            const isActive = (status || 'All') === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3 py-1 rounded-lg text-xs transition duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

      </div>

      {/* Active filter summary & reset indicator */}
      {(search || (status && status !== 'All')) && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Filtering {status && status !== 'All' ? `status "${status}"` : 'all tickets'}
            {search ? ` matching "${search}"` : ''} ({totalMatches} match{totalMatches !== 1 ? 'es' : ''})
          </span>
          <button
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
              onStatusChange('All');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs transition"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
