import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      errs.subject = 'Subject is required';
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Support Ticket</h2>
            <p className="text-xs text-slate-500">Log a new customer issue in the CRM</p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {createdTicket ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Ticket Created Successfully!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your ticket has been assigned the tracking identifier:
            </p>
            <div className="inline-block px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl font-mono text-indigo-700 font-bold text-lg mb-6">
              {createdTicket.ticket_id}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  const tid = createdTicket.ticket_id;
                  handleResetAndClose();
                  if (onOpenTicketDetail) onOpenTicketDetail(tid);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Open Ticket Details
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.customer_name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white`}
              />
              {errors.customer_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.customer_email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white`}
              />
              {errors.customer_email && (
                <p className="mt-1 text-xs text-rose-600">{errors.customer_email}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. Order has not arrived"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white`}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the customer's problem or request in detail..."
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
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
