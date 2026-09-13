import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

export const CreateTicketModal = ({ isOpen, onClose, onTicketCreated, onOpenTicketDetail }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.customer_name.trim()) {
      errs.customer_name = 'Customer name is required';
    }
    if (!formData.customer_email.trim()) {
      errs.customer_email = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email.trim())) {
        errs.customer_email = 'Please enter a valid email address';
      }
    }
    if (!formData.subject.trim()) {
      errs.subject = 'Issue title / subject is required';
    }
    if (!formData.description.trim()) {
      errs.description = 'Issue description is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await api.createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      setCreatedTicket(result);
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      setServerError(err.message || 'Failed to create ticket. Please verify your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setFormData({ customer_name: '', customer_email: '', subject: '', description: '' });
    setErrors({});
    setServerError(null);
    setCreatedTicket(null);
    setCopiedId(false);
    onClose();
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-200">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Subtle Ambient Radial Glow inside modal */}
        <div className="w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl absolute -top-20 -right-20 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create Support Ticket</h2>
              <p className="text-xs text-slate-400">Intake a customer issue and track resolution</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {createdTicket ? (
          <div className="py-8 text-center relative z-10">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Ticket Created Successfully</h3>
            <p className="text-xs text-slate-400 mb-5">
              Assigned unique identifier for tracking & resolution:
            </p>
            
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl font-mono text-cyan-300 font-bold text-xl mb-7 shadow-inner">
              <span>{createdTicket.ticket_id}</span>
              <button
                type="button"
                onClick={() => handleCopyId(createdTicket.ticket_id)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Copy ticket ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  const tid = createdTicket.ticket_id;
                  handleResetAndClose();
                  if (onOpenTicketDetail) onOpenTicketDetail(tid);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition duration-150"
              >
                Open Ticket Details
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
            
            {serverError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950/60 border ${
                  errors.customer_name ? 'border-rose-500/60 bg-rose-950/20 text-rose-100' : 'border-white/[0.08] text-white'
                } placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition`}
              />
              {errors.customer_name && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Customer Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950/60 border ${
                  errors.customer_email ? 'border-rose-500/60 bg-rose-950/20 text-rose-100' : 'border-white/[0.08] text-white'
                } placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition`}
              />
              {errors.customer_email && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.customer_email}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject / Issue Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. Order has not arrived"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950/60 border ${
                  errors.subject ? 'border-rose-500/60 bg-rose-950/20 text-rose-100' : 'border-white/[0.08] text-white'
                } placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition`}
              />
              {errors.subject && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {formData.description.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the customer's problem or request in detail..."
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950/60 border ${
                  errors.description ? 'border-rose-500/60 bg-rose-950/20 text-rose-100' : 'border-white/[0.08] text-white'
                } placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 active:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating ticket...</span>
                  </>
                ) : (
                  <span>Submit Ticket</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
