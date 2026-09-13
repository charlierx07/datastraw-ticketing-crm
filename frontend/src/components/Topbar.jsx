import React from 'react';
import { 
  Search, 
  Menu, 
  Bell, 
  Server, 
  RefreshCw, 
  Plus, 
  ChevronDown,
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
    <header className="sticky top-0 z-30 h-16 bg-slate-950/40 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.06] lg:hidden transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input Field */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets, customers, or anything..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:bg-slate-900/90 transition shadow-inner"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-slate-300">
          <Server className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">API:</span>
          <span className="flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`}></span>
            {serverOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh ticket data"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button 
          title="Notifications"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.9)]" />
        </button>

        <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

        {/* Primary "New Ticket" button in Topbar */}
        <button
          onClick={onOpenCreate}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>

        {/* Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
            AD
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </div>

      </div>

    </header>
  );
};
