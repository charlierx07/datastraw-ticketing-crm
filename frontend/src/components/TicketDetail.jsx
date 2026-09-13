import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Mail, Sparkles, Send, 
  AlertCircle, Copy, Check, MessageSquare, RefreshCw,
  User, CheckCircle2
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

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
          <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center shadow-2xs">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Ticket Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'The requested ticket could not be loaded.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tickets</span>
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
    <div className="space-y-5">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tickets</span>
        </button>

        {/* Status Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
          {['Open', 'In Progress', 'Closed'].map((st) => {
            const isCurrent = ticket.status === st;
            return (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={isUpdatingStatus}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  isCurrent
                    ? st === 'Open'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : st === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {st}
              </button>
            );
          })}
          {statusSuccessMsg && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 ml-1.5">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Ticket Details + Notes / AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Main Ticket Info & Secondary AI Assist */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Main Ticket Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 sm:p-6">
            
            {/* Header / ID / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {ticket.ticket_id}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Created: {createdFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Updated: {updatedFormatted}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="pt-4">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 tracking-tight">
                {ticket.subject}
              </h1>

              {/* Customer Contact Strip */}
              <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80 flex flex-wrap items-center gap-5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center">
                    {getInitials(ticket.customer_name)}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer</span>
                    <span className="text-xs font-medium text-slate-800">{ticket.customer_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contact Email</span>
                  <a 
                    href={`mailto:${ticket.customer_email}`} 
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    {ticket.customer_email}
                  </a>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Customer Issue Description
                </h3>
                <div className="bg-white rounded-lg p-4 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {ticket.description}
                </div>
              </div>

            </div>

          </div>

          {/* AI Ticket Intelligence (Visually Secondary & Modest) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 shadow-2xs">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    AI Ticket Intelligence
                    <span className="text-[10px] font-normal text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Optional Assist
                    </span>
                  </h3>
                </div>
              </div>
              <button
                onClick={handleRefreshAi}
                disabled={isRefreshingAi}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingAi ? 'animate-spin text-blue-600' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {/* AI Tags */}
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block font-medium mb-0.5">Category</span>
                <span className="text-xs font-medium text-slate-800">
                  {ticket.ai_category || 'General Inquiry'}
                </span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block font-medium mb-0.5">Priority</span>
                <PriorityBadge priority={ticket.ai_priority || 'Medium'} />
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase block font-medium mb-0.5">Sentiment</span>
                <SentimentBadge sentiment={ticket.ai_sentiment || 'Neutral'} />
              </div>
            </div>

            {/* Suggested Response */}
            {ticket.ai_suggested_response ? (
              <div className="bg-white rounded-lg p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Suggested Response:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyDraft(ticket.ai_suggested_response)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition"
                    >
                      {copiedDraft ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleUseDraftAsNote(ticket.ai_suggested_response)}
                      className="text-[11px] text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-100 font-medium transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Use as Note</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{ticket.ai_suggested_response}"
                </p>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                AI analysis unavailable for this ticket. Click "Re-analyze" to generate.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Internal Notes Timeline & Add Note */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Internal Notes</h3>
              </div>
              <span className="bg-slate-50 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200">
                {ticket.notes ? ticket.notes.length : 0}
              </span>
            </div>

            {/* Notes Activity Timeline */}
            <div className="relative pl-5 mb-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note) => {
                  const noteDate = new Date(note.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={note.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-blue-500 border-2 border-white ring-2 ring-slate-100" />
                      
                      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-medium text-slate-600">Support Agent</span>
                          <span>{noteDate}</span>
                        </div>
                        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                          {note.note_text}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs">No internal notes yet.</p>
                </div>
              )}
            </div>

            {/* Add Note Form at Bottom of Timeline */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100">
              {noteError && (
                <p className="text-xs text-rose-600 mb-2">{noteError}</p>
              )}
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add internal note or call summary..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
