import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
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
      errs.subject = 'Issue subject is required';
    }
    if (!formData.description.trim()) {
      errs.description = 'Description is required';
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
      setServerError(err.message || 'Failed to create ticket. Please check your inputs and try again.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center p-4 transition-opacity duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl relative animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Create Support Ticket</h2>
            <p className="text-xs text-slate-500 mt-0.5">Intake and log a customer issue</p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {createdTicket ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Ticket Created Successfully</h3>
            <p className="text-xs text-slate-500 mb-4">
              Assigned unique identifier for resolution tracking:
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-blue-700 font-semibold text-base mb-6">
              <span>{createdTicket.ticket_id}</span>
              <button
                type="button"
                onClick={() => handleCopyId(createdTicket.ticket_id)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                title="Copy ticket ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex gap-2.5 justify-center">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Back to List
              </button>
              <button
                type="button"
                onClick={() => {
                  const tid = createdTicket.ticket_id;
                  handleResetAndClose();
                  if (onOpenTicketDetail) onOpenTicketDetail(tid);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs transition"
              >
                Open Ticket Details
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border ${
                  errors.customer_name ? 'border-rose-300 bg-rose-50/20 text-rose-900' : 'border-slate-300 text-slate-900'
                } placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition`}
              />
              {errors.customer_name && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                placeholder="e.g. rahul@example.com"
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border ${
                  errors.customer_email ? 'border-rose-300 bg-rose-50/20 text-rose-900' : 'border-slate-300 text-slate-900'
                } placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition`}
              />
              {errors.customer_email && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.customer_email}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Issue Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. Order #1042 has not arrived"
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border ${
                  errors.subject ? 'border-rose-300 bg-rose-50/20 text-rose-900' : 'border-slate-300 text-slate-900'
                } placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition`}
              />
              {errors.subject && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the issue or customer inquiry..."
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border ${
                  errors.description ? 'border-rose-300 bg-rose-50/20 text-rose-900' : 'border-slate-300 text-slate-900'
                } placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition shadow-2xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Ticket</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
