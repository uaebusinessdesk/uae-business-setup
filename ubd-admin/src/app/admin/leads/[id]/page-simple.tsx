'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ATHAR_WHATSAPP, ANOOP_WHATSAPP, SELF_WHATSAPP, TEST_WHATSAPP } from '@/config/contacts';
import { waLink } from '@/lib/whatsapp';
import { buildCompanyAgentMessage } from '@/lib/messages';
import { buildCompanyQuoteEmail, buildBankQuoteEmail } from '@/lib/emailTemplates';

interface Lead {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  nationality: string | null;
  residenceCountry: string | null;
  setupType: string;
  activity: string | null;
  shareholdersCount: number | null;
  visasRequired: boolean | null;
  visasCount: number | null;
  timeline: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Deal Workflow - Company
  assignedAgent: string;
  agentContactedAt: Date | null;
  feasible: boolean | null;
  quotedAmountAed: number | null;
  internalNotes: string | null;
  approvalRequestedAt: Date | null;
  approved: boolean | null;
  paymentReceivedAt: Date | null;
  companyCompletedAt: Date | null;
  // Deal Workflow - Bank
  hasBankProject: boolean;
  bankQuotedAmountAed: number | null;
  bankApprovalRequestedAt: Date | null;
  bankApproved: boolean | null;
  bankPaymentReceivedAt: Date | null;
  bankCompletedAt: Date | null;
  bankAfterCompany: boolean;
}

interface LeadActivity {
  id: string;
  leadId: string;
  action: string;
  message: string | null;
  createdAt: Date;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [activities, setActivities] = useState<LeadActivity[]>([]);

