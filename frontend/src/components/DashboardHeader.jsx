import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export const DashboardHeader = ({ onOpenCreate }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      {/* Welcome Title & Date */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Welcome back, Admin
        </h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-0.5">
          <p>Here’s what’s happening with your customer support tickets today.</p>
          <span className="hidden md:inline text-slate-300">&bull;</span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-400 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {currentDate}
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-2xs transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>
      </div>
    </div>
  );
};
