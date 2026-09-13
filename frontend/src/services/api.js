const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Standard HTTP error with formatted message
 */
class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Attempt parsing JSON body
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `Request failed (${response.status})`;
      if (typeof data === 'object' && data !== null) {
        if (data.detail) {
          errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        }
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or backend unreachable
    throw new ApiError(
      'Unable to connect to support server. Please check your network or ensure backend is running.',
      0,
      error
    );
  }
}

export const api = {
  getTickets: async (status = '', search = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/tickets${query}`);
  },

  getTicketById: async (ticketId) => {
    return request(`/api/tickets/${encodeURIComponent(ticketId)}`);
  },

  createTicket: async (ticketData) => {
    return request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  updateTicket: async (ticketId, updateData) => {
    return request(`/api/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  triggerAiInsights: async (ticketId) => {
    return request(`/api/tickets/${encodeURIComponent(ticketId)}/ai-insights`, {
      method: 'POST',
    });
  },

  checkHealth: async () => {
    return request('/health');
  },
};
