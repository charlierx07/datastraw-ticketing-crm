import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, User, Mail, Sparkles, Send, 
  CheckCircle2, AlertCircle, Copy, Check, MessageSquare, RefreshCw
} from 'lucide-react';
import { StatusBadge, PriorityBadge, SentimentBadge } from './Badge';
import { api } from '../services/api';

export const TicketDetail = ({ ticketId, onBack, onTicketUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState('');
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
      setSelectedStatus(data.status);
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
    if (newStatus === ticket.status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(false);
    try {
      await api.updateTicket(ticket.ticket_id, { status: newStatus });
      setSelectedStatus(newStatus);
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
      await api.updateTicket(ticket.ticket_id, { notes: newNoteText.trim() });
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Ticket Not Found</h3>
        <p className="text-sm text-slate-500 mb-4">{error || 'The requested ticket could not be loaded.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
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
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        {/* Status Switcher Controls */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
          {['Open', 'In Progress', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              disabled={isUpdatingStatus}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                ticket.status === st
                  ? st === 'Open'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : st === 'In Progress'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          {statusSuccessMsg && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-fade-in ml-1">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            
            {/* Header / ID / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">
                  {ticket.ticket_id}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created: {createdFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Updated: {updatedFormatted}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="py-4">
              <h1 className="text-xl font-bold text-slate-900 mb-4">{ticket.subject}</h1>

              {/* Customer Contact Strip */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-wrap items-center gap-6 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {ticket.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Customer</span>
                    <span className="text-sm font-semibold text-slate-800">{ticket.customer_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Address</span>
                  <a href={`mailto:${ticket.customer_email}`} className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {ticket.customer_email}
                  </a>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Description
                </h3>
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>

            </div>

          </div>

          {/* Standout Feature: AI Ticket Intelligence Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl shadow-md p-5 border border-indigo-800">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-700/50 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AI Ticket Intelligence
                    <span className="text-[10px] font-semibold uppercase bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded">
                      Assist
                    </span>
                  </h3>
                  <p className="text-[11px] text-indigo-200">Automated classification and response assistant</p>
                </div>
              </div>
              <button
                onClick={handleRefreshAi}
                disabled={isRefreshingAi}
                className="text-xs font-medium text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-800/60 hover:bg-indigo-800 px-2.5 py-1 rounded transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAi ? 'animate-spin' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {/* AI Tags */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase block font-semibold mb-1">Category</span>
                <span className="text-xs font-semibold text-white">
                  {ticket.ai_category || 'General Inquiry'}
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase block font-semibold mb-1">Priority</span>
                <PriorityBadge priority={ticket.ai_priority || 'Medium'} />
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase block font-semibold mb-1">Sentiment</span>
                <SentimentBadge sentiment={ticket.ai_sentiment || 'Neutral'} />
              </div>
            </div>

            {/* Suggested Response */}
            {ticket.ai_suggested_response && (
              <div className="bg-white/10 rounded-lg p-3.5 border border-white/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                    Suggested Response Draft:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyDraft(ticket.ai_suggested_response)}
                      className="text-[11px] text-indigo-200 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded transition"
                    >
                      {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleUseDraftAsNote(ticket.ai_suggested_response)}
                      className="text-[11px] text-indigo-100 hover:text-white flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-2 py-0.5 rounded transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Use as Note</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-indigo-50 italic leading-relaxed">
                  "{ticket.ai_suggested_response}"
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Internal Notes Timeline & Add Note */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-900">Internal Support Notes</h3>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {ticket.notes ? ticket.notes.length : 0}
              </span>
            </div>

            {/* Add Note Input Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              {noteError && (
                <p className="text-xs text-rose-600 mb-2">{noteError}</p>
              )}
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log internal update, call summary, or customer communication..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-sm"
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
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-700">Support Agent</span>
                        <span>{noteDate}</span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {note.note_text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs">No internal notes added yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the box above to log updates.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
