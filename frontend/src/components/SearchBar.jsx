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
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 mb-6 shadow-sm">
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
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:bg-slate-950/90 transition shadow-inner"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1 hidden lg:flex">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {statuses.map((s) => {
            const isActive = (status || 'All') === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-indigo-400/50 shadow-sm shadow-indigo-950/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
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
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
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
            className="text-indigo-400 hover:text-indigo-300 font-medium underline transition"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
