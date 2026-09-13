import React from 'react';
import { Calendar, Sparkles, Plus } from 'lucide-react';

export const DashboardHeader = ({ onOpenCreate }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      {/* Welcome Title & Date */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, Admin
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Live Desk
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <p>Here’s what’s happening with your customer tickets today.</p>
          <span className="hidden sm:inline text-slate-600">&bull;</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {currentDate}
          </span>
        </div>
      </div>

      {/* Motivational / Action Badge & Quick Button */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/[0.08] text-xs text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-medium text-slate-300">Resolve · Support · Grow</span>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>
    </div>
  );
};
