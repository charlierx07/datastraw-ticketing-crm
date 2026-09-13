import React from 'react';
import { 
  Search, 
  Menu, 
  RefreshCw, 
  Plus, 
  X
} from 'lucide-react';

export const Topbar = ({ 
  onToggleSidebar, 
  onOpenCreate, 
  serverOnline, 
  onRefresh, 
  isRefreshing,
  search,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 lg:hidden transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input Field */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets, customers, or ID..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Server Online Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span>{serverOnline ? 'System Online' : 'System Offline'}</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh ticket data"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Primary "New Ticket" button in Topbar */}
        <button
          onClick={onOpenCreate}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-2xs transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center border border-slate-200 select-none">
          AD
        </div>

      </div>

    </header>
  );
};
