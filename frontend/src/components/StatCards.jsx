import React from 'react';
import { Inbox, Clock, CheckCircle2, Ticket } from 'lucide-react';

export const StatCards = ({ stats, currentFilter, onSelectFilter }) => {
  const cards = [
    {
      key: 'All',
      label: 'Total Tickets',
      count: stats.total,
      icon: Ticket,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      activeBorder: 'border-slate-800 ring-2 ring-slate-400',
    },
    {
      key: 'Open',
      label: 'Open',
      count: stats.open,
      icon: Inbox,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      activeBorder: 'border-amber-500 ring-2 ring-amber-300',
    },
    {
      key: 'In Progress',
      label: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      activeBorder: 'border-blue-500 ring-2 ring-blue-300',
    },
    {
      key: 'Closed',
      label: 'Closed',
      count: stats.closed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = (currentFilter || 'All') === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onSelectFilter(card.key)}
            className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-150 shadow-sm hover:shadow ${
              isSelected ? card.activeBorder : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-400">tickets</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
