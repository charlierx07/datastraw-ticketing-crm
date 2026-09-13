import React from 'react';
import { StatusBadge } from './Badge';
import { Inbox, AlertCircle, ArrowRight, Calendar, Mail, ChevronRight } from 'lucide-react';

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
  // 1. Loading State (Shimmering Light Rows)
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="space-y-1.5 flex-1 max-w-md">
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center shadow-2xs">
        <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mx-auto mb-3 border border-rose-100">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Failed to load tickets</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty State (Filter matches 0 results)
  if (tickets.length === 0 && hasFilters) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-2xs">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mx-auto mb-3 border border-slate-100">
          <Inbox className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No matching tickets</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          No tickets match your active search query or status filter.
        </p>
        <button
          onClick={onResetFilters}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
        >
          Clear filters
        </button>
      </div>
    );
  }

  // 4. Empty State (Zero tickets in database)
  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-100">
          <Inbox className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No customer tickets yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          The support inbox is empty. Create your first ticket to start tracking customer issues.
        </p>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-2xs transition"
        >
          <span>Create Ticket</span>
          <ArrowRight className="w-3.5 h-3.5" />
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

  // 5. Clean White Table Layout
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      
      {/* Section Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Tickets</h2>
        </div>
        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table Container (Horizontal Scroll on Mobile) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 sm:px-5">Ticket ID</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Subject</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 sm:px-5 text-right">Created</th>
              <th className="py-2.5 px-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
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
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-100 group"
                >
                  {/* Ticket ID */}
                  <td className="py-3 px-4 sm:px-5 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {t.ticket_id}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                        {getInitials(t.customer_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 group-hover:text-slate-900 transition">
                          {t.customer_name}
                        </span>
                        {t.customer_email && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            {t.customer_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-3 px-4 max-w-xs sm:max-w-md">
                    <p className="font-normal text-slate-700 group-hover:text-slate-900 line-clamp-1">
                      {t.subject}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 sm:px-5 text-right whitespace-nowrap text-[11px] text-slate-400">
                    <span>{formattedDate}</span>
                  </td>

                  {/* Action Arrow */}
                  <td className="py-3 px-3 text-right whitespace-nowrap text-slate-400 group-hover:text-slate-600 transition pr-4">
                    <ChevronRight className="w-4 h-4 inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-5 py-2.5 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
        <span className="text-slate-400">Select any ticket to view details & log internal notes</span>
      </div>
    </div>
  );
};
