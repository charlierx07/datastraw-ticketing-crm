import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardHeader } from './components/DashboardHeader';
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

  // Mobile sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    const open = allTicketsSummary.filter((t) => (t.status || '').toLowerCase() === 'open').length;
    const inProgress = allTicketsSummary.filter((t) => (t.status || '').toLowerCase() === 'in progress').length;
    const closed = allTicketsSummary.filter((t) => (t.status || '').toLowerCase() === 'closed').length;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans antialiased">
      
      {/* Ambient Radial Mesh Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Desktop Fixed & Mobile Drawer Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onOpenCreate={() => setIsCreateOpen(true)}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Area (offset by sidebar width on lg+ screens) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen relative z-10">
        
        {/* Glassmorphic Sticky Top Navigation Bar */}
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenCreate={() => setIsCreateOpen(true)}
          serverOnline={serverOnline}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Main Workspace View Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'list' ? (
            <div>
              {/* Welcome Banner */}
              <DashboardHeader onOpenCreate={() => setIsCreateOpen(true)} />

              {/* KPI Metric Cards */}
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

        {/* Dark Frosted Glass Footer */}
        <footer className="border-t border-white/[0.08] bg-slate-950/40 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">SupportHub CRM</span>
              <span className="text-slate-600">&bull;</span>
              <span>FastAPI + SQLite + React</span>
            </div>
            <span className="text-slate-500">Production-ready MVP architecture for Datastraw Evaluation</span>
          </div>
        </footer>

      </div>

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
