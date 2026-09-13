import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Mail, Sparkles, Send, 
  AlertCircle, Copy, Check, MessageSquare, RefreshCw,
  ShieldCheck, CheckCircle2
} from 'lucide-react';
import { StatusBadge, PriorityBadge, SentimentBadge } from './Badge';
import { api } from '../services/api';

export const TicketDetail = ({ ticketId, onBack, onTicketUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState(false);

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  // AI Insights state
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [ticketId]);

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(false);
    try {
      await api.updateTicket(ticket.ticket_id, { status: newStatus });
      setStatusSuccessMsg(true);
      setTimeout(() => setStatusSuccessMsg(false), 2500);
      await fetchDetail();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    setNoteError(null);
    try {
      // Use the dedicated POST /notes endpoint or updateTicket
      await api.addNote(ticket.ticket_id, newNoteText.trim());
      setNewNoteText('');
      await fetchDetail();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setNoteError(err.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleRefreshAi = async () => {
    setIsRefreshingAi(true);
    try {
      await api.triggerAiInsights(ticket.ticket_id);
      await fetchDetail();
    } catch (err) {
      console.error('AI refresh error:', err);
    } finally {
      setIsRefreshingAi(false);
    }
  };

  const handleCopyDraft = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleUseDraftAsNote = (text) => {
    setNewNoteText(`Drafted Response:\n"${text}"`);
  };

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-24 bg-white/[0.05] rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-white/[0.05] rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />
          <div className="h-36 bg-white/[0.03] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 text-center shadow-lg">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white mb-1">Ticket Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'The requested ticket could not be loaded.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-white/10 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket List</span>
        </button>
      </div>
    );
  }

  const createdFormatted = new Date(ticket.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedFormatted = new Date(ticket.updated_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/[0.08] shadow-sm transition duration-150 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        {/* Status Switcher Controls */}
        <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
          {['Open', 'In Progress', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              disabled={isUpdatingStatus}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition duration-150 ${
                ticket.status === st
                  ? st === 'Open'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50'
                    : st === 'In Progress'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/50'
                    : 'bg-slate-700/60 text-slate-300 border border-slate-600/60 shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.03]'
              }`}
            >
              {st}
            </button>
          ))}
          {statusSuccessMsg && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-fade-in ml-1.5">
              <Check className="w-3.5 h-3.5" /> Updated
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Ticket Details + Notes / AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Ticket Info & Issue Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Ticket Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-sm p-6 sm:p-7">
            
            {/* Header / ID / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold bg-indigo-950/60 text-cyan-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 shadow-inner">
                  {ticket.ticket_id}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Created: {createdFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Updated: {updatedFormatted}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="py-5">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-5 tracking-tight">
                {ticket.subject}
              </h1>

              {/* Customer Contact Strip */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/[0.06] flex flex-wrap items-center gap-6 mb-6 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {getInitials(ticket.customer_name)}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer</span>
                    <span className="text-sm font-semibold text-white">{ticket.customer_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contact Email</span>
                  <a 
                    href={`mailto:${ticket.customer_email}`} 
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 mt-0.5 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {ticket.customer_email}
                  </a>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Customer Issue Description
                </h3>
                <div className="bg-slate-950/40 rounded-xl p-4 sm:p-5 border border-white/[0.06] text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {ticket.description}
                </div>
              </div>

            </div>

          </div>

          {/* Standout Feature: AI Ticket Intelligence Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900/60 backdrop-blur-xl text-white rounded-2xl shadow-lg p-5 sm:p-6 border border-indigo-500/25 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-indigo-500/20 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Ticket Intelligence
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Assist
                    </span>
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">Automated classification and response assistant</p>
                </div>
              </div>
              <button
                onClick={handleRefreshAi}
                disabled={isRefreshingAi}
                className="text-xs font-medium text-indigo-300 hover:text-white flex items-center gap-1.5 bg-indigo-900/60 hover:bg-indigo-800/80 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAi ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {/* AI Tags */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.08]">
                <span className="text-[10px] text-indigo-300 uppercase block font-semibold mb-1">Category</span>
                <span className="text-xs font-semibold text-white">
                  {ticket.ai_category || 'General Inquiry'}
                </span>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.08]">
                <span className="text-[10px] text-indigo-300 uppercase block font-semibold mb-1">Priority</span>
                <PriorityBadge priority={ticket.ai_priority || 'Medium'} />
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.08]">
                <span className="text-[10px] text-indigo-300 uppercase block font-semibold mb-1">Sentiment</span>
                <SentimentBadge sentiment={ticket.ai_sentiment || 'Neutral'} />
              </div>
            </div>

            {/* Suggested Response */}
            {ticket.ai_suggested_response ? (
              <div className="bg-slate-950/60 rounded-xl p-4 border border-indigo-500/20 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    Suggested Response Draft:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyDraft(ticket.ai_suggested_response)}
                      className="text-[11px] text-indigo-200 hover:text-white flex items-center gap-1 bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 rounded-lg border border-white/[0.06] transition"
                    >
                      {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleUseDraftAsNote(ticket.ai_suggested_response)}
                      className="text-[11px] text-white flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 px-3 py-1 rounded-lg shadow-sm font-semibold transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Use as Note</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-indigo-100 italic leading-relaxed">
                  "{ticket.ai_suggested_response}"
                </p>
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-indigo-300/70">
                AI analysis unavailable for this ticket. Click "Re-analyze" to generate.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Internal Notes Timeline & Add Note */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-sm p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Internal Support Notes</h3>
              </div>
              <span className="bg-white/[0.05] text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-white/[0.06]">
                {ticket.notes ? ticket.notes.length : 0}
              </span>
            </div>

            {/* Add Note Input Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              {noteError && (
                <p className="text-xs text-rose-400 mb-2">{noteError}</p>
              )}
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log internal update, call summary, or customer communication..."
                className="w-full p-3 bg-slate-950/60 border border-white/[0.08] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition resize-none shadow-inner"
              />
              <div className="mt-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes Timeline */}
            <div className="space-y-3">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note) => {
                  const noteDate = new Date(note.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={note.id}
                      className="p-3.5 bg-slate-950/40 rounded-xl border border-white/[0.06] text-xs space-y-1.5 hover:border-white/[0.1] transition"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-indigo-400" />
                          Support Agent
                        </span>
                        <span>{noteDate}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                        {note.note_text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed border-white/[0.06] rounded-xl">
                  <p className="text-xs">No internal notes added yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Use the box above to log updates.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
