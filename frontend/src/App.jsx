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
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900 flex relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 font-sans antialiased">
      
      {/* Desktop Fixed & Mobile Drawer Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onOpenCreate={() => setIsCreateOpen(true)}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Area (offset by sidebar width on lg+ screens) */}
      <div className="lg:pl-60 flex flex-col flex-1 min-w-0 min-h-screen">
        
        {/* Minimal Transparent Topbar */}
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenCreate={() => setIsCreateOpen(true)}
          serverOnline={serverOnline}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Main Workspace Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {currentView === 'list' ? (
            <div>
              {/* Compact Dashboard Welcome Header */}
              <DashboardHeader onOpenCreate={() => setIsCreateOpen(true)} />

              {/* Minimal KPI Metric Cards */}
              <StatCards
                stats={stats}
                currentFilter={statusFilter}
                onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
              />

              {/* Clean Search and Filter Toolbar */}
              <SearchBar
                search={search}
                onSearchChange={setSearch}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                totalMatches={tickets.length}
              />

              {/* Main Ticket Table */}
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

        {/* Minimal Clean Footer */}
        <footer className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">SupportHub CRM</span>
              <span className="text-slate-300">&bull;</span>
              <span>FastAPI &bull; SQLite &bull; React</span>
            </div>
            <span className="text-slate-400">Minimal SaaS workspace architecture</span>
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
