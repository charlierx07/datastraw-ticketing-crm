import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { SearchBar } from './components/SearchBar';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { CreateTicketModal } from './components/CreateTicketModal';
import { api } from './services/api';

export default function App() {
  // Navigation view: 'list' | 'detail'
  const [currentView, setCurrentView] = useState('list');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Data & State
  const [tickets, setTickets] = useState([]);
  const [allTicketsSummary, setAllTicketsSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Check health of backend on mount
  const checkBackendHealth = useCallback(async () => {
    try {
      await api.checkHealth();
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    }
  }, []);

  // Fetch summary of all tickets for KPI cards regardless of active table filter
  const fetchSummary = useCallback(async () => {
    try {
      const data = await api.getTickets();
      setAllTicketsSummary(data);
    } catch (err) {
      console.warn('Could not refresh summary stats:', err);
    }
  }, []);

  // Fetch tickets filtered by current search and status
  const fetchFilteredTickets = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTickets(statusFilter, search);
      setTickets(data);
      setServerOnline(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets from server');
      setServerOnline(false);
    } finally {
      if (!isBackground) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    checkBackendHealth();
    fetchSummary();
  }, [checkBackendHealth, fetchSummary]);

  useEffect(() => {
    fetchFilteredTickets();
  }, [fetchFilteredTickets]);

  // Derived KPI Stats
  const stats = useMemo(() => {
    const total = allTicketsSummary.length;
    const open = allTicketsSummary.filter(t => (t.status || '').toLowerCase() === 'open').length;
    const inProgress = allTicketsSummary.filter(t => (t.status || '').toLowerCase() === 'in progress').length;
    const closed = allTicketsSummary.filter(t => (t.status || '').toLowerCase() === 'closed').length;
    return { total, open, inProgress, closed };
  }, [allTicketsSummary]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkBackendHealth();
    await Promise.all([fetchSummary(), fetchFilteredTickets(true)]);
  };

  const handleTicketCreated = async () => {
    await fetchSummary();
    await fetchFilteredTickets(true);
  };

  const handleTicketUpdated = async () => {
    await fetchSummary();
    await fetchFilteredTickets(true);
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('list');
    setSelectedTicketId(null);
  };

  const hasFilters = Boolean(search || (statusFilter && statusFilter !== 'All'));

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onNavigateHome={handleNavigateHome}
        serverOnline={serverOnline}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'list' ? (
          <div>
            {/* Dashboard Header & KPI Metric Cards */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor customer inquiries, update statuses, and log internal agent notes.
              </p>
            </div>

            {/* Metric KPI Cards */}
            <StatCards
              stats={stats}
              currentFilter={statusFilter}
              onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
            />

            {/* Search and Status Filters */}
            <SearchBar
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              totalMatches={tickets.length}
            />

            {/* Ticket List Table */}
            <TicketList
              tickets={tickets}
              isLoading={isLoading}
              error={error}
              onRetry={handleRefresh}
              onSelectTicket={handleSelectTicket}
              onOpenCreate={() => setIsCreateOpen(true)}
              hasFilters={hasFilters}
              onResetFilters={handleResetFilters}
            />
          </div>
        ) : (
          /* Dedicated Ticket Detail Page */
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={handleNavigateHome}
            onTicketUpdated={handleTicketUpdated}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Datastraw Customer Support CRM &bull; Built with FastAPI, SQLite & React</span>
          <span className="text-slate-400">Production-ready MVP architecture</span>
        </div>
      </footer>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={handleTicketCreated}
        onOpenTicketDetail={(ticketId) => {
          handleSelectTicket(ticketId);
        }}
      />

    </div>
  );
}
