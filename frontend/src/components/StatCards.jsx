import React from 'react';
import { Ticket, Inbox, Clock, CheckCircle2 } from 'lucide-react';

export const StatCards = ({ stats, currentFilter, onSelectFilter }) => {
  const cards = [
    {
      key: 'All',
      label: 'Total Tickets',
      count: stats.total,
      icon: Ticket,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      activeBorder: 'border-indigo-500/80 ring-2 ring-indigo-500/30 bg-slate-900/80 shadow-lg shadow-indigo-950/40',
      badge: 'All Inbox',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      key: 'Open',
      label: 'Open Tickets',
      count: stats.open,
      icon: Inbox,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      activeBorder: 'border-emerald-500/80 ring-2 ring-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-950/40',
      badge: 'Needs Action',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      key: 'In Progress',
      label: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      activeBorder: 'border-amber-500/80 ring-2 ring-amber-500/30 bg-slate-900/80 shadow-lg shadow-amber-950/40',
      badge: 'Investigating',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      key: 'Closed',
      label: 'Closed Tickets',
      count: stats.closed,
      icon: CheckCircle2,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      activeBorder: 'border-purple-500/80 ring-2 ring-purple-500/30 bg-slate-900/80 shadow-lg shadow-purple-950/40',
      badge: 'Resolved',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = (currentFilter || 'All') === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onSelectFilter(card.key)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 group relative overflow-hidden backdrop-blur-xl ${
              isSelected 
                ? card.activeBorder 
                : 'bg-slate-900/50 border-white/[0.08] hover:border-white/[0.18] hover:bg-slate-900/70 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition duration-200`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Big Number */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-400">tickets</span>
            </div>

            {/* Bottom: Status Pill */}
            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.key === 'Open' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {card.badge}
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition">
                {isSelected ? 'Active Filter' : 'Filter by this'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
