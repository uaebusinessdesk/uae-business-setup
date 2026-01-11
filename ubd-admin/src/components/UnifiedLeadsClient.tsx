'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getNextAction, type LeadWorkflowData } from '@/lib/leadWorkflow';

interface UnifiedLead {
  id: string;
  leadType: 'Lead';
  name: string;
  contact: string;
  email: string | null;
  service: string;
  serviceRaw?: string; // Raw value for filtering (setupType)
  setupType?: string | null; // For workflow detection
  status: string;
  assignedAgentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Workflow fields
  agentContactedAt?: Date | null;
  feasible?: boolean | null;
  quotedAmountAed?: number | null;
  companyQuoteSentAt?: Date | null;
  quoteViewedAt?: Date | null;
  proceedConfirmedAt?: Date | null;
  quoteApprovedAt?: Date | null;
  approved?: boolean | null;
  quoteDeclinedAt?: Date | null;
  companyInvoiceSentAt?: Date | null;
  companyPaymentLink?: string | null;
  paymentReceivedAt?: Date | null;
  companyCompletedAt?: Date | null;
  declinedAt?: Date | null;
  declineStage?: string | null;
  needsBankAccount?: boolean | null;
  bankQuotedAmountAed?: number | null;
  bankQuoteSentAt?: Date | null;
  bankPaymentLink?: string | null;
  bankApproved?: boolean | null;
  bankPaymentReceivedAt?: Date | null;
  bankCompletedAt?: Date | null;
  companyInvoiceNumber?: string | null;
  bankInvoiceNumber?: string | null;
}

interface UnifiedLeadsClientProps {
  leads: UnifiedLead[];
  initialSearchParams: {
    q: string;
    setupType: string;
    status: string;
    assigned: string;
    sort: string;
  };
  agents: Array<{ id: string; name: string }>;
}

