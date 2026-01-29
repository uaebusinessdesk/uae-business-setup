'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { computeCompanySla, type CompanySla } from '@/lib/sla';

export interface Lead {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  setupType: string;
  createdAt: Date;
  // Deal Workflow - Company
  assignedAgent?: string | null;
  agentContactedAt?: Date | null;
  feasible?: boolean | null;
  quotedAmountAed?: number | null;
  approved?: boolean | null;
  paymentReceivedAt?: Date | null;
  companyCompletedAt?: Date | null;
  // Deal Workflow - Bank
  hasBankProject?: boolean | null;
  needsBankAccount?: boolean | null;
  bankQuotedAmountAed?: number | null;
  bankInvoiceNumber?: string | null;
  bankApprovalRequestedAt?: Date | null;
  bankApproved?: boolean | null;
  bankPaymentReceivedAt?: Date | null;
  bankCompletedAt?: Date | null;
  // Invoice fields
  companyInvoiceNumber?: string | null;
  companyInvoiceSentAt?: Date | null;
  activities?: Array<{
    id: string;
    action: string;
    createdAt: Date;
  }>;
  sla?: CompanySla;
}

export interface LeadsListClientProps {
  leads: Lead[];
  initialSearchParams: {
    q: string;
    setupType: string;
    status: string;
    assigned: string;
    sort: string;
  };
}

