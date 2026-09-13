import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  X,
  Headphones
} from 'lucide-react';

export const Sidebar = ({ 
  currentView, 
  onNavigateHome, 
  onOpenCreate, 
  isOpen, 
  onCloseMobile 
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div 
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight block">SupportHub</span>
              <p className="text-[11px] text-slate-400 font-normal">Customer support workspace</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3.5">
          <button
            onClick={() => {
              onOpenCreate();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition duration-150"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          {/* Dashboard */}
          <button
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition duration-150 ${
              currentView === 'list'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentView === 'list' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Tickets View */}
          <button
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition duration-150 ${
              currentView === 'detail'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Ticket className={`w-4 h-4 ${currentView === 'detail' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tickets</span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center border border-slate-200">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-medium text-slate-800 block">Admin User</span>
              <span className="text-[11px] text-slate-400">Support Lead</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
