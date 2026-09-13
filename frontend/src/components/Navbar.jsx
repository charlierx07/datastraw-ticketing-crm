import React from 'react';
import { Headphones, Plus, Server, RefreshCw } from 'lucide-react';

export const Navbar = ({ onOpenCreate, onNavigateHome, serverOnline, onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SupportDesk CRM</span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-500">Datastraw Technologies Customer Support</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Server Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend:</span>
              <span className="flex items-center gap-1 font-medium">
                <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {serverOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh ticket data"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* New Ticket Button */}
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
