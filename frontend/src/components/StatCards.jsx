import React from 'react';
import { Ticket, Inbox, Clock, CheckCircle2 } from 'lucide-react';

export const StatCards = ({ stats, currentFilter, onSelectFilter }) => {
  const cards = [
    {
      key: 'All',
      label: 'Total Tickets',
      count: stats.total,
      icon: Ticket,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-50',
      badge: 'All Inbox',
    },
    {
      key: 'Open',
      label: 'Open Tickets',
      count: stats.open,
      icon: Inbox,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      badge: 'Needs action',
    },
    {
      key: 'In Progress',
      label: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      badge: 'Active work',
    },
    {
      key: 'Closed',
      label: 'Closed Tickets',
      count: stats.closed,
      icon: CheckCircle2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      badge: 'Resolved',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = (currentFilter || 'All') === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onSelectFilter(card.key)}
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-150 bg-white ${
              isSelected 
                ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-xs' 
                : 'border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            {/* Top row: Label & Small Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-md ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Middle: Number */}
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                {card.count}
              </span>
            </div>

            {/* Bottom: Subtle label */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{card.badge}</span>
              {isSelected && (
                <span className="text-blue-600 font-medium">Filtered</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
