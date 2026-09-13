import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Headphones, 
  X,
  Sparkles
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/70 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.08]">
          <div 
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition duration-200">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">SupportHub CRM</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Customer support workspace</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onOpenCreate();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspace
          </div>

          {/* Dashboard / All Tickets */}
          <button
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
              currentView === 'list'
                ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent text-white border-l-2 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentView === 'list' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </div>
            <span className="text-[10px] font-semibold bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-md">
              Live
            </span>
          </button>

          {/* Tickets View */}
          <button
            onClick={() => {
              onNavigateHome();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
              currentView === 'detail'
                ? 'bg-gradient-to-r from-indigo-500/20 to-transparent text-white border-l-2 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Ticket className={`w-4 h-4 ${currentView === 'detail' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Ticket Manager</span>
          </button>

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform
          </div>

          {/* Analytics (Disabled / Coming Soon) */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-500 cursor-not-allowed opacity-60">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>Analytics</span>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/[0.04] text-slate-500 px-1.5 py-0.5 rounded border border-white/[0.05]">
              Soon
            </span>
          </div>

          {/* Settings (Disabled / Coming Soon) */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-500 cursor-not-allowed opacity-60">
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/[0.04] text-slate-500 px-1.5 py-0.5 rounded border border-white/[0.05]">
              Soon
            </span>
          </div>
        </div>

        {/* Small "Need Help?" Support Card */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/50 border border-indigo-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-indigo-300 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Assist Enabled</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            Automated sentiment, category & reply drafting are active.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-indigo-300/80 font-medium">
            <HelpCircle className="w-3 h-3" />
            <span>Need docs? See walkthrough.md</span>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-semibold text-white block">Admin User</span>
              <span className="text-[10px] text-slate-400">Support Lead</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
