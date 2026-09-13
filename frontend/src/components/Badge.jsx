import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  
  if (normalized === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Open
      </span>
    );
  }

  if (normalized === 'in progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-950/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        In Progress
      </span>
    );
  }

  if (normalized === 'closed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/70 text-slate-400 border border-slate-700/60 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
        Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-white/10">
      {status || 'Unknown'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();
  
  if (normalized === 'high') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        High Priority
      </span>
    );
  }
  if (normalized === 'medium') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        Medium Priority
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800/70 text-slate-400 border border-slate-700/60">
      Low Priority
    </span>
  );
};

export const SentimentBadge = ({ sentiment }) => {
  const normalized = (sentiment || '').toLowerCase();
  
  if (normalized === 'negative') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        Negative
      </span>
    );
  }
  if (normalized === 'positive') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        Positive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800/70 text-slate-400 border border-slate-700/60">
      Neutral
    </span>
  );
};