export default function LeadsListClient({ leads, initialSearchParams }: LeadsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current values from URL params (source of truth)
  const currentQ = searchParams.get('q') || '';
  const currentSetupType = searchParams.get('setupType') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentAssigned = searchParams.get('assigned') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  
  // Local state for form inputs (search box)
  const [q, setQ] = useState(currentQ);
  
  // Sync search input with URL when URL changes
  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  // Debug: Log when leads change
  useEffect(() => {
    console.log('LeadsListClient - Leads updated:', leads.length, 'leads');
    console.log('LeadsListClient - Current filters:', { currentQ, currentSetupType, currentStatus, currentAssigned, currentSort });
  }, [leads, currentQ, currentSetupType, currentStatus, currentAssigned, currentSort]);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (currentSetupType && currentSetupType !== 'all') params.set('setupType', currentSetupType);
    if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);
    if (currentAssigned && currentAssigned !== 'all') params.set('assigned', currentAssigned);
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
    const newUrl = params.toString() ? `/admin/leads?${params.toString()}` : '/admin/leads';
    // Use window.location to force a full page reload and ensure server-side filtering
    window.location.href = newUrl;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleFilterChange = (filter: string, value: string) => {
    console.log('handleFilterChange called:', filter, value);
    
    // Build URL params with updated values
    const params = new URLSearchParams();
    
    // Use current URL values, but apply the new value for the changed filter
    const newQ = currentQ;
    const newSetupType = filter === 'setupType' ? value : currentSetupType;
    const newStatus = filter === 'status' ? value : currentStatus;
    const newAssigned = filter === 'assigned' ? value : currentAssigned;
    const newSort = filter === 'sort' ? value : currentSort;
    
    console.log('New filter values:', { newQ, newSetupType, newStatus, newAssigned, newSort });
    
    // Build params - only include non-default values
    if (newQ) params.set('q', newQ);
    if (newSetupType && newSetupType !== 'all') params.set('setupType', newSetupType);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newAssigned && newAssigned !== 'all') params.set('assigned', newAssigned);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    
    // Update URL which will trigger server-side re-render
    // Add timestamp to prevent caching
    params.set('_t', Date.now().toString());
    const newUrl = `/admin/leads?${params.toString()}`;
    console.log('Navigating to:', newUrl);
    
    // Force a hard navigation to ensure server-side filtering works
    window.location.href = newUrl;
  };

  // Compute status based on simplified deal workflow
  const getStatus = (lead: Lead): string => {
    // Check if both company and bank (if applicable) are completed
    const hasBankProject = lead.hasBankProject || lead.needsBankAccount;
    const bankDone = lead.bankCompletedAt !== null;
    const companyDone = lead.companyCompletedAt !== null;
    
    if (companyDone && (!hasBankProject || bankDone)) {
      return 'Completed';
    }
    if (lead.approved === false) return 'Declined';
    if (lead.approved === true && !lead.paymentReceivedAt) return 'Approved';
    if (lead.feasible === true && lead.quotedAmountAed && !lead.approvalRequestedAt) return 'Quoted';
    if (lead.agentContactedAt) return 'Agent Contacted';
    return 'New';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Agent Contacted': 'bg-yellow-100 text-yellow-800',
      'Quoted': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Declined': 'bg-red-100 text-red-800',
      'Completed': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNextAction = (lead: Lead): string => {
    if (!lead.agentContactedAt) return 'Send WhatsApp to Agent';
    if (lead.feasible === null || lead.feasible === undefined) return 'Set Feasibility & Quote';
    if (lead.feasible === false) return 'Closed (Not Feasible)';
    if (!lead.quotedAmountAed) return 'Enter Quoted Amount';
    // Check if invoices need to be sent
    if (!lead.companyInvoiceNumber && lead.quotedAmountAed) return 'Generate & Send Company Invoice';
    if (lead.needsBankAccount && !lead.bankQuotedAmountAed) return 'Set Bank Quote';
    if (lead.needsBankAccount && lead.bankQuotedAmountAed && !lead.bankInvoiceNumber) return 'Generate & Send Bank Invoice';
    if (lead.companyInvoiceNumber || lead.bankInvoiceNumber) {
      if (lead.approved === null || lead.approved === undefined) return 'Awaiting Customer Decision';
      if (lead.approved === false) return 'Closed (Declined)';
      if (!lead.paymentReceivedAt) return 'Mark Payment Received';
      if (!lead.companyCompletedAt) return 'Mark Company Completed';
    }
    return 'Completed';
  };

  const getAgentName = (agent: string | null | undefined) => {
    if (!agent) return 'No agent assigned';
    if (agent === 'athar') return 'Athar';
    if (agent === 'anoop') return 'Anoop';
    if (agent === 'self') return 'Zahed';
    return agent;
  };

  const formatSlaDisplay = (lead: Lead) => {
    if (!lead.sla) return '-';
    
    const sla = lead.sla;
    
    // If sentToAgentAt exists but feasible missing
    if (sla.sentToAgentAt && !sla.feasibleAt) {
      const hours = sla.responseElapsedHours || 0;
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Awaiting feasibility • {hours}h</span>
          {sla.isResponseOverdue && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Overdue
            </span>
          )}
        </div>
      );
    }
    
    // If feasible exists but completed missing
    if (sla.feasibleAt && !sla.completedAt) {
      const hours = sla.completionElapsedHours || 0;
      const days = Math.round(hours / 24);
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">In progress • {days}d</span>
          {sla.isCompletionOverdue && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Overdue
            </span>
          )}
        </div>
      );
    }
    
    // If completed exists
    if (sla.completedAt) {
      const respHours = sla.responseHours || 0;
      const compHours = sla.completionHours || 0;
      const compDays = Math.round(compHours / 24);
      return (
        <span className="text-xs text-gray-600">Done • Resp {respHours}h • Comp {compDays}d</span>
      );
    }
    
    return '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Website Leads</h1>
              <p className="text-sm text-gray-500">Manage and track leads from website contact forms</p>
            </div>
            <Link
              href="/admin/leads/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Lead
            </Link>
          </div>

        {/* Search and Filters */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Search */}
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
                    className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    title="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Setup Type
                </label>
                <select
                  value={currentSetupType}
                  onChange={(e) => handleFilterChange('setupType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="all">All Services</option>
                  <option value="mainland">Mainland Company Setup</option>
                  <option value="freezone">Free Zone Company Setup</option>
                  <option value="offshore">Offshore Company Setup</option>
                  <option value="bank">Bank Account Setup</option>
                  <option value="existing-company">Existing Company (Bank Account)</option>
                  <option value="not_sure">Not Sure</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Agent Contacted">Agent Contacted</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Agent
                </label>
                <select
                  value={currentAssigned}
                  onChange={(e) => handleFilterChange('assigned', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="all">All Agents</option>
                  <option value="athar">Athar</option>
                  <option value="anoop">Anoop</option>
                  <option value="self">Self</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Sort
                </label>
                <select
                  value={currentSort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Leads Table */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          {leads.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500">
                {currentQ || currentSetupType !== 'all' || currentStatus !== 'all' || currentAssigned !== 'all' 
                  ? 'Try adjusting your filters to see more results.' 
                  : 'Create your first lead to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                      Contact
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                      Service
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[110px]">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                      Agent
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                      Next Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => {
                    const leadStatus = getStatus(lead);
                    
                    return (
                      <tr key={lead.id} className="hover:bg-indigo-50/50 transition-colors duration-150">
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">
                          <Link href={`/admin/leads/${lead.id}`} className="block hover:text-indigo-600 transition-colors">
                            {formatDate(lead.createdAt)}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link href={`/admin/leads/${lead.id}`} className="block text-xs font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate max-w-[120px]" title={lead.fullName}>
                            {lead.fullName}
                          </Link>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {lead.whatsapp ? (
                            <a
                              href={`https://wa.me/${lead.whatsapp.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.whatsapp.replace(/^\+/, '')}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-xs text-indigo-600 hover:text-indigo-800 truncate block max-w-[150px]"
                              onClick={(e) => e.stopPropagation()}
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Link href={`/admin/leads/${lead.id}`} className="block">
                            <span className="text-xs text-gray-700 font-medium">
                              {lead.setupType || '-'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Link href={`/admin/leads/${lead.id}`} className="block">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(leadStatus)}`}
                            >
                              {leadStatus}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Link href={`/admin/leads/${lead.id}`} className="block">
                            <span className="text-xs text-gray-900 font-medium">
                              {getAgentName(lead.assignedAgent)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link href={`/admin/leads/${lead.id}`} className="block">
                            <span className="text-xs text-gray-700 font-medium truncate block max-w-[140px]" title={getNextAction(lead)}>
                              {getNextAction(lead)}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