export default function UnifiedLeadsClient({ leads, initialSearchParams, agents }: UnifiedLeadsClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [cronStatus, setCronStatus] = useState<{ ranAt: Date; processed: number | null; sent: number | null; skipped: number | null } | null | 'none'>('none');
  const searchParams = useSearchParams();
  
  // Get current values from URL params
  const currentQ = searchParams.get('q') || '';
  const currentSetupType = searchParams.get('setupType') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentAssigned = searchParams.get('assigned') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  
  // Local state for form inputs
  const [q, setQ] = useState(currentQ);
  
  // Sync search input with URL when URL changes
  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  // Fetch cron status on page load
  useEffect(() => {
    fetch('/api/admin/cron/status', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          if (data.lastRun) {
            setCronStatus({
              ranAt: new Date(data.lastRun.ranAt),
              processed: data.lastRun.processed,
              sent: data.lastRun.sent,
              skipped: data.lastRun.skipped,
            });
          } else {
            setCronStatus(null);
          }
        }
      })
      .catch(() => {
        // Fail silently - keep state as 'none' so nothing is displayed
      });
  }, []);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (currentSetupType && currentSetupType !== 'all') params.set('setupType', currentSetupType);
    if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);
    if (currentAssigned && currentAssigned !== 'all') params.set('assigned', currentAssigned);
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
    const newUrl = params.toString() ? `/admin/leads?${params.toString()}` : '/admin/leads';
    window.location.href = newUrl;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleFilterChange = (filter: string, value: string) => {
    const params = new URLSearchParams();
    
    const newQ = currentQ;
    let newSetupType = filter === 'setupType' ? value : currentSetupType;
    const newStatus = filter === 'status' ? value : currentStatus;
    const newAssigned = filter === 'assigned' ? value : currentAssigned;
    const newSort = filter === 'sort' ? value : currentSort;
    
    // Map display names back to raw values for filtering
    if (filter === 'setupType' && value !== 'all') {
      newSetupType = displayToRawWebsite[value] || value;
    }
    
    if (newQ) params.set('q', newQ);
    if (newSetupType && newSetupType !== 'all') params.set('setupType', newSetupType);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newAssigned && newAssigned !== 'all') params.set('assigned', newAssigned);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    
    const newUrl = params.toString() ? `/admin/leads?${params.toString()}` : '/admin/leads';
    window.location.href = newUrl;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold',
      'Agent Contacted': 'bg-yellow-50 text-yellow-700 border border-yellow-300 font-semibold',
      'Quoted': 'bg-purple-50 text-purple-700 border border-purple-300 font-semibold',
      'Approved': 'bg-green-50 text-green-700 border border-green-300 font-semibold',
      'Awaiting Customer Approval': 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold',
      'Declined': 'bg-red-50 text-red-700 border border-red-300 font-semibold',
      'Completed': 'bg-teal-50 text-teal-700 border border-teal-300 font-semibold',
      'Incomplete': 'bg-gray-50 text-gray-700 border border-gray-300 font-semibold',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-300 font-semibold';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNextActionForLead = (lead: UnifiedLead): string => {
    return getNextAction(lead as LeadWorkflowData, lead.leadType);
  };

  const getAgentName = (agentId: string | null | undefined) => {
    if (!agentId || agentId === 'unassigned' || agentId === 'null' || agentId.trim() === '') {
      return 'No agent assigned';
    }
    const agent = agents.find(a => a.id === agentId);
    if (agent) return agent.name;
    // Fallback for legacy agent IDs
    if (agentId === 'athar') return 'Athar';
    if (agentId === 'anoop') return 'Anoop';
    if (agentId === 'self') return 'Zahed';
    // If agentId doesn't match any known agent, show as unassigned
    return 'No agent assigned';
  };

  const getDetailUrl = (lead: UnifiedLead) => {
    return `/admin/leads/${lead.id}`;
  };

  const handleDelete = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation
    
    if (deleteConfirm !== leadId) {
      setDeleteConfirm(leadId);
      return;
    }

    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      setDeleteConfirm(null);
      return;
    }

    setDeletingId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        cache: 'no-store',
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to update the list
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete lead: ${error.error || 'Unknown error'}`);
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
      setDeleteConfirm(null);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select at least one lead to delete');
      return;
    }

    const count = selectedLeads.size;
    if (!confirm(`Are you sure you want to delete ${count} lead${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const response = await fetch('/api/leads/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully deleted ${data.deletedCount} lead${data.deletedCount > 1 ? 's' : ''}`);
        setSelectedLeads(new Set());
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete leads: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      alert('Failed to delete leads');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Map display names to raw values for filtering
  const displayToRawWebsite: Record<string, string> = {
    'Mainland Company Setup': 'mainland',
    'Free Zone Company Setup': 'freezone',
    'Offshore Company Setup': 'offshore',
    'Bank Account Setup': 'bank',
    'Not Sure': 'not_sure',
  };
  
  // Get unique services for dropdown (use display names)
  const websiteServices = Array.from(new Set(leads.map(l => l.service)));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f3' }}>
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Leads</h1>
              <p className="text-sm text-gray-600">Manage and track all leads from website</p>
            </div>
            <Link
              href="/admin/leads/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Lead
            </Link>
          </div>

          {/* Cron Status */}
          {cronStatus !== 'none' && (
            <div className="mb-4 text-xs text-gray-500">
              Auto payment reminders:{' '}
              {cronStatus ? (
                <>Last run: {formatDate(cronStatus.ranAt)} • Sent: {cronStatus.sent ?? 0} • Skipped: {cronStatus.skipped ?? 0}</>
              ) : (
                <>No runs yet</>
              )}
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search Bar */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search (Name, WhatsApp, Email)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(e);
                        }
                      }}
                      placeholder="Search leads..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {currentQ && (
                    <button
                      type="button"
                      onClick={() => {
                        setQ('');
                        const params = new URLSearchParams();
                        if (currentSetupType && currentSetupType !== 'all') params.set('setupType', currentSetupType);
                        if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);
                        if (currentAssigned && currentAssigned !== 'all') params.set('assigned', currentAssigned);
                        if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
                        const newUrl = params.toString() ? `/admin/leads?${params.toString()}` : '/admin/leads';
                        window.location.href = newUrl;
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Service Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
                    <select
                      value={(() => {
                        // Map raw value back to display name for selected option
                        if (currentSetupType === 'all') return 'all';
                        const reverseMap: Record<string, string> = {
                          'mainland': 'Mainland Company Setup',
                          'freezone': 'Free Zone Company Setup',
                          'offshore': 'Offshore Company Setup',
                          'bank': 'Bank Account Setup',
                          'existing-company': 'Bank Account Setup',
                          'not_sure': 'Not Sure',
                        };
                        return reverseMap[currentSetupType] || currentSetupType;
                      })()}
                      onChange={(e) => handleFilterChange('setupType', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="all">All Services</option>
                      {websiteServices.map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Agent Contacted">Agent Contacted</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Approved">Approved</option>
                      <option value="Awaiting Customer Approval">Awaiting Customer Approval</option>
                      <option value="Declined">Declined</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Agent Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agent</label>
                    <select
                      value={currentAssigned}
                      onChange={(e) => handleFilterChange('assigned', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="all">All Agents</option>
                      <option value="unassigned">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                    <select
                      value={currentSort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Bulk Actions Bar */}
          {selectedLeads.size > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-4 mb-6 flex items-center justify-between shadow-md">
              <span className="text-sm font-semibold text-indigo-900">
                {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedLeads.size} Lead${selectedLeads.size > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Leads Table */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[100px]">
                      Created
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[120px]">
                      Contact
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[110px]">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[100px]">
                      Agent
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Next Action
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-[80px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-medium text-gray-600 mb-1">No leads found</p>
                          <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => router.push(getDetailUrl(lead))}
                        className="hover:bg-indigo-50/70 cursor-pointer transition-all duration-200 border-b border-gray-100"
                      >
                        <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatDate(lead.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={getDetailUrl(lead)} className="block">
                            <span className="text-sm text-gray-900 font-semibold break-words hover:text-indigo-600 transition-colors" title={lead.name}>
                              {lead.name || 'N/A'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          {lead.contact ? (
                            <a
                              href={`https://wa.me/${lead.contact.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 break-all font-medium hover:underline transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title={lead.contact}
                            >
                              {lead.contact}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 break-all font-medium hover:underline transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Link href={getDetailUrl(lead)} className="block">
                            <span className="text-sm text-gray-700 font-medium break-words">
                              {lead.service || '-'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link href={getDetailUrl(lead)} className="block">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(lead.status)}`}
                            >
                              {lead.status}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link href={getDetailUrl(lead)} className="block">
                            <span className="text-sm text-gray-900 font-medium">
                              {getAgentName(lead.assignedAgentId)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={getDetailUrl(lead)} className="block">
                            <span className="text-sm text-gray-700 font-medium break-words" title={getNextActionForLead(lead)}>
                              {getNextActionForLead(lead)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDelete(lead.id, e)}
                            disabled={deletingId === lead.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                              deleteConfirm === lead.id
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                            title={deleteConfirm === lead.id ? 'Click again to confirm delete' : 'Delete lead'}
                          >
                            {deletingId === lead.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deleteConfirm === lead.id ? 'Confirm' : 'Delete'}
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