  useEffect(() => {
    fetchLead();
    fetchActivities();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data);
      } else {
        setError('Failed to load lead');
      }
    } catch (err) {
      console.error('Error fetching lead:', err);
      setError('Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/leads/${id}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const updateLead = async (updates: Partial<Lead>) => {
    if (!lead) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLead(updatedLead);
        await fetchActivities();
      } else {
        const text = await response.text();
        console.error('Update failed:', response.status, text);
        setError('Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead');
    } finally {
      setActionLoading(false);
    }
  };

  const logActivity = async (action: string, message: string) => {
    try {
      await fetch(`/api/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message }),
      });
      await fetchActivities();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const formatDubaiTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dubai',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatter.format(dateObj);
  };

  const getAgentNumber = (agent: string): string | null => {
    if (agent === 'athar') return ATHAR_WHATSAPP;
    if (agent === 'anoop') return ANOOP_WHATSAPP;
    if (agent === 'self') return SELF_WHATSAPP;
    return null;
  };

  // Step 1: Agent Contact
  const handleSendToAgent = async () => {
    if (!lead) return;
    const agentNumber = getAgentNumber(lead.assignedAgent);
    if (!agentNumber) {
      setError('No agent assigned');
      return;
    }

    // Get agent name for personalization
    const agentName = lead.assignedAgent === 'athar' ? 'Athar' :
                     lead.assignedAgent === 'anoop' ? 'Anoop' :
                     lead.assignedAgent === 'self' ? 'Self' : undefined;

    const message = buildCompanyAgentMessage(lead, agentName);
    const waUrl = waLink(agentNumber, message);
    window.open(waUrl, '_blank');

    await updateLead({ agentContactedAt: new Date() });
    await logActivity('agent_contacted', `Sent WhatsApp to ${lead.assignedAgent}`);
  };

  // Step 3: Customer Approval
  const handleSendApprovalRequest = async () => {
    if (!lead) return;
    const { subject, body } = buildCompanyQuoteEmail(lead);
    const emailText = `Subject: ${subject}\n\n${body}`;
    
    await navigator.clipboard.writeText(emailText);
    setCopied('company-quote');
    setTimeout(() => setCopied(''), 2000);

    await updateLead({ approvalRequestedAt: new Date() });
    await logActivity('approval_requested', 'Approval request email copied');
  };

  // Step 4: Customer Decision
  const handleMarkApproved = async () => {
    await updateLead({ approved: true });
    await logActivity('approved', 'Customer approved');
  };

  const handleMarkDeclined = async () => {
    await updateLead({ approved: false });
    await logActivity('declined', 'Customer declined');
  };

  // Step 5: Payment & Completion
  const handleMarkPaymentReceived = async () => {
    await updateLead({ paymentReceivedAt: new Date() });
    await logActivity('payment_received', 'Payment received');
  };

  const handleMarkCompanyCompleted = async () => {
    await updateLead({ companyCompletedAt: new Date() });
    await logActivity('company_completed', 'Company setup completed');
  };

  // Bank Project handlers (same logic)
  const handleSendBankApprovalRequest = async () => {
    if (!lead) return;
    const { subject, body } = buildBankQuoteEmail(lead);
    const emailText = `Subject: ${subject}\n\n${body}`;
    
    await navigator.clipboard.writeText(emailText);
    setCopied('bank-quote');
    setTimeout(() => setCopied(''), 2000);

    await updateLead({ bankApprovalRequestedAt: new Date() });
    await logActivity('bank_approval_requested', 'Bank approval request email copied');
  };

  const handleMarkBankApproved = async () => {
    await updateLead({ bankApproved: true });
    await logActivity('bank_approved', 'Bank project approved');
  };

  const handleMarkBankDeclined = async () => {
    await updateLead({ bankApproved: false });
    await logActivity('bank_declined', 'Bank project declined');
  };

  const handleMarkBankPaymentReceived = async () => {
    await updateLead({ bankPaymentReceivedAt: new Date() });
    await logActivity('bank_payment_received', 'Bank payment received');
  };

  const handleMarkBankCompleted = async () => {
    await updateLead({ bankCompletedAt: new Date() });
    await logActivity('bank_completed', 'Bank setup completed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">Lead not found</div>
      </div>
    );
  }

  const getStatus = (): string => {
    if (lead.companyCompletedAt) return 'Completed';
    if (lead.paymentReceivedAt) return 'Payment Received';
    if (lead.approved === true) return 'Approved';
    if (lead.approved === false) return 'Declined';
    if (lead.approvalRequestedAt) return 'Awaiting Approval';
    if (lead.quotedAmountAed) return 'Quoted';
    if (lead.agentContactedAt) return 'Agent Contacted';
    return 'New';
  };

  const getNextAction = (): string => {
    if (!lead.agentContactedAt) return 'Send WhatsApp to Agent';
    if (lead.feasible === null) return 'Set Feasibility & Quote';
    if (lead.feasible === false) return 'Closed (Not Feasible)';
    if (!lead.quotedAmountAed) return 'Enter Quoted Amount';
    if (!lead.approvalRequestedAt) return 'Send Approval Request';
    if (lead.approved === null) return 'Awaiting Customer Decision';
    if (lead.approved === false) return 'Closed (Declined)';
    if (!lead.paymentReceivedAt) return 'Mark Payment Received';
    if (!lead.companyCompletedAt) return 'Mark Company Completed';
    return 'Completed';
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <Link href="/admin/leads" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
          ← Back to Leads
        </Link>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lead.fullName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {lead.setupType} • Assigned to: {lead.assignedAgent === 'athar' ? 'Athar' : lead.assignedAgent === 'anoop' ? 'Anoop' : lead.assignedAgent === 'self' ? 'Self' : 'Unassigned'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-lg font-semibold text-gray-900">{getStatus()}</div>
              <div className="text-xs text-gray-400 mt-1">Next: {getNextAction()}</div>
            </div>
          </div>
        </div>

        {/* Client & Request Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Client & Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-gray-900">{lead.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <p className="text-gray-900">{lead.whatsapp}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{lead.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setup Type</label>
              <p className="text-gray-900 capitalize">{lead.setupType}</p>
            </div>
            {lead.activity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Activity</label>
                <p className="text-gray-900">{lead.activity}</p>
              </div>
            )}
            {lead.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Deal Workflow */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Company Deal</h2>

          {/* Step 1: Agent Contact */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">1. Agent Contact</h3>
            {!lead.agentContactedAt ? (
              <button
                onClick={handleSendToAgent}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Send WhatsApp to Agent'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Contacted: {formatDubaiTime(lead.agentContactedAt)}
                </p>
                <button
                  onClick={handleSendToAgent}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Resend WhatsApp to Agent'}
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Feasibility & Quote */}
          {lead.agentContactedAt && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">2. Feasibility & Quote</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feasible</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feasible"
                        checked={lead.feasible === true}
                        onChange={() => updateLead({ feasible: true })}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feasible"
                        checked={lead.feasible === false}
                        onChange={() => updateLead({ feasible: false })}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                {lead.feasible === false ? (
                  <button
                    onClick={() => logActivity('closed', 'Lead closed - not feasible')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Close Lead
                  </button>
                ) : lead.feasible === true ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quoted Amount (AED)
                      </label>
                      <input
                        type="number"
                        value={lead.quotedAmountAed || ''}
                        onChange={(e) => updateLead({ quotedAmountAed: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Notes
                      </label>
                      <textarea
                        value={lead.internalNotes || ''}
                        onChange={(e) => updateLead({ internalNotes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Internal notes..."
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 3: Customer Approval */}
          {lead.feasible === true && lead.quotedAmountAed && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">3. Customer Approval</h3>
              {!lead.approvalRequestedAt ? (
                <button
                  onClick={handleSendApprovalRequest}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                >
                  {copied === 'company-quote' ? '✓ Copied!' : actionLoading ? 'Processing...' : 'Send Approval Request Email'}
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  Request sent: {formatDubaiTime(lead.approvalRequestedAt)}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Customer Decision */}
          {lead.approvalRequestedAt && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">4. Customer Decision</h3>
              {lead.approved === null ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleMarkApproved}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    Mark Approved
                  </button>
                  <button
                    onClick={handleMarkDeclined}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    Mark Declined
                  </button>
                </div>
              ) : lead.approved === false ? (
                <p className="text-sm text-red-600">Declined - Lead closed</p>
              ) : (
                <p className="text-sm text-green-600">Approved</p>
              )}
            </div>
          )}

          {/* Step 5: Payment & Completion */}
          {lead.approved === true && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">5. Payment & Completion</h3>
              <div className="space-y-3">
                {!lead.paymentReceivedAt ? (
                  <button
                    onClick={handleMarkPaymentReceived}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                  >
                    Mark Payment Received
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Payment received: {formatDubaiTime(lead.paymentReceivedAt)}
                  </p>
                )}
                {lead.paymentReceivedAt && !lead.companyCompletedAt && (
                  <button
                    onClick={handleMarkCompanyCompleted}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                  >
                    Mark Company Completed
                  </button>
                )}
                {lead.companyCompletedAt && (
                  <p className="text-sm text-green-600">
                    Completed: {formatDubaiTime(lead.companyCompletedAt)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bank Project Deal Workflow */}
        {lead.hasBankProject && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Bank Project</h2>
            {lead.bankAfterCompany && !lead.companyCompletedAt && (
              <p className="text-sm text-yellow-600 mb-4">
                Bank project will start after company completion.
              </p>
            )}

            {/* Bank Step 2: Feasibility & Quote */}
            {(!lead.bankAfterCompany || lead.companyCompletedAt) && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">2. Feasibility & Quote</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Quoted Amount (AED)
                    </label>
                    <input
                      type="number"
                      value={lead.bankQuotedAmountAed || ''}
                      onChange={(e) => updateLead({ bankQuotedAmountAed: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Step 3: Customer Approval */}
            {lead.bankQuotedAmountAed && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">3. Customer Approval</h3>
                {!lead.bankApprovalRequestedAt ? (
                  <button
                    onClick={handleSendBankApprovalRequest}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                  >
                    {copied === 'bank-quote' ? '✓ Copied!' : actionLoading ? 'Processing...' : 'Send Approval Request Email'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Request sent: {formatDubaiTime(lead.bankApprovalRequestedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Bank Step 4: Customer Decision */}
            {lead.bankApprovalRequestedAt && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">4. Customer Decision</h3>
                {lead.bankApproved === null ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleMarkBankApproved}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      Mark Approved
                    </button>
                    <button
                      onClick={handleMarkBankDeclined}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Mark Declined
                    </button>
                  </div>
                ) : lead.bankApproved === false ? (
                  <p className="text-sm text-red-600">Declined</p>
                ) : (
                  <p className="text-sm text-green-600">Approved</p>
                )}
              </div>
            )}

            {/* Bank Step 5: Payment & Completion */}
            {lead.bankApproved === true && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">5. Payment & Completion</h3>
                <div className="space-y-3">
                  {!lead.bankPaymentReceivedAt ? (
                    <button
                      onClick={handleMarkBankPaymentReceived}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                    >
                      Mark Payment Received
                    </button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Payment received: {formatDubaiTime(lead.bankPaymentReceivedAt)}
                    </p>
                  )}
                  {lead.bankPaymentReceivedAt && !lead.bankCompletedAt && (
                    <button
                      onClick={handleMarkBankCompleted}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                    >
                      Mark Bank Completed
                    </button>
                  )}
                  {lead.bankCompletedAt && (
                    <p className="text-sm text-green-600">
                      Completed: {formatDubaiTime(lead.bankCompletedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History - Collapsed by Default */}
        <div className="bg-white shadow rounded-lg p-6">
          <button
            onClick={() => setActivityExpanded(!activityExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-semibold">History</h2>
            <span className="text-sm text-gray-500">
              {activityExpanded ? '▼' : '▶'} {activities.length} {activities.length === 1 ? 'event' : 'events'}
            </span>
          </button>
          {activityExpanded && (
            <div className="mt-4">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message || activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDubaiTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


