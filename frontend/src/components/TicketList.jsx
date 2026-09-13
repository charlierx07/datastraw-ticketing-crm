import React from 'react';
import { StatusBadge } from './Badge';
import { Inbox, AlertCircle, ArrowRight, Calendar, User, Mail } from 'lucide-react';

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
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to load tickets</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty State (Filter with 0 results)
  if (tickets.length === 0 && hasFilters) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No matching tickets found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          No tickets match your current search and filter settings. Try adjusting or clearing your criteria.
        </p>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  // 4. Empty State (Zero tickets in database)
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No support tickets yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          The support inbox is completely clear. When a customer reaches out, log their first ticket to track resolution.
        </p>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
        >
          <span>Create First Ticket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 5. Normal Table Layout
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Ticket ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
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
                  className="hover:bg-indigo-50/40 cursor-pointer transition group"
                >
                  {/* Ticket ID */}
                  <td className="py-4 px-4 sm:px-6 font-mono font-medium text-xs text-indigo-600 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="group-hover:underline">{t.ticket_id}</span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.customer_name}
                      </span>
                      {t.customer_email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {t.customer_email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-4 px-4 max-w-xs sm:max-w-md">
                    <p className="font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-900 transition">
                      {t.subject}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap text-xs text-slate-500">
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
        <span className="text-slate-400">Click any row to view complete details & notes</span>
      </div>
    </div>
  );
};
