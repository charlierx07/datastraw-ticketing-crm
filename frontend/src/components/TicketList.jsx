import React from 'react';
import { StatusBadge } from './Badge';
import { Inbox, AlertCircle, ArrowRight, Calendar, User, Mail, ChevronRight } from 'lucide-react';

export const TicketList = ({
  tickets,
  isLoading,
  error,
  onRetry,
  onSelectTicket,
  onOpenCreate,
  hasFilters,
  onResetFilters
}) => {
  // 1. Loading State (Shimmering Frosted Glass Rows)
  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="h-5 w-32 bg-white/[0.05] rounded-lg animate-pulse" />
          <div className="h-5 w-20 bg-white/[0.05] rounded-lg animate-pulse" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-7 w-20 bg-white/[0.05] rounded-lg animate-pulse" />
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/[0.03] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-24 bg-white/[0.05] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Failed to load tickets</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition shadow-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty State (Filter matches 0 results)
  if (tickets.length === 0 && hasFilters) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-10 text-center shadow-sm">
        <div className="w-12 h-12 bg-white/[0.04] text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/[0.06]">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">No matching tickets found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          No tickets match your active search or status filter. Try clearing or adjusting your criteria.
        </p>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline transition"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  // 4. Empty State (Zero tickets in database)
  if (tickets.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-dashed border-white/[0.12] rounded-2xl p-12 text-center">
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-md">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No customer tickets yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
          The support inbox is clear. When a customer reaches out, log their first ticket to track resolution and communication.
        </p>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition duration-150"
        >
          <span>Create First Ticket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Helper to generate initials
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // 5. Normal Table Layout
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
      
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Recent Tickets</h2>
          <p className="text-xs text-slate-400">Manage and monitor all customer inquiries across channels</p>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05]">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table Container (Horizontal Scroll on Mobile) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Ticket ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Created</th>
              <th className="py-3 px-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-xs">
            {tickets.map((t) => {
              const formattedDate = new Date(t.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={t.ticket_id}
                  onClick={() => onSelectTicket(t.ticket_id)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors duration-150 group"
                >
                  {/* Ticket ID */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/40 text-cyan-300 border border-indigo-500/20 group-hover:border-indigo-500/40 transition">
                      {t.ticket_id}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(t.customer_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition">
                          {t.customer_name}
                        </span>
                        {t.customer_email && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-slate-500" />
                            {t.customer_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-4 px-4 max-w-xs sm:max-w-md">
                    <p className="font-medium text-slate-300 group-hover:text-white line-clamp-1 transition">
                      {t.subject}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap text-[11px] text-slate-400">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Action Arrow */}
                  <td className="py-4 px-3 text-right whitespace-nowrap text-slate-500 group-hover:text-indigo-400 transition pr-4">
                    <ChevronRight className="w-4 h-4 inline group-hover:translate-x-0.5 transition-transform" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 bg-white/[0.01] border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
        <span className="text-slate-500">Click any row to open details & log internal notes</span>
      </div>
    </div>
  );
};
