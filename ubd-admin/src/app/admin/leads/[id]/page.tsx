'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardRefresh from '@/components/DashboardRefresh';
import Link from 'next/link';
import { ATHAR_WHATSAPP, ANOOP_WHATSAPP, SELF_WHATSAPP, TEST_WHATSAPP } from '@/config/contacts';
import { waLink } from '@/lib/whatsapp';
import { normalizePhone, isValidE164 } from '@/lib/phone';
import { getNextAction, getStatus, type LeadWorkflowData } from '@/lib/leadWorkflow';
import { buildCompanyAgentMessage, buildBankAgentMessage, type BankPrescreenData } from '@/lib/messages';
import AgentAssignment from '@/components/AgentAssignment';
import { toSetupTypeLabel } from '@/lib/setupType';

interface Lead {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  nationality: string | null;
  residenceCountry: string | null;
  emirate: string | null;
  setupType?: string;
  activity: string | null;
  shareholdersCount: number | null;
  visasRequired: boolean | null;
  visasCount: number | null;
  timeline: string | null;
  notes: string | null;
  serviceDetails: string | null; // JSON string
  createdAt: Date;
  updatedAt: Date;
  // Deal Workflow - Company
  assignedAgent: string;
  agentContactedAt: Date | null;
  feasible: boolean | null;
  quotedAmountAed: number | null;
  companyQuoteSentAt: Date | null;
  quoteWhatsAppSentAt: Date | null;
  quoteWhatsAppMessageId: string | null;
  quoteViewedAt: Date | null;
  quoteApprovedAt: Date | null;
  proceedConfirmedAt: Date | null;
  quoteDeclinedAt: Date | null;
  quoteDeclineReason: string | null;
  quoteQuestionsAt: Date | null;
  quoteQuestionsReason: string | null;
  companyPaymentLink: string | null;
  paymentLinkSentAt: Date | null;
  internalNotes: string | null;
  approvalRequestedAt: Date | null;
  approved: boolean | null;
  paymentReceivedAt: Date | null;
  companyCompletedAt: Date | null;
  paymentReminderSentAt: Date | null;
  paymentReminderCount: number;
  declinedAt: Date | null;
  declineReason: string | null;
  declineStage: string | null;
  // Deal Workflow - Bank
  hasBankProject: boolean;
  bankQuotedAmountAed: number | null;
  bankQuoteSentAt: Date | null;
  bankQuoteViewedAt: Date | null;
  bankProceedConfirmedAt: Date | null;
  bankQuoteApprovedAt: Date | null;
  bankQuoteDeclinedAt: Date | null;
  bankQuoteDeclineReason: string | null;
  bankQuoteQuestionsAt: Date | null;
  bankQuoteQuestionsReason: string | null;
  bankPaymentLink: string | null;
  bankApprovalRequestedAt: Date | null;
  bankApproved: boolean | null;
  bankInvoiceNumber: string | null;
  bankInvoiceVersion: number | null;
  bankInvoiceAmountAed: number | null;
  bankInvoicePaymentLink: string | null;
  bankInvoiceHtml: string | null;
  bankInvoiceSentAt: Date | null;
  bankPaymentReminderSentAt: Date | null;
  bankPaymentReminderCount: number;
  bankPaymentReceivedAt: Date | null;
  bankCompletedAt: Date | null;
  bankDeclinedAt: Date | null;
  bankDeclineReason: string | null;
  bankDeclineStage: string | null;
  // Bank Deal workflow fields
  bankDealActive: boolean;
  bankDealAgentContactedAt: Date | null;
  bankDealQuotedAmountAed: number | null;
  bankDealQuoteSentAt: Date | null;
  bankDealQuoteViewedAt: Date | null;
  bankDealQuoteApprovedAt: Date | null;
  bankDealProceedConfirmedAt: Date | null;
  bankDealQuoteDeclinedAt: Date | null;
  bankDealQuoteDeclineReason: string | null;
  bankDealPaymentLink: string | null;
  bankDealInvoiceNumber: string | null;
  bankDealInvoiceAmountAed: number | null;
  bankDealInvoicePaymentLink: string | null;
  bankDealInvoiceSentAt: Date | null;
  bankDealPaymentReceivedAt: Date | null;
  bankDealPaymentReminderSentAt: Date | null;
  bankDealPaymentReminderCount: number;
  bankDealCompletedAt: Date | null;
  bankDealDeclinedAt: Date | null;
  bankDealDeclineReason: string | null;
  // Invoice fields
  companyInvoiceNumber: string | null;
  companyInvoiceLink: string | null;
  companyInvoiceAmountAed: number | null;
  companyInvoiceVersion: number | null;
  companyInvoicePdfPath: string | null;
  companyInvoiceSentAt: Date | null;
  // Google Review
  googleReviewRequestedAt: Date | null;
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
  const leadType = 'Lead' as const;
  
  // Derived service type booleans (computed from lead state)
  const effectiveSetupType = useMemo((): 'company' | 'bank' | null => {
    if (!lead) return null;
    const setupType = (lead as any).setupType;
    // Bank, mainland, freezone, offshore all use company workflow
    if (setupType === 'bank' || setupType === 'company' || setupType === 'mainland' || setupType === 'freezone' || setupType === 'offshore') return 'company';
    return null;
  }, [lead]);
  
  const companyActive = effectiveSetupType === 'company';
  // bankActive: no longer used - bank now uses company workflow
  const bankActive = false;
  
  // Check if this is a bank lead for UI labeling
  const isBankLead = useMemo(() => {
    if (!lead) return false;
    return (lead as any).setupType === 'bank';
  }, [lead]);
  
  // Project label (Company Deal vs Bank Project)
  const projectLabel = isBankLead ? 'Bank Project' : 'Company Deal';
  // Service label (Company vs Bank Account)
  const serviceLabel = isBankLead ? 'Bank Account' : 'Company';
  // Quote label (Company Quote vs Bank Quote)
  const quoteLabel = isBankLead ? 'Bank Quote' : 'Company Quote';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetConfirmChecked, setResetConfirmChecked] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [assignedAgentsForSummary, setAssignedAgentsForSummary] = useState<any[]>([]);
  const [copied, setCopied] = useState('');
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [localQuotedAmount, setLocalQuotedAmount] = useState<string>('');
  const [localBankQuotedAmount, setLocalBankQuotedAmount] = useState<string>('');
  const [localInternalNotes, setLocalInternalNotes] = useState<string>('');
  const [localNotes, setLocalNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [feasibilitySectionExpanded, setFeasibilitySectionExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingCustomerDecision, setEditingCustomerDecision] = useState<'company' | 'bank' | null>(null);
  const [editingAgentContact, setEditingAgentContact] = useState(false);
  const [editingPaymentCompletion, setEditingPaymentCompletion] = useState<'company' | 'bank' | null>(null);
  const [editingDeclineStatus, setEditingDeclineStatus] = useState(false);
  const [prescreenExpanded, setPrescreenExpanded] = useState(true);
  const [editingQuote, setEditingQuote] = useState(false);
  
  const [quoteEditData, setQuoteEditData] = useState<{ feasible: boolean | null; quotedAmountAed: number | null }>({ feasible: null, quotedAmountAed: null });
  const [phoneError, setPhoneError] = useState<string>('');
  const [paymentLinkError, setPaymentLinkError] = useState<string | null>(null);
  const [invoicePaymentLinkDraft, setInvoicePaymentLinkDraft] = useState<string>('');
  const [bankPaymentLinkDraft, setBankPaymentLinkDraft] = useState<string>('');
  const [bankInvoicePaymentLinkDraft, setBankInvoicePaymentLinkDraft] = useState<string>('');
  // Bank prescreen fields state - load from localStorage on mount
  const [bankPrescreenData, setBankPrescreenData] = useState<BankPrescreenData>(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const saved = localStorage.getItem(`bankPrescreenData_${id}`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error loading bank prescreen data from localStorage:', e);
      }
    }
    return {
      // Company-specific
      companyName: '',
      shareholderNationalities: '',
      corporateStructure: '',
      placeOfIncorporation: '',
      dateOfIncorporation: '',
      // Business Snapshot
      uaeSetupType: '',
      primaryActivityCategory: '',
      primaryActivityDetails: '',
      ownerUaeResident: '',
      // Expected Account Use
      expectedMonthlyTurnoverAed: '',
      paymentGeographies: [],
      paymentGeographiesOther: '',
      // Compliance Flags
      involvesCrypto: '',
      cashIntensive: '',
      sanctionedHighRiskCountries: '',
      // Readiness
      kycDocsReady: '',
    };
  });

  // Save prescreen data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        localStorage.setItem(`bankPrescreenData_${id}`, JSON.stringify(bankPrescreenData));
      } catch (e) {
        console.error('Error saving bank prescreen data to localStorage:', e);
      }
    }
  }, [bankPrescreenData, id]);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState<{ sentAt: Date; count: number } | null>(null);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineStage, setDeclineStage] = useState<string>('After Invoice');
  const [declineReason, setDeclineReason] = useState<string>('');
  const [declining, setDeclining] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [invoiceRevisions, setInvoiceRevisions] = useState<Array<{ id: string; version: number; invoiceNumber: string | null; amountAed: number; sentAt: Date }>>([]);
  const [bankInvoiceRevisions, setBankInvoiceRevisions] = useState<Array<{ id: string; version: number; invoiceNumber: string | null; amountAed: number; sentAt: Date }>>([]);
  const [showBankResetConfirm, setShowBankResetConfirm] = useState(false);
  const [bankResetConfirmText, setBankResetConfirmText] = useState('');
  const [bankResetConfirmChecked, setBankResetConfirmChecked] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);


  // Validate payment link URL
  const validatePaymentLink = (value: string | null): string | null => {
    if (!value || value.trim() === '') {
      return null; // Empty is allowed
    }
    
    // Must start with https://
    if (!value.startsWith('https://')) {
      return 'Payment link must start with https://';
    }
    
    // Must be a valid URL
    try {
      new URL(value);
      return null; // Valid
    } catch {
      return 'Invalid URL format';
    }
  };

  // Helper function to format timeline value
  const formatTimeline = (timeline: string | null): string => {
    if (!timeline) return 'Not provided';
    // Capitalize first letter and handle "immediately"
    const formatted = timeline.toLowerCase() === 'immediately' ? 'Immediately' : timeline.charAt(0).toUpperCase() + timeline.slice(1);
    return formatted;
  };

  // Helper function to parse notes and extract bank account details
  const parseNotesAndBankDetails = (notes: string | null) => {
    if (!notes) {
      return {
        customerNotes: null,
        adminNotes: null,
        monthlyTurnover: null,
        existingUaeBankAccount: null,
        companyJurisdiction: null,
        companyStatus: null,
      };
    }

    let allNotes = notes;
    let monthlyTurnover: string | null = null;
    let existingUaeBankAccount: string | null = null;
    let companyJurisdiction: string | null = null;
    let companyStatus: string | null = null;

    // Extract Lead Reference and remove it
    allNotes = allNotes.replace(/Lead Reference:\s*[A-Z0-9-]+/gi, '').trim();

    // Extract Bank Account Details section
    const bankDetailsMatch = allNotes.match(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i);
    if (bankDetailsMatch) {
      const bankDetailsSection = bankDetailsMatch[1];
      allNotes = allNotes.replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '').trim();

      // Extract individual bank fields
      const monthlyTurnoverMatch = bankDetailsSection.match(/Monthly Turnover:\s*(.+)/i);
      if (monthlyTurnoverMatch) {
        monthlyTurnover = monthlyTurnoverMatch[1].trim();
      }

      const existingAccountMatch = bankDetailsSection.match(/Existing UAE Bank Account:\s*(.+)/i);
      if (existingAccountMatch) {
        existingUaeBankAccount = existingAccountMatch[1].trim();
      }

      const jurisdictionMatch = bankDetailsSection.match(/Company Jurisdiction:\s*(.+)/i);
      if (jurisdictionMatch) {
        companyJurisdiction = jurisdictionMatch[1].trim();
      }

      const statusMatch = bankDetailsSection.match(/Company Status:\s*(.+)/i);
      if (statusMatch) {
        companyStatus = statusMatch[1].trim();
      }
    }

    // Separate customer notes from admin notes using separator
    // Admin notes are marked with "--- Admin Notes ---" separator
    const adminNotesSeparator = /---\s*Admin Notes\s*---/i;
    const hasAdminNotes = adminNotesSeparator.test(allNotes);
    
    let customerNotes: string | null = null;
    let adminNotes: string | null = null;
    
    if (hasAdminNotes) {
      // Split by separator - everything before is customer notes, everything after is admin notes
      // Find the first occurrence of the separator
      const separatorIndex = allNotes.search(adminNotesSeparator);
      if (separatorIndex !== -1) {
        // Everything before the separator is customer notes
        customerNotes = allNotes.substring(0, separatorIndex).trim() || null;
        // Everything after the separator is admin notes (remove the separator line itself)
        const afterSeparator = allNotes.substring(separatorIndex);
        // Remove the separator line and any leading whitespace/newlines
        adminNotes = afterSeparator.replace(adminNotesSeparator, '').replace(/^\s*\n*\s*/, '').trim() || null;
      } else {
        // Fallback: treat everything as customer notes
        customerNotes = allNotes.trim() || null;
        adminNotes = null;
      }
    } else {
      // If no separator, everything is customer notes (for backward compatibility)
      customerNotes = allNotes.trim() || null;
      adminNotes = null;
    }

    // Clean up notes (remove extra newlines)
    customerNotes = customerNotes ? customerNotes.replace(/\n{3,}/g, '\n\n').trim() : null;
    adminNotes = adminNotes ? adminNotes.replace(/\n{3,}/g, '\n\n').trim() : null;

    return {
      customerNotes: customerNotes || null,
      adminNotes: adminNotes || null,
      userNotes: customerNotes || null, // Keep for backward compatibility
      monthlyTurnover,
      existingUaeBankAccount,
      companyJurisdiction,
      companyStatus,
    };
  };

  // Helper function to get service display name
  const getServiceDisplayName = (lead: Lead | null): string => {
    if (!lead) return 'N/A';
    
    // Use setupType with proper label
    if (lead.setupType) {
      return toSetupTypeLabel(lead.setupType);
    }
    
    return 'N/A';
  };

  // Reset action loading on mount (after page refresh)
  useEffect(() => {
    setActionLoading(false);
  }, []);

  useEffect(() => {
    fetchLead();
    fetchAssignedAgentsForSummary();
  }, [id]);

  const fetchAssignedAgentsForSummary = async () => {
    try {
      const response = await fetch(`/api/leads/${id}/agents`);
      if (response.ok) {
        const data = await response.json();
        setAssignedAgentsForSummary(data);
      }
    } catch (error) {
      console.error('Error fetching assigned agents for summary:', error);
    }
  };

  // Sync quoteEditData with lead when lead changes
  useEffect(() => {
    if (lead) {
      setQuoteEditData({
        feasible: lead.feasible,
        quotedAmountAed: lead.quotedAmountAed,
      });
    }
  }, [lead?.feasible, lead?.quotedAmountAed]);



  const fetchLead = async () => {
    try {
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/leads/${id}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Debug: Log decision fields to console
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Lead Detail] Fetched lead decision fields:', {
            proceedConfirmedAt: data.proceedConfirmedAt,
            quoteApprovedAt: data.quoteApprovedAt,
            approved: data.approved,
            quoteDeclinedAt: data.quoteDeclinedAt,
            paymentReminderSentAt: data.paymentReminderSentAt,
            paymentReminderCount: data.paymentReminderCount,
            bankPaymentReminderSentAt: data.bankPaymentReminderSentAt,
            bankPaymentReminderCount: data.bankPaymentReminderCount,
          });
        }
        
        setLead(data);
        
        // Sync local state with fetched data
        setLocalQuotedAmount(data.quotedAmountAed?.toString() || '');
        setLocalBankQuotedAmount(data.bankQuotedAmountAed?.toString() || '');
        setLocalInternalNotes(data.internalNotes || '');
        // Initialize localNotes - exclude customer form notes, only show admin-added notes
        // Customer form notes are shown in Client & Request section, not here
        const { adminNotes: parsedAdminNotes } = parseNotesAndBankDetails(data.notes);
        // Show only admin notes in the bottom notes section
        setLocalNotes(parsedAdminNotes || '');
        setInvoicePaymentLinkDraft(data.companyPaymentLink || '');
        setBankPaymentLinkDraft(data.bankPaymentLink || '');
        // Keep section expanded if agent was contacted
        if (data.agentContactedAt) {
          setFeasibilitySectionExpanded(true);
        }
        
        // Fetch activities
        fetchActivities();
        // Fetch invoice revisions
        fetchInvoiceRevisions();
        fetchBankInvoiceRevisions();
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

  const fetchBankInvoiceRevisions = async () => {
    try {
      const response = await fetch(`/api/leads/${id}/bank-invoices`);
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.revisions) {
          setBankInvoiceRevisions(data.revisions.map((r: any) => ({
            ...r,
            sentAt: new Date(r.sentAt),
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching bank invoice revisions:', err);
    }
  };

  const fetchInvoiceRevisions = async () => {
    try {
      const response = await fetch(`/api/leads/${id}/invoices`);
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.revisions) {
          setInvoiceRevisions(data.revisions.map((r: any) => ({
            ...r,
            sentAt: new Date(r.sentAt),
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching invoice revisions:', err);
    }
  };

  // Auto-refresh polling when waiting for customer decision
  // Stops automatically when customer approves (proceedConfirmedAt OR quoteApprovedAt OR approved === true)
  // OR when customer declines (quoteDeclinedAt) OR when customer has questions (quoteQuestionsAt)
  // Handles both company and bank workflows independently
  useEffect(() => {
    if (!lead) return;

    // Check company workflow: quote sent AND not approved AND not declined AND no questions
    const isCompanyApproved = lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.approved === true;
    const isCompanyDeclined = !!lead.quoteDeclinedAt;
    const isCompanyHasQuestions = !!lead.quoteQuestionsAt;
    const isCompanyWaiting = lead.companyQuoteSentAt && !isCompanyApproved && !isCompanyDeclined && !isCompanyHasQuestions;

    // Check bank workflow: bank quote sent AND not approved AND not declined AND no questions
    const isBankApproved = lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.bankApproved === true;
    const isBankDeclined = !!lead.bankQuoteDeclinedAt;
    const isBankHasQuestions = !!lead.bankQuoteQuestionsAt;
    const isBankWaiting = lead.bankQuoteSentAt && !isBankApproved && !isBankDeclined && !isBankHasQuestions;

    // Poll if either workflow is waiting for decision
    const isWaitingForDecision = isCompanyWaiting || isBankWaiting;

    if (!isWaitingForDecision) {
      // Not waiting (approved/declined/questions/not sent) - no polling needed
      return;
    }

    // Set up polling interval (every 5 seconds for faster updates)
    const intervalId = setInterval(() => {
      fetchLead(); // fetchLead updates all decision fields, triggering this effect to re-evaluate
    }, 5000); // Poll every 5 seconds for faster updates

    // Cleanup interval on unmount or when conditions change
    // This effect re-runs whenever any decision field changes, automatically stopping polling
    return () => {
      clearInterval(intervalId);
    };
  }, [
    lead?.companyQuoteSentAt, lead?.proceedConfirmedAt, lead?.quoteApprovedAt, lead?.approved, lead?.quoteDeclinedAt, lead?.quoteQuestionsAt,
    lead?.bankQuoteSentAt, lead?.bankProceedConfirmedAt, lead?.bankQuoteApprovedAt, lead?.bankApproved, lead?.bankQuoteDeclinedAt, lead?.bankQuoteQuestionsAt,
    id
  ]);

  const updateLead = async (updates: Partial<Lead>) => {
    if (!lead) return;
    setActionLoading(true);
    // Preserve expansion state before update
    const wasExpanded = feasibilitySectionExpanded || lead.agentContactedAt;
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const responseData = await response.json();
        // Handle both response formats: { ok: true, lead: ... } or direct lead object
        const updatedLead = responseData.lead || responseData;
        setLead(updatedLead);
        // Refresh assigned agents for summary display
        await fetchAssignedAgentsForSummary();
        // Sync local state with updated data
        if ('quotedAmountAed' in updates) {
          setLocalQuotedAmount(updatedLead.quotedAmountAed?.toString() || '');
        }
        if ('bankQuotedAmountAed' in updates) {
          setLocalBankQuotedAmount(updatedLead.bankQuotedAmountAed?.toString() || '');
        }
        if ('internalNotes' in updates) {
          setLocalInternalNotes(updatedLead.internalNotes || '');
        }
        if ('notes' in updates) {
          // Update localNotes - exclude customer form notes, only show admin-added notes
          const { adminNotes: parsedAdminNotes } = parseNotesAndBankDetails(updatedLead.notes);
          // Show only admin notes in the bottom notes section
          setLocalNotes(parsedAdminNotes || '');
        }
        // ALWAYS keep section expanded if it was expanded before or if agent was contacted
        if (wasExpanded || updatedLead.agentContactedAt) {
          setFeasibilitySectionExpanded(true);
        }
        await fetchActivities();
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Failed to update lead (${response.status})`;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.details && Array.isArray(errorData.details)) {
            errorMessage = errorData.details.join('. ');
          } else {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } else {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        
        console.error('Update failed:', response.status, errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error updating lead:', err);
      const errorMsg = err?.message || 'Failed to update lead. Please try again.';
      setError(errorMsg);
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

  const getAgentFromSetupType = (setupType: string): string => {
    if (setupType === 'mainland' || setupType === 'company') return 'athar';
    if (setupType === 'freezone' || setupType === 'offshore') return 'anoop';
    if (setupType === 'bank') return 'self';
    return 'self'; // Default fallback
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      assigned: 'Assigned',
      contacted: 'Contacted',
      accepted: 'Accepted',
      working: 'Working',
      completed: 'Completed',
      declined: 'Declined',
      on_hold: 'On Hold',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getAgentNumber = (agent: string): string => {
    if (agent === 'athar') return ATHAR_WHATSAPP;
    if (agent === 'anoop') return ANOOP_WHATSAPP;
    if (agent === 'self') return TEST_WHATSAPP; // Use test number for self
    // Fallback to test number if agent is unknown
    return TEST_WHATSAPP;
  };

  // Step 1: Agent Contact
  const handleSendToAgent = async () => {
    if (!lead) return;
    setActionLoading(true);
    setError('');

    try {
      // Fetch assigned agents from database
      const agentsResponse = await fetch(`/api/leads/${id}/agents`);
      if (!agentsResponse.ok) {
        setError('Failed to fetch assigned agents.');
        setActionLoading(false);
        return;
      }

      const data = await agentsResponse.json();
      // Handle both grouped and flat response formats
      const allAssignments = data.all || data;
      const companyAgents = data.company || allAssignments.filter((a: any) => a.serviceType === 'company');
      const bankAgents = data.bank || allAssignments.filter((a: any) => a.serviceType === 'bank');

      // Find current agents (one for company, potentially multiple for bank)
      const currentCompanyAgent = companyAgents.find((la: any) => la.isCurrent && (la.status === 'assigned' || la.status === 'contacted'));
      const currentBankAgents = bankAgents.filter((la: any) => la.isCurrent && (la.status === 'assigned' || la.status === 'contacted'));

      if (!currentCompanyAgent && currentBankAgents.length === 0) {
        setError('No current agent assigned. Please set a current agent first.');
        setActionLoading(false);
        return;
      }

      // Send WhatsApp to current company agent if exists
      if (currentCompanyAgent && currentCompanyAgent.agent) {
        const message = buildCompanyAgentMessage(lead);
        const waUrl = waLink(currentCompanyAgent.agent.whatsappNumber, message);
        window.open(waUrl, '_blank');

        // Update agent status to 'contacted' if it was 'assigned'
        if (currentCompanyAgent.status === 'assigned') {
          await fetch(`/api/leads/${id}/agents/${currentCompanyAgent.agentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'contacted' }),
          });
        }
      }

      // Send WhatsApp to current bank agents
      for (const bankAgent of currentBankAgents) {
        if (bankAgent.agent) {
          const message = buildCompanyAgentMessage(lead);
          const waUrl = waLink(bankAgent.agent.whatsappNumber, message);
          window.open(waUrl, '_blank');

          // Update agent status to 'contacted' if it was 'assigned'
          if (bankAgent.status === 'assigned') {
            await fetch(`/api/leads/${id}/agents/${bankAgent.agentId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'contacted' }),
            });
          }
        }
      }

      // Update lead with agentContactedAt timestamp (only if not already set)
      if (!lead.agentContactedAt) {
        const agentContactedAt = new Date().toISOString();
        const response = await fetch(`/api/leads/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentContactedAt,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Failed to update agentContactedAt:', response.status, text);
          setError(`Failed to save: ${text}`);
          return;
        }
      }

      // Refresh lead state - fetch full lead to ensure all fields are present
      await fetchLead();
      await fetchAssignedAgentsForSummary();
      await fetchActivities();
    } catch (err) {
      console.error('Error sending to agent:', err);
      setError('Failed to update lead status');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 1: Agent Contact - Bank Account Setup
  const handleSendToBankAgent = async () => {
    if (!lead) return;
    setActionLoading(true);
    setError('');

    try {
      // Fetch assigned agents from database
      const agentsResponse = await fetch(`/api/leads/${id}/agents`);
      if (!agentsResponse.ok) {
        setError('Failed to fetch assigned agents.');
        setActionLoading(false);
        return;
      }

      const data = await agentsResponse.json();
      // Handle both grouped and flat response formats
      const allAssignments = data.all || data;
      const bankAgents = data.bank || allAssignments.filter((a: any) => a.serviceType === 'bank');

      // Find current bank agents
      const currentBankAgents = bankAgents.filter((la: any) => la.isCurrent && (la.status === 'assigned' || la.status === 'contacted'));

      if (currentBankAgents.length === 0) {
        setError('No current bank agent assigned. Please set a current bank agent first.');
        setActionLoading(false);
        return;
      }

      // Build prescreen data object (only include fields with values)
      const prescreenData: BankPrescreenData = {};
      
      // Company-specific fields
      if (bankPrescreenData.companyName) prescreenData.companyName = bankPrescreenData.companyName;
      if (bankPrescreenData.shareholderNationalities) prescreenData.shareholderNationalities = bankPrescreenData.shareholderNationalities;
      if (bankPrescreenData.corporateStructure) prescreenData.corporateStructure = bankPrescreenData.corporateStructure;
      if (bankPrescreenData.placeOfIncorporation) prescreenData.placeOfIncorporation = bankPrescreenData.placeOfIncorporation;
      if (bankPrescreenData.dateOfIncorporation) prescreenData.dateOfIncorporation = bankPrescreenData.dateOfIncorporation;
      
      // Business Snapshot
      if (bankPrescreenData.uaeSetupType) prescreenData.uaeSetupType = bankPrescreenData.uaeSetupType;
      if (bankPrescreenData.primaryActivityCategory) prescreenData.primaryActivityCategory = bankPrescreenData.primaryActivityCategory;
      if (bankPrescreenData.primaryActivityDetails) prescreenData.primaryActivityDetails = bankPrescreenData.primaryActivityDetails;
      if (bankPrescreenData.ownerUaeResident) prescreenData.ownerUaeResident = bankPrescreenData.ownerUaeResident;
      
      // Expected Account Use
      if (bankPrescreenData.expectedMonthlyTurnoverAed) prescreenData.expectedMonthlyTurnoverAed = bankPrescreenData.expectedMonthlyTurnoverAed;
      if (bankPrescreenData.paymentGeographies && bankPrescreenData.paymentGeographies.length > 0) {
        prescreenData.paymentGeographies = bankPrescreenData.paymentGeographies;
      }
      if (bankPrescreenData.paymentGeographiesOther) prescreenData.paymentGeographiesOther = bankPrescreenData.paymentGeographiesOther;
      
      // Compliance Flags
      if (bankPrescreenData.involvesCrypto) prescreenData.involvesCrypto = bankPrescreenData.involvesCrypto;
      if (bankPrescreenData.cashIntensive) prescreenData.cashIntensive = bankPrescreenData.cashIntensive;
      if (bankPrescreenData.sanctionedHighRiskCountries) prescreenData.sanctionedHighRiskCountries = bankPrescreenData.sanctionedHighRiskCountries;
      
      // Readiness
      if (bankPrescreenData.kycDocsReady) prescreenData.kycDocsReady = bankPrescreenData.kycDocsReady;

      // Send WhatsApp to each current bank agent
      for (const bankAgent of currentBankAgents) {
        if (bankAgent.agent) {
          const message = buildBankAgentMessage(lead, prescreenData);
          const waUrl = waLink(bankAgent.agent.whatsappNumber, message);
          window.open(waUrl, '_blank');

          // Update agent status to 'contacted' if it was 'assigned'
          if (bankAgent.status === 'assigned') {
            await fetch(`/api/leads/${id}/agents/${bankAgent.agentId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'contacted' }),
            });
          }
        }
      }

      // Refresh agent data
      await fetchAssignedAgentsForSummary();
      setSuccessMessage('WhatsApp sent to bank agent(s) successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error sending to bank agent:', err);
      setError('Failed to send WhatsApp to bank agent');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 5: Generate & Send Invoice (after approval)
  const handleGenerateInvoice = async (invoiceType: 'company' | 'bank') => {
    if (!lead) return;
    
    // For company invoices, validate payment link if provided
    if (invoiceType === 'company' && invoicePaymentLinkDraft.trim()) {
      const error = validatePaymentLink(invoicePaymentLinkDraft.trim());
      if (error) {
        setPaymentLinkError(error);
        return;
      }
    }
    
    setPaymentLinkError(null);
    setActionLoading(true);
    try {
      const paymentLink = invoiceType === 'company' ? invoicePaymentLinkDraft.trim() || null : null;
      
      // For bank invoices, use bank payment link draft
      const bankPaymentLink = invoiceType === 'bank' ? bankPaymentLinkDraft.trim() || null : null;
      const finalPaymentLink = invoiceType === 'company' ? paymentLink : bankPaymentLink;
      
      // Use different endpoints for company vs bank invoices
      const endpoint = invoiceType === 'company' 
        ? `/api/leads/${id}/email/invoice/company`
        : `/api/leads/${id}/email/invoice/bank`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentLink: finalPaymentLink || undefined }),
      });
      
      // Parse response safely
      let data: any = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          // JSON parse failed - try to read as text
          try {
            const text = await response.text();
            console.error('[Invoice Generation] JSON parse failed, response text:', text);
            setError(`Failed to generate invoice (HTTP ${response.status}): ${text || 'Invalid response'}`);
            setTimeout(() => setError(''), 5000);
            return;
          } catch (textError) {
            console.error('[Invoice Generation] Could not read response:', textError);
            setError(`Failed to generate invoice (HTTP ${response.status})`);
            setTimeout(() => setError(''), 5000);
            return;
          }
        }
      } else {
        // Not JSON - try to read as text
        try {
          const text = await response.text();
          console.error('[Invoice Generation] Non-JSON response:', text);
          setError(`Failed to generate invoice (HTTP ${response.status}): ${text || 'Invalid response'}`);
          setTimeout(() => setError(''), 5000);
          return;
        } catch (textError) {
          console.error('[Invoice Generation] Could not read response:', textError);
          setError(`Failed to generate invoice (HTTP ${response.status})`);
          setTimeout(() => setError(''), 5000);
          return;
        }
      }

      // Check if response is ok AND data.ok === true
      if (response.ok && data.ok === true) {
        // Success - email was sent
        // Update local state immediately with returned data
        if (invoiceType === 'company' && data.companyPaymentLink) {
          setInvoicePaymentLinkDraft(data.companyPaymentLink);
        }
        // Refresh lead to get all updated details including invoiceSentAt and companyPaymentLink
        await fetchLead();
        await fetchActivities();
        if (invoiceType === 'company') {
          await fetchInvoiceRevisions();
        }
        if (invoiceType === 'bank') {
          await fetchBankInvoiceRevisions();
        }
        const invoiceNumber = invoiceType === 'company' 
          ? (data.companyInvoiceNumber || data.invoiceNumber)
          : data.invoiceNumber;
        const successMsg = invoiceType === 'company' && lead.companyInvoiceSentAt
          ? `Revised invoice ${invoiceNumber} sent successfully!`
          : `Invoice ${invoiceNumber} generated and sent successfully!`;
        setSuccessMessage(successMsg);
        setTimeout(() => setSuccessMessage(null), 10000);
        
        // Show warning if present (non-blocking yellow note)
        if (data.warning) {
          setWarningMessage(data.warning);
          setTimeout(() => setWarningMessage(null), 10000);
        } else {
          setWarningMessage(null);
        }
      } else {
        // Error: response not ok OR data.ok === false
        const errorMsg = data?.error || data?.message || 'Failed to generate invoice';
        setError(errorMsg);
        setWarningMessage(null);
        console.error('[Invoice Generation]', errorMsg);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError('Failed to generate invoice');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Step 4: Customer Decision (handled automatically via decision page)
  const handleMarkApproved = async () => {
    await updateLead({ approved: true });
    await logActivity('approved', 'Customer approved');
  };

  const handleMarkDeclined = async () => {
    await updateLead({ approved: false });
    await logActivity('declined', 'Customer declined');
  };

  // Step 6: Payment
  const handleMarkPaymentReceived = async () => {
    try {
      await updateLead({ paymentReceivedAt: new Date() });
      await logActivity('payment_received', 'Payment received');
    } catch (error) {
      console.error('Error marking payment received:', error);
      setError('Failed to mark payment as received');
    }
  };

  const handleMarkCompanyCompleted = async () => {
    try {
      await updateLead({ companyCompletedAt: new Date() });
      await logActivity('company_completed', 'Company setup completed');
      
      // Refresh lead data to ensure UI updates
      await fetchLead();
      
      // Send completion email after completion
      try {
        const response = await fetch(`/api/leads/${id}/email/completion`, {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          await logActivity('review_email_sent', `Completion email sent${data.googleReviewRequested ? ' (with Google review request)' : ''}`);
        } else {
          const error = await response.json();
          console.error('Failed to send completion email:', error);
        }
      } catch (err) {
        console.error('Error sending completion email:', err);
        // Don't fail the completion if email fails
      }
    } catch (error) {
      console.error('Error marking company as completed:', error);
      setError('Failed to mark company setup as completed');
    }
  };

  // Bank Project handlers (same logic)
  // Bank invoice generation uses handleGenerateInvoice('bank')

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
    
    // Send completion email after completion
    try {
      const response = await fetch(`/api/leads/${id}/email/completion`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        await logActivity('review_email_sent', `Completion email sent${data.googleReviewRequested ? ' (with Google review request)' : ''}`);
      } else {
        const error = await response.json();
        console.error('Failed to send completion email:', error);
      }
    } catch (err) {
      console.error('Error sending completion email:', err);
      // Don't fail the completion if email fails
    }
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

  // Use shared workflow functions
  const currentStatus = getStatus(lead as LeadWorkflowData, leadType);
  const currentNextAction = getNextAction(lead as LeadWorkflowData, leadType);

  return (
    <>
      {/* DashboardRefresh disabled on lead details page to prevent interference with manual actions */}
      {/* <DashboardRefresh interval={30000} /> */}
      <div className="min-h-screen bg-[#faf8f3]">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link 
            href="/admin/leads" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Leads
          </Link>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 font-medium">Lead information updated successfully!</p>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            </div>
          )}
          {warningMessage && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-700 font-medium">{warningMessage}</p>
              </div>
            </div>
          )}


          {/* Header */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{lead.fullName}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    {getServiceDisplayName(lead)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Assigned to: <span className="font-semibold text-gray-900">
                    {(() => {
                      // Handle both grouped and flat response formats
                      const allAssignments = Array.isArray(assignedAgentsForSummary) ? assignedAgentsForSummary : 
                                            ((assignedAgentsForSummary as any)?.all || []);
                      const summaryAny = assignedAgentsForSummary as any;
                      const companyAgents = (Array.isArray(assignedAgentsForSummary) ? [] : (summaryAny?.company || [])) || allAssignments.filter((a: any) => a.serviceType === 'company');
                      const bankAgents = (Array.isArray(assignedAgentsForSummary) ? [] : (summaryAny?.bank || [])) || allAssignments.filter((a: any) => a.serviceType === 'bank');
                      
                      const currentCompany = companyAgents.find((la: any) => la.isCurrent);
                      const currentBanks = bankAgents.filter((la: any) => la.isCurrent);
                      
                      const parts: string[] = [];
                      
                      if (currentCompany && currentCompany.agent) {
                        const statusLabel = getStatusLabel(currentCompany.status);
                        parts.push(`${currentCompany.agent.name}${statusLabel ? ` (${statusLabel})` : ''}`);
                      }
                      
                      if (currentBanks.length > 0) {
                        const bankParts = currentBanks.map((la: any) => {
                          const statusLabel = getStatusLabel(la.status);
                          const bankInfo = la.bankName ? ` - ${la.bankName}` : '';
                          return `${la.agent.name}${bankInfo}${statusLabel ? ` (${statusLabel})` : ''}`;
                        });
                        parts.push(...bankParts);
                      }
                      
                      return parts.length > 0 ? parts.join(', ') : 'Unassigned';
                    })()}
                  </span></span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-5 py-4 border-2 border-gray-300 shadow-sm">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Current Status</div>
                  <div className="text-xl font-bold text-gray-900 mb-1">{currentStatus}</div>
                  <div className="text-xs text-indigo-600 font-medium mt-2">Next: {currentNextAction}</div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditData({
                        fullName: lead.fullName,
                        whatsapp: lead.whatsapp,
                        email: lead.email,
                        nationality: lead.nationality,
                        residenceCountry: lead.residenceCountry,
                        emirate: lead.emirate,
                        setupType: lead.setupType || undefined,
                        activity: lead.activity,
                        shareholdersCount: lead.shareholdersCount,
                        visasRequired: lead.visasRequired,
                        visasCount: lead.visasCount,
                        timeline: lead.timeline,
                        notes: lead.notes,
                        assignedAgent: lead.assignedAgent,
                      });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Lead
                  </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      // Validate phone if present
                      if (editData.whatsapp) {
                        const normalized = normalizePhone(editData.whatsapp);
                        if (!isValidE164(normalized)) {
                          setPhoneError('Please enter phone with country code, e.g. +97150xxxxxxx');
                          setError('Please fix phone number format before saving');
                          return;
                        }
                        // Update editData with normalized phone
                        editData.whatsapp = normalized;
                      }
                      
                      setSaving(true);
                      setSaveSuccess(false);
                      setPhoneError('');
                      setError('');
                      try {
                        await updateLead(editData);
                        setIsEditing(false);
                        setEditData({});
                        setError('');
                        setPhoneError('');
                        setSaveSuccess(true);
                        // When service type is updated, do NOT trigger auto-assignment
                        // Keep the auto-assign flag as true to prevent reassignment
                        setTimeout(() => setSaveSuccess(false), 3000);
                      } catch (err) {
                        setError('Failed to save changes');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({});
                      setError('');
                      setSaveSuccess(false);
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client & Request Info */}
        {/* ⚠️ CLIENT & REQUEST SECTION - FINALIZED & APPROVED ⚠️
            This section has been reviewed and approved. All fields are correctly displayed:
            - For company setup: Client details (Full Name, WhatsApp, Email, Nationality, Residence Country, Preferred Emirate, Business Activity, Shareholders, Visas, Timeline)
            - For bank account setup: Client details (Full Name, WhatsApp, Email) + Bank Account Prescreen fields
            - Additional Notes (only user-entered notes from form, excluding bank details and lead reference)
            Customer form notes are shown here, NOT in the bottom notes section.
            Please do not modify without careful review and approval.
        */}
        <div className={`bg-white shadow-lg rounded-xl border border-gray-100 p-8 mb-8 transition-all duration-200 ${isEditing ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Client & Request</h2>
            </div>
            {isEditing && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editing Mode
              </span>
            )}
          </div>
          {(() => {
            const { customerNotes, adminNotes, monthlyTurnover, existingUaeBankAccount, companyJurisdiction, companyStatus } = parseNotesAndBankDetails(lead.notes);
            // Extract lead reference from notes
            const leadRefMatch = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
            const leadRef = leadRefMatch ? leadRefMatch[1] : null;
            
            // Check if this is a bank account lead
            const isBankLead = lead.setupType === 'bank';
            
            // Parse bank prescreen data if available
            let bankPrescreen: any = null;
            if (isBankLead && lead.serviceDetails) {
              try {
                const serviceDetails = typeof lead.serviceDetails === 'string' 
                  ? JSON.parse(lead.serviceDetails) 
                  : lead.serviceDetails;
                bankPrescreen = serviceDetails?.bankAccountPrescreen;
              } catch (e) {
                console.error('Error parsing serviceDetails:', e);
              }
            }
            
            // Helper functions for bank form
            const formatUaeSetupType = (type: string) => {
              const map: Record<string, string> = {
                'MAINLAND': 'Mainland',
                'FREE_ZONE': 'Free Zone',
                'OFFSHORE': 'Offshore'
              };
              return map[type] || type;
            };

            const formatActivityCategory = (category: string) => {
              const map: Record<string, string> = {
                'GENERAL_TRADING': 'General Trading',
                'TRADING_SPECIFIC_GOODS': 'Trading (specific goods)',
                'SERVICES_CONSULTANCY': 'Services / Consultancy',
                'IT_SOFTWARE': 'IT / Software',
                'MARKETING_MEDIA': 'Marketing / Media',
                'ECOMMERCE': 'E-commerce',
                'LOGISTICS_SHIPPING': 'Logistics / Shipping',
                'MANUFACTURING': 'Manufacturing',
                'REAL_ESTATE_RELATED': 'Real Estate related',
                'OTHER': 'Other'
              };
              return map[category] || category;
            };

            const formatTurnover = (turnover: string) => {
              const map: Record<string, string> = {
                'UNDER_100K': 'Under 100,000 AED',
                '100K_500K': '100,000 – 500,000 AED',
                '500K_2M': '500,000 – 2,000,000 AED',
                'OVER_2M': 'Over 2,000,000 AED'
              };
              return map[turnover] || turnover;
            };

            const formatGeography = (geo: string) => {
              const map: Record<string, string> = {
                'UAE': 'UAE',
                'GCC': 'GCC',
                'UK': 'UK',
                'EUROPE': 'Europe',
                'USA_CANADA': 'USA / Canada',
                'ASIA': 'Asia',
                'AFRICA': 'Africa',
                'OTHER': 'Other'
              };
              return map[geo] || geo;
            };
            
            // Render bank account form fields if it's a bank lead
            if (isBankLead && bankPrescreen) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leadRef && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Reference</label>
                      <p className="text-gray-900 font-mono font-semibold">{leadRef}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      />
                    ) : (
                      <p className="text-gray-900">{lead.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="tel"
                          value={editData.whatsapp || ''}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^+\d]/g, '');
                            setEditData({ ...editData, whatsapp: cleaned });
                            setPhoneError('');
                          }}
                          onBlur={(e) => {
                            const phoneValue = e.target.value;
                            if (phoneValue) {
                              const normalized = normalizePhone(phoneValue);
                              setEditData({ ...editData, whatsapp: normalized });
                              if (!isValidE164(normalized)) {
                                setPhoneError('Please enter phone with country code, e.g. +97150xxxxxxx');
                              } else {
                                setPhoneError('');
                              }
                            } else {
                              setPhoneError('');
                            }
                          }}
                          className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+97150xxxxxxx"
                        />
                        {phoneError && (
                          <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">{lead.whatsapp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value || null })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Not provided"
                      />
                    ) : lead.email ? (
                      <p className="text-gray-900">{lead.email}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not provided</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    {isEditing ? (
                      <select
                        value={editData.setupType || ''}
                        onChange={(e) => setEditData({ ...editData, setupType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      >
                        <option value="bank">Bank Account Setup</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">Bank Account Setup</p>
                    )}
                  </div>
                  
                  {/* Bank Account Prescreen Fields */}
                  {bankPrescreen.uaeSetupType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UAE Setup Type</label>
                      <p className="text-gray-900">{formatUaeSetupType(bankPrescreen.uaeSetupType)}</p>
                    </div>
                  )}
                  {bankPrescreen.primaryActivityCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Business Activity</label>
                      <p className="text-gray-900">{formatActivityCategory(bankPrescreen.primaryActivityCategory)}</p>
                    </div>
                  )}
                  {bankPrescreen.primaryActivityDetails && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Activity Details</label>
                      <p className="text-gray-900">{bankPrescreen.primaryActivityDetails}</p>
                    </div>
                  )}
                  {bankPrescreen.ownerUaeResident && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Is the business owner a UAE resident?</label>
                      <p className="text-gray-900">{bankPrescreen.ownerUaeResident === 'yes' ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {bankPrescreen.uboNationality && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UBO's Nationality</label>
                      <p className="text-gray-900">{bankPrescreen.uboNationality}</p>
                      <small className="text-xs text-gray-500 mt-1 block">UBO (Ultimate Beneficial Owner) is the person who owns majority control of the company (typically 25% or more ownership or significant decision-making authority).</small>
                    </div>
                  )}
                  {bankPrescreen.expectedMonthlyTurnoverAed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Monthly Turnover (AED)</label>
                      <p className="text-gray-900">{formatTurnover(bankPrescreen.expectedMonthlyTurnoverAed)}</p>
                    </div>
                  )}
                  {bankPrescreen.paymentGeographies && bankPrescreen.paymentGeographies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Geographies</label>
                      <p className="text-gray-900">
                        {Array.isArray(bankPrescreen.paymentGeographies)
                          ? bankPrescreen.paymentGeographies.map(formatGeography).join(', ')
                          : formatGeography(bankPrescreen.paymentGeographies)}
                      </p>
                    </div>
                  )}
                  {bankPrescreen.paymentGeographiesOther && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Geographies</label>
                      <p className="text-gray-900">{bankPrescreen.paymentGeographiesOther}</p>
                    </div>
                  )}
                  {bankPrescreen.involvesCrypto !== undefined && bankPrescreen.involvesCrypto !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Crypto / Digital Assets Involved?</label>
                      <p className="text-gray-900">{bankPrescreen.involvesCrypto === 'yes' ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {bankPrescreen.cashIntensive !== undefined && bankPrescreen.cashIntensive !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cash-Intensive Business?</label>
                      <p className="text-gray-900">{bankPrescreen.cashIntensive === 'yes' ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {bankPrescreen.sanctionedHighRiskCountries !== undefined && bankPrescreen.sanctionedHighRiskCountries !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sanctioned / High-Risk Countries Expected?</label>
                      <p className="text-gray-900">{bankPrescreen.sanctionedHighRiskCountries === 'yes' ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {bankPrescreen.kycDocsReady && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Can you provide standard KYC documents?</label>
                      <p className="text-gray-900">{bankPrescreen.kycDocsReady === 'YES' ? 'Yes' : 'Not yet'}</p>
                    </div>
                  )}
                  
                  {customerNotes ? (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes <span className="text-xs font-normal text-gray-500 italic">(from customer form)</span>
                      </label>
                      {isEditing ? (
                        <textarea
                          value={(() => {
                            const { customerNotes: editCustomerNotes } = parseNotesAndBankDetails(editData.notes || lead.notes);
                            return editCustomerNotes || '';
                          })()}
                          onChange={(e) => {
                            const { adminNotes: existingAdminNotes } = parseNotesAndBankDetails(lead.notes);
                            let newNotes = e.target.value || '';
                            
                            if (existingAdminNotes && existingAdminNotes.trim()) {
                              newNotes += (newNotes ? '\n\n' : '') + '--- Admin Notes ---\n' + existingAdminNotes.trim();
                            }
                            
                            const leadRefMatch = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
                            if (leadRefMatch) {
                              newNotes += (newNotes ? '\n\n' : '') + `Lead Reference: ${leadRefMatch[1]}`;
                            }
                            
                            setEditData({ ...editData, notes: newNotes || null });
                          }}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Not provided"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">{customerNotes}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            }
            
            // Render company setup form fields
            return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadRef && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Reference</label>
                <p className="text-gray-900 font-mono font-semibold">{leadRef}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.fullName || ''}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900">{lead.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={editData.whatsapp || ''}
                    onChange={(e) => {
                      // Remove any characters that are not + or digits
                      const cleaned = e.target.value.replace(/[^+\d]/g, '');
                      setEditData({ ...editData, whatsapp: cleaned });
                      // Clear error on input (no validation while typing)
                      setPhoneError('');
                    }}
                    onBlur={(e) => {
                      const phoneValue = e.target.value;
                      if (phoneValue) {
                        // Normalize phone number
                        const normalized = normalizePhone(phoneValue);
                        // Set normalized value back into input
                        setEditData({ ...editData, whatsapp: normalized });
                        // Validate normalized value
                        if (!isValidE164(normalized)) {
                          setPhoneError('Please enter phone with country code, e.g. +97150xxxxxxx');
                        } else {
                          setPhoneError('');
                        }
                      } else {
                        setPhoneError('');
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+97150xxxxxxx"
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{lead.whatsapp}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Not provided"
                />
              ) : lead.email ? (
                <p className="text-gray-900">{lead.email}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              {isEditing ? (
                <select
                  value={editData.setupType || ''}
                  onChange={(e) => setEditData({ ...editData, setupType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="mainland">Mainland Company Setup</option>
                  <option value="freezone">Free Zone Company Setup</option>
                  <option value="offshore">Offshore Company Setup</option>
                  <option value="bank">Bank Account Setup</option>
                </select>
              ) : (
                <p className="text-gray-900">{getServiceDisplayName(lead)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.nationality || ''}
                  onChange={(e) => setEditData({ ...editData, nationality: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Not provided"
                />
              ) : lead.nationality ? (
                <p className="text-gray-900">{lead.nationality}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residence Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.residenceCountry || ''}
                  onChange={(e) => setEditData({ ...editData, residenceCountry: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Not provided"
                />
              ) : lead.residenceCountry ? (
                <p className="text-gray-900">{lead.residenceCountry}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Emirate</label>
              {isEditing ? (
                <select
                  value={editData.emirate || ''}
                  onChange={(e) => setEditData({ ...editData, emirate: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Not specified</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              ) : lead.emirate ? (
                <p className="text-gray-900">{lead.emirate}</p>
              ) : (
                <p className="text-gray-400 italic">Not specified</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Activity</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.activity || ''}
                  onChange={(e) => setEditData({ ...editData, activity: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Not provided"
                />
              ) : lead.activity ? (
                <p className="text-gray-900">{lead.activity}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Shareholders</label>
              {isEditing ? (
                <select
                  value={editData.shareholdersCount?.toString() || ''}
                  onChange={(e) => setEditData({ ...editData, shareholdersCount: e.target.value ? (e.target.value.includes('+') ? 4 : parseInt(e.target.value)) : null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Not provided</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              ) : lead.shareholdersCount !== null && lead.shareholdersCount !== undefined ? (
                <p className="text-gray-900">{lead.shareholdersCount}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visas Required?</label>
              {isEditing ? (
                <select
                  value={editData.visasRequired === null ? '' : editData.visasRequired ? 'yes' : 'no'}
                  onChange={(e) => setEditData({ ...editData, visasRequired: e.target.value === '' ? null : e.target.value === 'yes' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Not provided</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              ) : lead.visasRequired !== null && lead.visasRequired !== undefined ? (
                <p className="text-gray-900">{lead.visasRequired ? 'Yes' : 'No'}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            {lead.visasRequired === true && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How many visas?</label>
                {isEditing ? (
                  <select
                    value={editData.visasCount?.toString() || ''}
                    onChange={(e) => setEditData({ ...editData, visasCount: e.target.value ? (e.target.value.includes('+') ? 4 : parseInt(e.target.value)) : null })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">Not provided</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                ) : lead.visasCount !== null && lead.visasCount !== undefined ? (
                  <p className="text-gray-900">{lead.visasCount}</p>
                ) : (
                  <p className="text-gray-400 italic">Not provided</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.timeline || ''}
                  onChange={(e) => setEditData({ ...editData, timeline: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Not provided"
                />
              ) : lead.timeline ? (
                <p className="text-gray-900">{formatTimeline(lead.timeline)}</p>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>
            {monthlyTurnover && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Turnover</label>
                <p className="text-gray-900">{monthlyTurnover}</p>
              </div>
            )}
            {existingUaeBankAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing UAE Bank Account</label>
                <p className="text-gray-900">{existingUaeBankAccount}</p>
              </div>
            )}
            {companyJurisdiction && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Jurisdiction</label>
                <p className="text-gray-900">{companyJurisdiction}</p>
              </div>
            )}
            {companyStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Status</label>
                <p className="text-gray-900">{companyStatus}</p>
              </div>
            )}
            {customerNotes ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes <span className="text-xs font-normal text-gray-500 italic">(from customer form)</span>
                </label>
                {isEditing ? (
                  <textarea
                    value={(() => {
                      // When editing, show only customer notes (not admin notes)
                      const { customerNotes: editCustomerNotes } = parseNotesAndBankDetails(editData.notes || lead.notes);
                      return editCustomerNotes || '';
                    })()}
                    onChange={(e) => {
                      // When user edits customer notes, we need to reconstruct full notes with admin notes and bank details preserved
                      const { adminNotes: existingAdminNotes, monthlyTurnover, existingUaeBankAccount, companyJurisdiction, companyStatus } = parseNotesAndBankDetails(lead.notes);
                      let newNotes = e.target.value || '';
                      
                      // Add admin notes if they exist (with separator)
                      if (existingAdminNotes && existingAdminNotes.trim()) {
                        newNotes += (newNotes ? '\n\n' : '') + '--- Admin Notes ---\n' + existingAdminNotes.trim();
                      }
                      
                      // Reconstruct bank details section if they exist
                      const bankFields = [];
                      if (companyJurisdiction) bankFields.push(`Company Jurisdiction: ${companyJurisdiction}`);
                      if (companyStatus) bankFields.push(`Company Status: ${companyStatus}`);
                      if (monthlyTurnover) bankFields.push(`Monthly Turnover: ${monthlyTurnover}`);
                      if (existingUaeBankAccount) bankFields.push(`Existing UAE Bank Account: ${existingUaeBankAccount}`);
                      
                      if (bankFields.length > 0) {
                        newNotes += (newNotes ? '\n\n' : '') + 'Bank Account Details:\n' + bankFields.join('\n');
                      }
                      
                      // Add lead reference
                      const leadRefMatch = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
                      if (leadRefMatch) {
                        newNotes += (newNotes ? '\n\n' : '') + `Lead Reference: ${leadRefMatch[1]}`;
                      }
                      
                      setEditData({ ...editData, notes: newNotes || null });
                    }}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Not provided"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{customerNotes}</p>
                )}
              </div>
            ) : null}
          </div>
            );
          })()}
        </div>

        {/* Bank Account Prescreen Details */}
        {lead.setupType === 'bank' && lead.serviceDetails && (() => {
          try {
            const serviceDetails = typeof lead.serviceDetails === 'string' 
              ? JSON.parse(lead.serviceDetails) 
              : lead.serviceDetails;
            const prescreen = serviceDetails?.bankAccountPrescreen;
            
            if (!prescreen) return null;

            // Helper functions to format values
            const formatUaeSetupType = (type: string) => {
              const map: Record<string, string> = {
                'MAINLAND': 'Mainland',
                'FREE_ZONE': 'Free Zone',
                'OFFSHORE': 'Offshore'
              };
              return map[type] || type;
            };

            const formatActivityCategory = (category: string) => {
              const map: Record<string, string> = {
                'GENERAL_TRADING': 'General Trading',
                'TRADING_SPECIFIC_GOODS': 'Trading (specific goods)',
                'SERVICES_CONSULTANCY': 'Services / Consultancy',
                'IT_SOFTWARE': 'IT / Software',
                'MARKETING_MEDIA': 'Marketing / Media',
                'ECOMMERCE': 'E-commerce',
                'LOGISTICS_SHIPPING': 'Logistics / Shipping',
                'MANUFACTURING': 'Manufacturing',
                'REAL_ESTATE_RELATED': 'Real Estate related',
                'OTHER': 'Other'
              };
              return map[category] || category;
            };

            const formatTurnover = (turnover: string) => {
              const map: Record<string, string> = {
                'UNDER_100K': 'Under 100,000 AED',
                '100K_500K': '100,000 – 500,000 AED',
                '500K_2M': '500,000 – 2,000,000 AED',
                'OVER_2M': 'Over 2,000,000 AED'
              };
              return map[turnover] || turnover;
            };

            const formatGeography = (geo: string) => {
              const map: Record<string, string> = {
                'UAE': 'UAE',
                'GCC': 'GCC',
                'UK': 'UK',
                'EUROPE': 'Europe',
                'USA_CANADA': 'USA / Canada',
                'ASIA': 'Asia',
                'AFRICA': 'Africa',
                'OTHER': 'Other'
              };
              return map[geo] || geo;
            };

            return (
              <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Bank Account Prescreen Details</h2>
                  </div>
                  <button
                    onClick={() => setPrescreenExpanded(!prescreenExpanded)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {prescreenExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {prescreenExpanded && (
                  <div className="space-y-6">
                    {/* Business Snapshot */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Business Snapshot</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prescreen.uaeSetupType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UAE Setup Type</label>
                            <p className="text-gray-900">{formatUaeSetupType(prescreen.uaeSetupType)}</p>
                          </div>
                        )}
                        {prescreen.primaryActivityCategory && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Business Activity</label>
                            <p className="text-gray-900">{formatActivityCategory(prescreen.primaryActivityCategory)}</p>
                          </div>
                        )}
                        {prescreen.primaryActivityDetails && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Details</label>
                            <p className="text-gray-900">{prescreen.primaryActivityDetails}</p>
                          </div>
                        )}
                        {prescreen.ownerUaeResident && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner UAE Resident</label>
                            <p className="text-gray-900">{prescreen.ownerUaeResident === 'yes' ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {prescreen.uboNationality && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UBO's Nationality</label>
                            <p className="text-gray-900">{prescreen.uboNationality}</p>
                            <small className="text-xs text-gray-500 mt-1 block">UBO (Ultimate Beneficial Owner) is the person who owns majority control of the company (typically 25% or more ownership or significant decision-making authority).</small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expected Account Use */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Expected Account Use</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prescreen.expectedMonthlyTurnoverAed && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Monthly Turnover</label>
                            <p className="text-gray-900">{formatTurnover(prescreen.expectedMonthlyTurnoverAed)}</p>
                          </div>
                        )}
                        {prescreen.paymentGeographies && prescreen.paymentGeographies.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Geographies</label>
                            <p className="text-gray-900">
                              {Array.isArray(prescreen.paymentGeographies)
                                ? prescreen.paymentGeographies.map(formatGeography).join(', ')
                                : formatGeography(prescreen.paymentGeographies)}
                            </p>
                          </div>
                        )}
                        {prescreen.paymentGeographiesOther && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Other Geographies</label>
                            <p className="text-gray-900">{prescreen.paymentGeographiesOther}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compliance Flags */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Compliance Flags</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {prescreen.involvesCrypto !== undefined && prescreen.involvesCrypto !== null && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crypto / Digital Assets Involved</label>
                            <p className="text-gray-900">{prescreen.involvesCrypto === 'yes' ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {prescreen.cashIntensive !== undefined && prescreen.cashIntensive !== null && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cash-Intensive Business</label>
                            <p className="text-gray-900">{prescreen.cashIntensive === 'yes' ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {prescreen.sanctionedHighRiskCountries !== undefined && prescreen.sanctionedHighRiskCountries !== null && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sanctioned / High-Risk Countries</label>
                            <p className="text-gray-900">{prescreen.sanctionedHighRiskCountries === 'yes' ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Readiness */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Readiness</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prescreen.kycDocsReady && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KYC Documents Ready</label>
                            <p className="text-gray-900">{prescreen.kycDocsReady === 'YES' ? 'Yes' : 'Not yet'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          } catch (e) {
            console.error('Error parsing serviceDetails:', e);
            return null;
          }
        })()}

        {/* Company Deal Workflow */}
        {/* ⚠️ COMPANY DEAL WORKFLOW SECTION - FINALIZED & APPROVED ⚠️
            This section has been reviewed and approved for company setup.
            The workflow includes:
            - Step 1: Agent Contact (Company Setup Agents)
            - Step 2: Feasibility & Quote
            - Step 3: Send Quote
            - Step 4: Customer Decision
            - Step 5: Generate & Send Invoice
            - Step 6: Payment (with payment reminder functionality)
            - Step 7: Work in Progress
            - Step 8: Completion
            - Invoice History (for company invoices)
            Please do not modify without careful review and approval.
        */}
        {companyActive && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-10 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">{projectLabel}</h2>
          </div>

          {/* Step 1: Agent Contact */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800">1. Agent Contact</h3>
              {!editingAgentContact && (
                <button
                  onClick={() => {
                    setEditingAgentContact(true);
                    setEditData({
                      ...editData,
                      agentContactedAt: lead.agentContactedAt,
                      assignedAgent: lead.assignedAgent,
                    });
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            {editingAgentContact ? (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent Contacted Date</label>
                  <input
                    type="datetime-local"
                    value={editData.agentContactedAt ? new Date(editData.agentContactedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                      setEditData({ ...editData, agentContactedAt: value as any });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Agents</label>
                  <div className="text-sm text-gray-500 italic">
                    Use the Agent Assignment section in the workflow below to manage agents
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={async () => {
                      await updateLead({
                        agentContactedAt: editData.agentContactedAt ? new Date(editData.agentContactedAt) : null,
                        assignedAgent: editData.assignedAgent,
                      });
                      setEditingAgentContact(false);
                      setEditData({});
                      if (editData.agentContactedAt) {
                        setFeasibilitySectionExpanded(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingAgentContact(false);
                      setEditData({});
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : !lead.agentContactedAt ? (
              <div className="space-y-3">
                <AgentAssignment 
                  leadId={id}
                  setupType={lead.setupType}
                  hasBankProject={false}
                  companyCompletedAt={lead.companyCompletedAt}
                  onAssign={async () => {
                    await fetchLead();
                    await fetchAssignedAgentsForSummary();
                  }}
                  onStatusChange={async () => {
                    await fetchLead();
                    await fetchAssignedAgentsForSummary();
                  }}
                />
                <button
                  onClick={async () => {
                    // Check if current agents are assigned before allowing send
                    const agentsResponse = await fetch(`/api/leads/${id}/agents`);
                    if (agentsResponse.ok) {
                      const data = await agentsResponse.json();
                      const allAssignments = data.all || data;
                      const hasCurrentAgent = allAssignments.some((a: any) => a.isCurrent);
                      if (!hasCurrentAgent) {
                        setError('Please set a current agent before sending WhatsApp.');
                        return;
                      }
                    }
                    await handleSendToAgent();
                    await fetchAssignedAgentsForSummary();
                    setFeasibilitySectionExpanded(true);
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Send WhatsApp to Agent'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Contacted: {formatDubaiTime(lead.agentContactedAt)}
                  </p>
                </div>
                <AgentAssignment 
                  leadId={id}
                  setupType={lead.setupType}
                  hasBankProject={false}
                  companyCompletedAt={lead.companyCompletedAt}
                  onAssign={async () => {
                    await fetchLead();
                    await fetchAssignedAgentsForSummary();
                  }}
                  onStatusChange={async () => {
                    await fetchLead();
                    await fetchAssignedAgentsForSummary();
                  }}
                />
              </div>
            )}
          </div>

          {/* Step 2: Feasibility & Quote */}
          {(lead.agentContactedAt || feasibilitySectionExpanded) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">2. Feasibility & Quote</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feasible</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feasible"
                        checked={quoteEditData.feasible === true || (quoteEditData.feasible === null && lead.feasible === true)}
                        onChange={(e) => {
                          setQuoteEditData({ 
                            ...quoteEditData, 
                            feasible: true,
                            quotedAmountAed: quoteEditData.quotedAmountAed !== null ? quoteEditData.quotedAmountAed : (lead.quotedAmountAed || null)
                          });
                        }}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feasible"
                        checked={quoteEditData.feasible === false || (quoteEditData.feasible === null && lead.feasible === false)}
                        onChange={(e) => {
                          setQuoteEditData({ 
                            ...quoteEditData, 
                            feasible: false,
                            quotedAmountAed: null
                          });
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                {(quoteEditData.feasible === true || (quoteEditData.feasible === null && lead.feasible === true)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quoted Amount (AED) *
                    </label>
                    <input
                      type="number"
                      value={quoteEditData.quotedAmountAed?.toString() || lead.quotedAmountAed?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setQuoteEditData({ ...quoteEditData, quotedAmountAed: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                )}
                {/* Save Quote button - only show when feasible is Yes */}
                {(quoteEditData.feasible === true || (quoteEditData.feasible === null && lead.feasible === true)) && (
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        setError('');
                        setSuccessMessage(null);
                        
                        // Validate quotedAmountAed only if feasible is true
                        let quotedAmountAedNumber: number | null = null;
                        const isFeasible = quoteEditData.feasible === true || (quoteEditData.feasible === null && lead.feasible === true);
                        
                        if (isFeasible) {
                          const amountToUse = quoteEditData.quotedAmountAed !== null && quoteEditData.quotedAmountAed !== undefined 
                            ? quoteEditData.quotedAmountAed 
                            : lead.quotedAmountAed;
                          
                          if (!amountToUse || (typeof amountToUse === 'string' && amountToUse === '')) {
                            setError('Quoted amount is required when feasible is Yes.');
                            setActionLoading(false);
                            setTimeout(() => setError(''), 5000);
                            return;
                          }
                          quotedAmountAedNumber = Number(amountToUse);
                          if (isNaN(quotedAmountAedNumber) || quotedAmountAedNumber <= 0) {
                            setError('Enter a valid amount in AED.');
                            setActionLoading(false);
                            setTimeout(() => setError(''), 5000);
                            return;
                          }
                        }
                      
                      try {
                        const response = await fetch(`/api/leads/${id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            feasible: quoteEditData.feasible,
                            quotedAmountAed: quotedAmountAedNumber,
                          }),
                        });
                        
                        // Safely parse response
                        let data: any = {};
                        try {
                          const contentType = response.headers.get('content-type');
                          if (contentType && contentType.includes('application/json')) {
                            data = await response.json();
                          } else {
                            const text = await response.text();
                            if (text) {
                              try {
                                data = JSON.parse(text);
                              } catch {
                                // Not JSON, use text as error message
                                data = { error: text || 'Request failed' };
                              }
                            }
                          }
                        } catch (parseErr: any) {
                          console.error('Error parsing response:', parseErr);
                          setError(`Request failed. Please check server logs.`);
                          setActionLoading(false);
                          return;
                        }
                        
                        if (response.ok) {
                          await fetchLead();
                          setSuccessMessage('Quote updated successfully');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        } else {
                          // Improved error reporting with HTTP status - safely read response body
                          let errorMessage = 'Unknown error';
                          
                          // Try to extract error message from response body
                          if (data.error) {
                            errorMessage = typeof data.error === 'string' 
                              ? data.error 
                              : JSON.stringify(data.error);
                          } else if (data.message) {
                            errorMessage = typeof data.message === 'string'
                              ? data.message
                              : JSON.stringify(data.message);
                          } else if (data.details) {
                            errorMessage = typeof data.details === 'string'
                              ? data.details
                              : JSON.stringify(data.details);
                          } else if (Object.keys(data).length > 0) {
                            errorMessage = JSON.stringify(data);
                          }
                          
                          setError(`Failed to update quote (HTTP ${response.status}): ${errorMessage}`);
                          setTimeout(() => setError(''), 8000);
                        }
                      } catch (err: any) {
                        console.error('Error updating quote:', err);
                        setError('Request failed. Please check server logs.');
                        setTimeout(() => setError(''), 5000);
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? 'Saving...' : 'Save Quote'}
                  </button>
                  </div>
                )}
                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
                {successMessage && (
                  <p className="text-xs text-green-600">{successMessage}</p>
                )}
                {(quoteEditData.feasible === false || (quoteEditData.feasible === null && lead.feasible === false)) && (
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        setError('');
                        setSuccessMessage(null);
                        try {
                          await updateLead({ 
                            feasible: false,
                            quotedAmountAed: null,
                          });
                          await logActivity('closed', 'Lead closed - not feasible');
                          setSuccessMessage('Lead marked as not feasible and closed');
                          setTimeout(() => setSuccessMessage(null), 3000);
                          await fetchLead();
                          // Reset quote edit data
                          setQuoteEditData({
                            feasible: false,
                            quotedAmountAed: null,
                          });
                        } catch (error) {
                          console.error('Error closing lead:', error);
                          setError('Failed to close lead');
                          setTimeout(() => setError(''), 5000);
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Closing...' : 'Close Lead'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Send Company Quote */}
          {lead.feasible === true && lead.quotedAmountAed && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-5">3. Send {quoteLabel}</h3>
              {!lead.companyQuoteSentAt ? (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const response = await fetch(`/api/leads/${id}/email/quote/company`, {
                          method: 'POST',
                        });
                        if (response.ok) {
                          await fetchLead();
                          setSuccessMessage(`${quoteLabel} email sent successfully!`);
                          setTimeout(() => setSuccessMessage(null), 5000);
                        } else {
                          const error = await response.json();
                          const errorMsg = `Failed to send quote email: ${error.error || 'Unknown error'}`;
                          setError(errorMsg);
                          console.error('[Quote Email]', errorMsg);
                          setTimeout(() => setError(''), 5000);
                        }
                      } catch (err) {
                        console.error('Error sending quote email:', err);
                        setError('Failed to send quote email');
                        setTimeout(() => setError(''), 5000);
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading || !lead.email}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send {quoteLabel}
                      </>
                    )}
                  </button>
                  {!lead.email && (
                    <p className="text-xs text-red-600 mt-2">Email address required to send quote</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-800">Quote Sent</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Sent on {formatDubaiTime(lead.companyQuoteSentAt!)}
                    </p>
                  </div>
                  
                  {/* Info: Quote already sent */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800">
                      Quote already sent. To send a new quote with a different amount, use Reset Quote Workflow first.
                    </p>
                  </div>
                  
                  {/* WhatsApp Notification Status */}
                  {lead.quoteWhatsAppSentAt ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">WhatsApp sent</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        {formatDubaiTime(lead.quoteWhatsAppSentAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm text-gray-600">WhatsApp not sent</span>
                      </div>
                      {!lead.whatsapp && !(lead as any).phone ? (
                        <p className="text-xs text-gray-500 mb-2">
                          No phone number available
                        </p>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              const phoneNumber = (lead as any).phone || lead.whatsapp;
                              if (!phoneNumber) {
                                setError('No phone number available');
                                setTimeout(() => setError(''), 5000);
                                return;
                              }

                              // Extract firstName from fullName
                              const firstName = lead.fullName?.split(' ')[0] || lead.fullName || 'there';
                              
                              // Build message (same as API endpoint)
                              const message = `Hi ${firstName}, your UAE Business Desk quote has been emailed to you. No payment is required at this stage. Please use the 'View Quote & Decide' link in the email to confirm whether you'd like to proceed.`;
                              
                              // Generate WhatsApp link and open it
                              const waUrl = waLink(phoneNumber, message);
                              window.open(waUrl, '_blank');
                              
                              // Show success message
                              setSuccessMessage('WhatsApp opened with pre-filled message. Please send it to the customer.');
                              setTimeout(() => setSuccessMessage(null), 5000);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Send WhatsApp Quote Reminder
                          </button>
                          {error && (
                            <p className="text-xs text-red-600 mt-2">{error}</p>
                          )}
                          {successMessage && (
                            <p className="text-xs text-green-600 mt-2">{successMessage}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Reset Quote Workflow - Production Safe */}
              {!lead.paymentReceivedAt && !lead.companyCompletedAt && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {!showResetConfirm ? (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        Resets quote decision + invoice state so you can send a new quote.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowResetConfirm(true);
                          setResetConfirmText('');
                          setResetConfirmChecked(false);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                      >
                        Reset Quote Workflow
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-xs font-semibold text-orange-800 mb-2">
                        Confirm Reset Quote Workflow
                      </p>
                      <p className="text-xs text-gray-700 mb-3">
                        This will reset all quote decision and invoice state. Type <strong>RESET</strong> to confirm:
                      </p>
                      <input
                        type="text"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        placeholder="Type RESET"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        autoFocus
                      />
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="reset-confirm-checkbox-combined"
                          checked={resetConfirmChecked}
                          onChange={(e) => setResetConfirmChecked(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="reset-confirm-checkbox-combined" className="text-xs text-gray-700">
                          I understand this will reset the quote workflow
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (resetConfirmText !== 'RESET' || !resetConfirmChecked) {
                              setError('Please type RESET and check the confirmation box');
                              setTimeout(() => setError(''), 3000);
                              return;
                            }
                            
                            setActionLoading(true);
                            setError('');
                            setSuccessMessage(null);
                            
                            try {
                              const response = await fetch(`/api/leads/${id}/reset-quote`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reason: 'Admin reset' }),
                              });
                              
                              let data: any = {};
                              const contentType = response.headers.get('content-type');
                              if (contentType && contentType.includes('application/json')) {
                                data = await response.json();
                              } else {
                                const text = await response.text();
                                try {
                                  data = JSON.parse(text);
                                } catch {
                                  data = { error: text || 'Request failed' };
                                }
                              }
                              
                              if (response.ok && data.ok) {
                                setSuccessMessage(data.message || 'Quote workflow reset successfully');
                                setShowResetConfirm(false);
                                setResetConfirmText('');
                                setResetConfirmChecked(false);
                                await fetchLead();
                                setTimeout(() => setSuccessMessage(null), 5000);
                              } else {
                                setError(data.error || 'Failed to reset quote workflow');
                                setTimeout(() => setError(''), 5000);
                              }
                            } catch (err) {
                              console.error('Error resetting quote workflow:', err);
                              setError('Failed to reset quote workflow');
                              setTimeout(() => setError(''), 5000);
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowResetConfirm(false);
                            setResetConfirmText('');
                            setResetConfirmChecked(false);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Customer Decision */}
          {lead.companyQuoteSentAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-5">4. Customer Decision</h3>
              
              {/* Decision Status */}
              <div className="space-y-4">
                {/* Approved - show if proceedConfirmedAt OR quoteApprovedAt OR approved === true */}
                {(lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.approved === true) && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base font-semibold text-green-800">Approved</span>
                    </div>
                    <p className="text-sm text-green-700 ml-9">
                      {lead.proceedConfirmedAt 
                        ? formatDubaiTime(lead.proceedConfirmedAt)
                        : lead.quoteApprovedAt 
                        ? formatDubaiTime(lead.quoteApprovedAt)
                        : 'Approved'}
                    </p>
                  </div>
                )}

                {/* Has Questions */}
                {lead.quoteQuestionsAt && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base font-semibold text-amber-800">Has Questions</span>
                    </div>
                    <p className="text-sm text-amber-700 mb-2 ml-9">
                      {formatDubaiTime(lead.quoteQuestionsAt)}
                    </p>
                    {lead.quoteQuestionsReason && (
                      <p className="text-sm text-amber-600 italic ml-9">
                        Notes: {lead.quoteQuestionsReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Declined */}
                {lead.quoteDeclinedAt && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base font-semibold text-red-800">Declined</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2 ml-9">
                      {formatDubaiTime(lead.quoteDeclinedAt)}
                    </p>
                    {lead.quoteDeclineReason && (
                      <p className="text-sm text-red-600 italic ml-9">
                        Reason: {lead.quoteDeclineReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Viewed - only show if not approved/declined/questions */}
                {lead.quoteViewedAt && !lead.proceedConfirmedAt && !lead.quoteApprovedAt && lead.approved !== true && !lead.quoteDeclinedAt && !lead.quoteQuestionsAt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-base font-semibold text-blue-800">Viewed</span>
                    </div>
                    <p className="text-sm text-blue-700 ml-9">
                      {formatDubaiTime(lead.quoteViewedAt)}
                    </p>
                  </div>
                )}

                {/* Waiting for decision - only show if not approved/declined/questions */}
                {!lead.proceedConfirmedAt && !lead.quoteApprovedAt && lead.approved !== true && !lead.quoteDeclinedAt && !lead.quoteQuestionsAt && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-base font-semibold text-amber-800 mb-1">
                            Waiting for customer decision
                          </p>
                          <p className="text-sm text-amber-700">
                            Quote sent on {formatDubaiTime(lead.companyQuoteSentAt!)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          fetchLead();
                          setSuccessMessage('Refreshing...');
                          setTimeout(() => setSuccessMessage(null), 2000);
                        }}
                        className="ml-4 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shadow-sm hover:shadow"
                        title="Refresh to check for customer decision"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Override Section */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Admin Override
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-4">Manually override customer decision:</p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <button
                        onClick={async () => {
                          if (!confirm('Mark this quote as Accepted? This will override any customer decision.')) {
                            return;
                          }
                          setActionLoading(true);
                          setError('');
                          try {
                            const response = await fetch(`/api/leads/${id}/override-decision`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ project: 'company', decision: 'accept' }),
                            });
                            if (response.ok) {
                              setSuccessMessage('Quote marked as Accepted');
                              fetchLead();
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } else {
                              const data = await response.json();
                              setError(data.error || 'Failed to override decision');
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to override decision');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Mark as Accepted
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Optional reason/notes for questions:');
                          if (reason === null) return; // User cancelled
                          setActionLoading(true);
                          setError('');
                          try {
                            const response = await fetch(`/api/leads/${id}/override-decision`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ project: 'company', decision: 'questions', reason: reason || undefined }),
                            });
                            if (response.ok) {
                              setSuccessMessage('Quote marked as Has Questions');
                              fetchLead();
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } else {
                              const data = await response.json();
                              setError(data.error || 'Failed to override decision');
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to override decision');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Mark as Has Questions
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Optional reason for decline:');
                          if (reason === null) return; // User cancelled
                          setActionLoading(true);
                          setError('');
                          try {
                            const response = await fetch(`/api/leads/${id}/override-decision`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ project: 'company', decision: 'decline', reason: reason || undefined }),
                            });
                            if (response.ok) {
                              setSuccessMessage('Quote marked as Declined');
                              fetchLead();
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } else {
                              const data = await response.json();
                              setError(data.error || 'Failed to override decision');
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to override decision');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Mark as Declined
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Step 5: Generate & Send Invoice */}
          {(() => {
            const isApproved = lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.approved === true;
            const isDeclined = lead.quoteDeclinedAt || lead.declinedAt;
            
            // Only show if approved and not declined
            if (!isApproved || isDeclined) return null;
            
            // Lock if payment received
            if (lead.paymentReceivedAt) {
              return (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-5">5. Generate & Send {serviceLabel} Invoice</h3>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Payment received — invoice cannot be revised</p>
                  </div>
                </div>
              );
            }
            
            // Check if invoice is outdated
            const isInvoiceOutdated = lead.companyInvoiceSentAt && 
                                     !lead.paymentReceivedAt && 
                                     lead.companyInvoiceAmountAed !== null && 
                                     lead.quotedAmountAed !== null &&
                                     lead.companyInvoiceAmountAed !== lead.quotedAmountAed;
            
            return (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">5. Generate & Send Invoice</h3>
                
                {/* Automatic invoice outdated banner */}
                {isInvoiceOutdated && (
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-400 rounded-lg p-5 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-base font-bold text-red-800 mb-2">
                          Invoice Outdated
                        </p>
                        <p className="text-sm text-red-700 mb-3">
                          The quote amount has changed since the last invoice was sent. Please send a revised invoice to reflect the updated amount.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-red-700 mb-4">
                          <span>
                            <strong>Last invoice:</strong> AED {lead.companyInvoiceAmountAed?.toLocaleString() || 'N/A'}
                          </span>
                          <span className="text-red-500">→</span>
                          <span>
                            <strong>Current quote:</strong> AED {lead.quotedAmountAed?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-red-800 mb-2">
                            Payment Link (Ziina) <span className="text-red-600 text-xs">(HTTPS required)</span>
                          </label>
                          <input
                            type="url"
                            value={invoicePaymentLinkDraft}
                            onChange={(e) => {
                              setInvoicePaymentLinkDraft(e.target.value);
                              setPaymentLinkError(null);
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white ${
                              paymentLinkError ? 'border-red-500' : 'border-red-300'
                            }`}
                            placeholder="https://ziina.com/payment/..."
                          />
                          {paymentLinkError && (
                            <p className="mt-1 text-xs text-red-600">{paymentLinkError}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleGenerateInvoice('company')}
                          disabled={actionLoading || !!paymentLinkError}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg hover:from-red-700 hover:to-amber-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {actionLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending Revised Invoice...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Send Revised Invoice
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* If invoice never sent */}
                {!lead.companyInvoiceSentAt ? (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                    {/* Payment Link Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Link (Ziina) <span className="text-gray-500 text-xs">(HTTPS required)</span>
                      </label>
                      <input
                        type="url"
                        value={invoicePaymentLinkDraft}
                        onChange={(e) => {
                          setInvoicePaymentLinkDraft(e.target.value);
                          setPaymentLinkError(null);
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          paymentLinkError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://ziina.com/payment/..."
                      />
                      {paymentLinkError && (
                        <p className="mt-1 text-xs text-red-600">{paymentLinkError}</p>
                      )}
                      {invoicePaymentLinkDraft && !paymentLinkError && (
                        <a
                          href={invoicePaymentLinkDraft}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-flex items-center gap-1"
                        >
                          Open payment link
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleGenerateInvoice('company')}
                      disabled={actionLoading || !!paymentLinkError}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Generate & Send Invoice
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Invoice will be generated and sent to {lead.email || lead.whatsapp}
                    </p>
                  </div>
                ) : (
                  /* If invoice already sent and payment not received */
                  <div className="space-y-4">
                    {/* Current Invoice Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-green-800">Invoice Sent</span>
                            {lead.companyInvoiceVersion && lead.companyInvoiceVersion > 1 && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                                v{lead.companyInvoiceVersion}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            Sent on {formatDubaiTime(lead.companyInvoiceSentAt!)}
                          </p>
                          {lead.companyInvoiceAmountAed !== null && (
                            <p className="text-xs text-gray-600 mb-1">
                              Invoice amount: AED {lead.companyInvoiceAmountAed.toLocaleString()}
                            </p>
                          )}
                          {lead.quotedAmountAed !== null && (
                            <p className="text-xs text-gray-600">
                              Current quote: AED {lead.quotedAmountAed.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                          <p className="text-sm font-mono font-semibold text-gray-900">{lead.companyInvoiceNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {lead.companyInvoiceSentAt && (lead as any).companyInvoiceHtml && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/invoice/view-link?leadId=${lead.id}`);
                                const data = await response.json();
                                if (data.ok && data.invoiceViewUrl) {
                                  window.open(data.invoiceViewUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  setError(data.error || 'Failed to open invoice view');
                                  setTimeout(() => setError(''), 5000);
                                }
                              } catch (error) {
                                console.error('Error fetching invoice view link:', error);
                                setError('Failed to open invoice view');
                                setTimeout(() => setError(''), 5000);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Invoice
                          </button>
                        )}
                        {lead.companyPaymentLink ? (
                          <a
                            href={lead.companyPaymentLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open Payment Link
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Payment link not available.</p>
                        )}
                      </div>
                    </div>


                    {/* Editable Payment Link and Send Revised Invoice */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Link (Ziina) <span className="text-gray-500 text-xs">(HTTPS required)</span>
                        </label>
                        <input
                          type="url"
                          value={invoicePaymentLinkDraft}
                          onChange={(e) => {
                            setInvoicePaymentLinkDraft(e.target.value);
                            setPaymentLinkError(null);
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                            paymentLinkError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="https://ziina.com/payment/..."
                        />
                        {paymentLinkError && (
                          <p className="mt-1 text-xs text-red-600">{paymentLinkError}</p>
                        )}
                        {invoicePaymentLinkDraft && !paymentLinkError && (
                          <a
                            href={invoicePaymentLinkDraft}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-flex items-center gap-1"
                          >
                            Open payment link
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleGenerateInvoice('company')}
                        disabled={actionLoading || !!paymentLinkError}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {actionLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Revised Invoice...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Send Revised Invoice
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Invoice History */}
          {lead.companyInvoiceSentAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-5">Invoice History</h3>
              {invoiceRevisions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No invoices sent yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoiceRevisions.map((revision) => (
                    <div
                      key={revision.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">
                          R{revision.version}
                        </span>
                        <span className="text-sm text-gray-600">
                          AED {revision.amountAed.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          • Sent on {formatDubaiTime(revision.sentAt)}
                        </span>
                        {revision.invoiceNumber && (
                          <span className="text-xs text-gray-500 font-mono">
                            • {revision.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/invoice/view-link?leadId=${id}&version=${revision.version}`);
                            const data = await response.json();
                            if (data.ok && data.invoiceViewUrl) {
                              window.open(data.invoiceViewUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              setError(data.error || 'Failed to open invoice view');
                              setTimeout(() => setError(''), 5000);
                            }
                          } catch (error) {
                            console.error('Error fetching invoice view link:', error);
                            setError('Failed to open invoice view');
                            setTimeout(() => setError(''), 5000);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Declined state - show neutral note */}
          {lead.quoteDeclinedAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-700">
                  Customer declined — no further action required.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Payment */}
          {lead.companyInvoiceSentAt && !lead.paymentReceivedAt && !lead.quoteDeclinedAt && !lead.declinedAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              {/* Payment Reminder Stamp - Show at top of Payment section if reminder sent */}
              {/* The stamp appears here, right at the top of the Payment section, before the "4. Payment" header */}
              {!!(lead.paymentReminderSentAt || (lead.paymentReminderCount && lead.paymentReminderCount > 0)) && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                          PAYMENT REMINDER SENT
                        </span>
                        <span className="text-xs font-semibold text-amber-800">
                          #{lead.paymentReminderCount || 0} {(lead.paymentReminderCount || 0) === 1 ? 'Reminder' : 'Reminders'}
                        </span>
                      </div>
                      {lead.paymentReminderSentAt && (
                        <p className="text-sm font-medium text-amber-900">
                          Last sent: {formatDubaiTime(lead.paymentReminderSentAt)}
                        </p>
                      )}
                      <p className="text-xs text-amber-700 mt-1">
                        Please check before sending another reminder to avoid duplicates.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">6. Payment</h3>
                {!editingPaymentCompletion && (
                  <button
                    onClick={() => {
                      setEditingPaymentCompletion('company');
                      setEditData({
                        ...editData,
                        paymentReceivedAt: lead.paymentReceivedAt,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingPaymentCompletion === 'company' ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Received Date</label>
                    <input
                      type="datetime-local"
                      value={editData.paymentReceivedAt ? new Date(editData.paymentReceivedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setEditData({ ...editData, paymentReceivedAt: value as any });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={async () => {
                        await updateLead({
                          paymentReceivedAt: editData.paymentReceivedAt ? new Date(editData.paymentReceivedAt) : null,
                        });
                        setEditingPaymentCompletion(null);
                        setEditData({});
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPaymentCompletion(null);
                        setEditData({});
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!lead.paymentReceivedAt ? (
                    <>
                      <button
                        onClick={handleMarkPaymentReceived}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Payment Received
                      </button>
                      
                      {/* Payment Reminder Button */}
                      <div className="mt-4">
                        <button
                          onClick={async () => {
                            setSendingReminder(true);
                            setReminderSuccess(null);
                            try {
                              const response = await fetch(`/api/leads/${id}/email/reminder/payment`, {
                                method: 'POST',
                              });
                              const data = await response.json();
                              if (data.ok) {
                                setReminderSuccess({
                                  sentAt: new Date(data.paymentReminderSentAt),
                                  count: data.paymentReminderCount,
                                });
                                await fetchLead();
                              } else {
                                const errorMsg = data.error || 'Failed to send payment reminder';
                                setError(errorMsg);
                                setTimeout(() => setError(''), 5000);
                              }
                            } catch (error) {
                              console.error('Error sending reminder:', error);
                            } finally {
                              setSendingReminder(false);
                            }
                          }}
                          disabled={sendingReminder}
                          className={`inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${(lead.paymentReminderSentAt || lead.paymentReminderCount > 0) ? 'ring-2 ring-amber-400' : ''}`}
                        >
                          {sendingReminder ? 'Sending...' : 'Send Payment Reminder'}
                        </button>
                        {reminderSuccess && (
                          <p className="mt-2 text-sm text-green-600">
                            Reminder sent on {formatDubaiTime(reminderSuccess.sentAt)} (Reminder #{reminderSuccess.count})
                          </p>
                        )}
                      </div>

                      {/* Mark Declined Control */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {!showDeclineForm ? (
                          <button
                            onClick={() => setShowDeclineForm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                          >
                            Mark Declined / Close Lead
                          </button>
                        ) : (
                          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Decline Stage</label>
                              <select
                                value={declineStage}
                                onChange={(e) => setDeclineStage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              >
                                <option value="After Invoice">After Invoice</option>
                                <option value="After Quote">After Quote</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                              <textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Enter reason for declining..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDeclineConfirm(true)}
                                disabled={declining}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Confirm Decline
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeclineForm(false);
                                  setDeclineReason('');
                                  setDeclineStage('After Invoice');
                                }}
                                disabled={declining}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                            </div>
                            {showDeclineConfirm && (
                              <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 mb-3">
                                  Are you sure you want to mark this lead as declined? This action cannot be undone if payment has not been received.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      setDeclining(true);
                                      try {
                                        const response = await fetch(`/api/leads/${id}/decline`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ reason: declineReason || undefined, stage: declineStage }),
                                        });
                                        const data = await response.json();
                                        if (data.ok) {
                                          await fetchLead();
                                          setShowDeclineForm(false);
                                          setShowDeclineConfirm(false);
                                          setDeclineReason('');
                                          setDeclineStage('After Invoice');
                                        } else {
                                          console.error('Failed to decline lead:', data.error);
                                        }
                                      } catch (error) {
                                        console.error('Error declining lead:', error);
                                      } finally {
                                        setDeclining(false);
                                      }
                                    }}
                                    disabled={declining}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {declining ? 'Declining...' : 'Yes, Decline Lead'}
                                  </button>
                                  <button
                                    onClick={() => setShowDeclineConfirm(false)}
                                    disabled={declining}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Payment received: {formatDubaiTime(lead.paymentReceivedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Declined Status Display */}
          {lead.declinedAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Lead Closed</p>
                    <p className="text-sm text-gray-600">
                      Closed on {formatDubaiTime(lead.declinedAt)}
                      {lead.declineStage && ` (${lead.declineStage})`}
                    </p>
                    {lead.declineReason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Reason:</span> {lead.declineReason}
                      </p>
                    )}
                  </div>
                  {!editingDeclineStatus ? (
                    <button
                      onClick={() => {
                        setEditingDeclineStatus(true);
                        setEditData({
                          ...editData,
                          declinedAt: lead.declinedAt,
                          declineStage: lead.declineStage || 'After Payment',
                          declineReason: lead.declineReason || '',
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Status
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingDeclineStatus(false);
                        setEditData({});
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {editingDeclineStatus && (
                  <div className="mt-4 pt-4 border-t border-gray-300 space-y-4 bg-white rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decline Date</label>
                      <input
                        type="datetime-local"
                        value={editData.declinedAt ? new Date(editData.declinedAt).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                          setEditData({ ...editData, declinedAt: value as any });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decline Stage</label>
                      <select
                        value={editData.declineStage || 'After Payment'}
                        onChange={(e) => setEditData({ ...editData, declineStage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="After Payment">After Payment</option>
                        <option value="During Work">During Work</option>
                        <option value="After Completion">After Completion</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                      <textarea
                        value={editData.declineReason || ''}
                        onChange={(e) => setEditData({ ...editData, declineReason: e.target.value })}
                        placeholder="Enter reason for declining..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={async () => {
                          await updateLead({
                            declinedAt: editData.declinedAt ? new Date(editData.declinedAt) : null,
                            declineStage: editData.declineStage || null,
                            declineReason: editData.declineReason || null,
                          });
                          setEditingDeclineStatus(false);
                          setEditData({});
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to reopen this lead? This will clear the declined status.')) {
                            await updateLead({
                              declinedAt: null,
                              declineStage: null,
                              declineReason: null,
                            });
                            await logActivity('lead_reopened', 'Lead reopened from declined status');
                            setEditingDeclineStatus(false);
                            setEditData({});
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reopen Lead
                      </button>
                      <button
                        onClick={() => {
                          setEditingDeclineStatus(false);
                          setEditData({});
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Work in Progress */}
          {lead.paymentReceivedAt && !lead.companyCompletedAt && !lead.quoteDeclinedAt && !lead.declinedAt && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">7. Work in Progress</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">{serviceLabel} setup is in progress</p>
                      <p className="text-xs text-blue-700">
                        Payment has been received on {lead.paymentReceivedAt ? formatDubaiTime(lead.paymentReceivedAt) : 'N/A'}. The assigned agent is working on completing the {serviceLabel.toLowerCase()} setup process.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agent Status */}
                {assignedAgentsForSummary.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Assigned Agents</h4>
                    <div className="space-y-2">
                      {assignedAgentsForSummary
                        .filter((la: any) => la.serviceType === 'company')
                        .map((la: any) => (
                          <div key={la.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{la.agent.name}</span>
                              {la.isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Current</span>
                              )}
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize">
                                {la.status}
                              </span>
                            </div>
                            {la.notes && (
                              <p className="text-xs text-gray-600 italic">{la.notes}</p>
                            )}
                          </div>
                        ))}
                      {assignedAgentsForSummary.filter((la: any) => la.serviceType === 'company').length === 0 && (
                        <p className="text-xs text-gray-500 italic">No agents assigned for {serviceLabel.toLowerCase()} setup</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">Next Steps</h4>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>Agent is working on documentation and application submission</li>
                    <li>Monitor agent progress and status updates</li>
                    <li>Once all work is complete, mark the {serviceLabel.toLowerCase()} setup as completed</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={handleMarkCompanyCompleted}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark Work Completed
                    </button>
                    <button
                      onClick={() => setShowDeclineForm(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark Declined
                    </button>
                  </div>

                  {/* Decline Form */}
                  {showDeclineForm && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Decline Stage</label>
                        <select
                          value={declineStage}
                          onChange={(e) => setDeclineStage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="After Payment">After Payment</option>
                          <option value="During Work">During Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Enter reason for declining..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setDeclining(true);
                            setActionLoading(true);
                            try {
                              const response = await fetch(`/api/leads/${id}/decline`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reason: declineReason || undefined, stage: declineStage }),
                              });
                              const data = await response.json();
                              if (data.ok) {
                                // Refresh lead data to update UI
                                await fetchLead();
                                await fetchAssignedAgentsForSummary();
                                await fetchActivities();
                                setShowDeclineForm(false);
                                setDeclineReason('');
                                setDeclineStage('After Payment');
                              } else {
                                setError(data.error || 'Failed to decline lead');
                              }
                            } catch (error) {
                              console.error('Error declining lead:', error);
                              setError('Failed to decline lead');
                            } finally {
                              setDeclining(false);
                              setActionLoading(false);
                            }
                          }}
                          disabled={declining || actionLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {declining ? 'Declining...' : 'Confirm Decline'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeclineForm(false);
                            setDeclineReason('');
                            setDeclineStage('After Payment');
                          }}
                          disabled={declining || actionLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Completion */}
          {lead.paymentReceivedAt && lead.companyCompletedAt && !lead.quoteDeclinedAt && !lead.declinedAt && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">8. Completion</h3>
                {!editingPaymentCompletion && (
                  <button
                    onClick={() => {
                      setEditingPaymentCompletion('company');
                      setEditData({
                        ...editData,
                        companyCompletedAt: lead.companyCompletedAt,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingPaymentCompletion === 'company' ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{serviceLabel} Completion Date</label>
                    <input
                      type="datetime-local"
                      value={editData.companyCompletedAt ? new Date(editData.companyCompletedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setEditData({ ...editData, companyCompletedAt: value as any });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={async () => {
                        await updateLead({
                          companyCompletedAt: editData.companyCompletedAt ? new Date(editData.companyCompletedAt) : null,
                        });
                        setEditingPaymentCompletion(null);
                        setEditData({});
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPaymentCompletion(null);
                        setEditData({});
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!lead.companyCompletedAt ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <button
                        onClick={handleMarkCompanyCompleted}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {actionLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Completing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark {serviceLabel} Completed
                          </>
                        )}
                      </button>
                    <p className="text-xs text-gray-600 mt-3">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      A review request email will be automatically sent to the customer
                    </p>
                  </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          {serviceLabel} completed: {formatDubaiTime(lead.companyCompletedAt)}
                        </p>
                      </div>
                      
                      {/* Decline Option */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Change Status</h4>
                            <p className="text-xs text-gray-600">Mark this lead as declined instead</p>
                          </div>
                          {!showDeclineForm ? (
                            <button
                              onClick={() => setShowDeclineForm(true)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Mark Declined
                            </button>
                          ) : (
                            <div className="flex-1 ml-4 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Decline Stage</label>
                                <select
                                  value={declineStage}
                                  onChange={(e) => setDeclineStage(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                  <option value="After Completion">After Completion</option>
                                  <option value="During Work">During Work</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
                                <textarea
                                  value={declineReason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  placeholder="Enter reason for declining..."
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    setDeclining(true);
                                    setActionLoading(true);
                                    try {
                                      const response = await fetch(`/api/leads/${id}/decline`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ reason: declineReason || undefined, stage: declineStage }),
                                      });
                                      const data = await response.json();
                                      if (data.ok) {
                                        await fetchLead();
                                        await fetchAssignedAgentsForSummary();
                                        await fetchActivities();
                                        setShowDeclineForm(false);
                                        setDeclineReason('');
                                        setDeclineStage('After Completion');
                                      } else {
                                        setError(data.error || 'Failed to decline lead');
                                      }
                                    } catch (error) {
                                      console.error('Error declining lead:', error);
                                      setError('Failed to decline lead');
                                    } finally {
                                      setDeclining(false);
                                      setActionLoading(false);
                                    }
                                  }}
                                  disabled={declining || actionLoading}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {declining ? 'Declining...' : 'Confirm Decline'}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeclineForm(false);
                                    setDeclineReason('');
                                    setDeclineStage('After Completion');
                                  }}
                                  disabled={declining || actionLoading}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
        )}

        {/* Bank Account Setup - For Combined Services (Company + Bank) - REMOVED */}
        {/* Combined services workflow has been removed. Bank account setup is now standalone only. */}

        {/* Bank Project Deal Workflow */}
        {bankActive && (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-10 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Bank Project</h2>
            </div>

            {/* Bank Step 2: Feasibility & Quote */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-4">2. Feasibility & Quote</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Quoted Amount (AED)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={localBankQuotedAmount}
                      onChange={(e) => {
                        setLocalBankQuotedAmount(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter amount"
                    />
                    <button
                      onClick={async () => {
                        const value = localBankQuotedAmount ? parseInt(localBankQuotedAmount) : null;
                        if (value !== lead.bankQuotedAmountAed) {
                          setSaving(true);
                          try {
                            await updateLead({ bankQuotedAmountAed: value });
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 3000);
                          } catch (err) {
                            setError('Failed to save bank quote');
                            setTimeout(() => setError(''), 5000);
                          } finally {
                            setSaving(false);
                          }
                        }
                      }}
                      disabled={saving || localBankQuotedAmount === (lead.bankQuotedAmountAed?.toString() || '')}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Quote'}
                    </button>
                  </div>
                  {saveSuccess && (
                    <p className="text-xs text-green-600 mt-2">Bank quote saved successfully</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Step 3: Send Bank Quote */}
            {lead.bankQuotedAmountAed && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">3. Send Bank Quote</h3>
                {!lead.bankQuoteSentAt ? (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          const response = await fetch(`/api/leads/${id}/email/quote/bank`, {
                            method: 'POST',
                          });
                          if (response.ok) {
                            await fetchLead();
                            setSuccessMessage('Bank quote email sent successfully!');
                            setTimeout(() => setSuccessMessage(null), 5000);
                          } else {
                            const error = await response.json();
                            const errorMsg = `Failed to send bank quote email: ${error.error || 'Unknown error'}`;
                            setError(errorMsg);
                            console.error('[Bank Quote Email]', errorMsg);
                            setTimeout(() => setError(''), 5000);
                          }
                        } catch (err) {
                          console.error('Error sending bank quote email:', err);
                          setError('Failed to send bank quote email');
                          setTimeout(() => setError(''), 5000);
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading || !lead.email}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Bank Quote
                        </>
                      )}
                    </button>
                    {!lead.email && (
                      <p className="text-xs text-red-600 mt-2">Email address required to send quote</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-green-800">Quote Sent</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Sent on {formatDubaiTime(lead.bankQuoteSentAt!)}
                      </p>
                    </div>
                    {lead.bankQuoteSentAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                          Quote already sent. To send a new quote with a different amount, use Reset Bank Workflow first.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Reset Bank Workflow - Production Safe */}
                {!lead.bankPaymentReceivedAt && !lead.bankCompletedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {!showBankResetConfirm ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">
                          This will reset bank quote, decision, and invoice so you can send a new quote.
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowBankResetConfirm(true);
                            setBankResetConfirmText('');
                            setBankResetConfirmChecked(false);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                        >
                          Reset Bank Workflow
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-xs font-semibold text-orange-800 mb-2">
                          Confirm Reset Bank Workflow
                        </p>
                        <p className="text-xs text-gray-700 mb-3">
                          This will reset all bank quote decision and invoice state. Type <strong>RESET</strong> to confirm:
                        </p>
                        <input
                          type="text"
                          value={bankResetConfirmText}
                          onChange={(e) => setBankResetConfirmText(e.target.value)}
                          placeholder="Type RESET"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          autoFocus
                        />
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id="bank-reset-confirm-checkbox"
                            checked={bankResetConfirmChecked}
                            onChange={(e) => setBankResetConfirmChecked(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="bank-reset-confirm-checkbox" className="text-xs text-gray-700">
                            I understand this will reset the bank workflow
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              if (bankResetConfirmText !== 'RESET' || !bankResetConfirmChecked) {
                                setError('Please type RESET and check the confirmation box');
                                setTimeout(() => setError(''), 3000);
                                return;
                              }
                              
                              setActionLoading(true);
                              setError('');
                              setSuccessMessage(null);
                              
                              try {
                                const response = await fetch(`/api/leads/${id}/reset-bank`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ reason: 'Admin reset' }),
                                });
                                
                                // Read response safely
                                let data: any = {};
                                let text = '';
                                
                                try {
                                  const contentType = response.headers.get('content-type');
                                  if (contentType && contentType.includes('application/json')) {
                                    data = await response.json();
                                  } else {
                                    text = await response.text();
                                    try {
                                      data = JSON.parse(text);
                                    } catch {
                                      // Not JSON, use text as error
                                    }
                                  }
                                } catch (parseErr: any) {
                                  // If JSON parsing fails, try text
                                  try {
                                    text = await response.text();
                                    try {
                                      data = JSON.parse(text);
                                    } catch {
                                      // Not JSON
                                    }
                                  } catch {
                                    // Can't read response
                                  }
                                }
                                
                                if (response.ok && data.ok) {
                                  setSuccessMessage(data.message || 'Bank workflow reset successfully');
                                  setShowBankResetConfirm(false);
                                  setBankResetConfirmText('');
                                  setBankResetConfirmChecked(false);
                                  await fetchLead();
                                  setTimeout(() => setSuccessMessage(null), 5000);
                                } else {
                                  // Show API error message
                                  const errorMsg = data.error || text || 'Reset failed';
                                  setError(errorMsg);
                                  setTimeout(() => setError(''), 8000);
                                }
                              } catch (err: any) {
                                console.error('Error resetting bank workflow:', err);
                                setError('Reset failed');
                                setTimeout(() => setError(''), 5000);
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            disabled={actionLoading || bankResetConfirmText !== 'RESET' || !bankResetConfirmChecked}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 border border-orange-700 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowBankResetConfirm(false);
                              setBankResetConfirmText('');
                              setBankResetConfirmChecked(false);
                            }}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        {/* Error display */}
                        {error && (
                          <div className="mt-3">
                            <p className="text-sm text-red-600 whitespace-pre-line">{error.split('\nDebug:')[0]}</p>
                          </div>
                        )}
                        {/* Success message */}
                        {successMessage && (
                          <p className="text-xs text-green-600 mt-3">{successMessage}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bank Step 4: Customer Decision */}
            {lead.bankQuoteSentAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">4. Customer Decision</h3>
                
                {/* Decision Status */}
                <div className="space-y-4">
                  {/* Approved - show if bankProceedConfirmedAt OR bankQuoteApprovedAt OR bankApproved === true */}
                  {(lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.bankApproved === true) && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base font-semibold text-green-800">Approved</span>
                      </div>
                      <p className="text-sm text-green-700 ml-9">
                        {lead.bankProceedConfirmedAt 
                          ? formatDubaiTime(lead.bankProceedConfirmedAt)
                          : lead.bankQuoteApprovedAt 
                          ? formatDubaiTime(lead.bankQuoteApprovedAt)
                          : 'Approved'}
                      </p>
                    </div>
                  )}

                  {/* Has Questions */}
                  {lead.bankQuoteQuestionsAt && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base font-semibold text-amber-800">Has Questions</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-2 ml-9">
                        {formatDubaiTime(lead.bankQuoteQuestionsAt)}
                      </p>
                      {lead.bankQuoteQuestionsReason && (
                        <p className="text-sm text-amber-600 italic ml-9">
                          Notes: {lead.bankQuoteQuestionsReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Declined */}
                  {lead.bankQuoteDeclinedAt && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base font-semibold text-red-800">Declined</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2 ml-9">
                        {formatDubaiTime(lead.bankQuoteDeclinedAt)}
                      </p>
                      {lead.bankQuoteDeclineReason && (
                        <p className="text-sm text-red-600 italic ml-9">
                          Reason: {lead.bankQuoteDeclineReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Viewed - only show if not approved/declined/questions */}
                  {lead.bankQuoteViewedAt && !lead.bankProceedConfirmedAt && !lead.bankQuoteApprovedAt && lead.bankApproved !== true && !lead.bankQuoteDeclinedAt && !lead.bankQuoteQuestionsAt && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-base font-semibold text-blue-800">Viewed</span>
                      </div>
                      <p className="text-sm text-blue-700 ml-9">
                        {formatDubaiTime(lead.bankQuoteViewedAt)}
                      </p>
                    </div>
                  )}

                  {/* Waiting for decision - only show if not approved/declined/questions */}
                  {!lead.bankProceedConfirmedAt && !lead.bankQuoteApprovedAt && lead.bankApproved !== true && !lead.bankQuoteDeclinedAt && !lead.bankQuoteQuestionsAt && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-base font-semibold text-amber-800 mb-1">
                            Waiting for customer decision
                          </p>
                          <p className="text-sm text-amber-700">
                            Quote sent on {formatDubaiTime(lead.bankQuoteSentAt!)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Override Section */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Admin Override
                    </summary>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-4">Manually override customer decision:</p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <button
                          onClick={async () => {
                            if (!confirm('Mark this bank quote as Accepted? This will override any customer decision.')) {
                              return;
                            }
                            setActionLoading(true);
                            setError('');
                            try {
                              const response = await fetch(`/api/leads/${id}/override-decision`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ project: 'bank', decision: 'accept' }),
                              });
                              if (response.ok) {
                                setSuccessMessage('Bank quote marked as Accepted');
                                fetchLead();
                                setTimeout(() => setSuccessMessage(null), 3000);
                              } else {
                                const data = await response.json();
                                setError(data.error || 'Failed to override decision');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Failed to override decision');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Mark as Accepted
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Optional reason/notes for questions:');
                            if (reason === null) return; // User cancelled
                            setActionLoading(true);
                            setError('');
                            try {
                              const response = await fetch(`/api/leads/${id}/override-decision`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ project: 'bank', decision: 'questions', reason: reason || undefined }),
                              });
                              if (response.ok) {
                                setSuccessMessage('Bank quote marked as Has Questions');
                                fetchLead();
                                setTimeout(() => setSuccessMessage(null), 3000);
                              } else {
                                const data = await response.json();
                                setError(data.error || 'Failed to override decision');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Failed to override decision');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Mark as Has Questions
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Optional reason for decline:');
                            if (reason === null) return; // User cancelled
                            setActionLoading(true);
                            setError('');
                            try {
                              const response = await fetch(`/api/leads/${id}/override-decision`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ project: 'bank', decision: 'decline', reason: reason || undefined }),
                              });
                              if (response.ok) {
                                setSuccessMessage('Bank quote marked as Declined');
                                fetchLead();
                                setTimeout(() => setSuccessMessage(null), 3000);
                              } else {
                                const data = await response.json();
                                setError(data.error || 'Failed to override decision');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Failed to override decision');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Mark as Declined
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Bank Step 5: Generate & Send Invoice */}
            {(lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.bankApproved === true) && !lead.bankQuoteDeclinedAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">5. Generate & Send Bank Invoice</h3>
                
                {/* Invoice Outdated Banner */}
                {lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt && lead.bankQuotedAmountAed !== null && lead.bankInvoiceAmountAed !== null && lead.bankQuotedAmountAed !== lead.bankInvoiceAmountAed && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Invoice Outdated</p>
                        <p className="text-xs text-amber-800 mb-2">
                          Quote amount changed: Invoice shows AED {lead.bankInvoiceAmountAed.toLocaleString()}, but current quote is AED {lead.bankQuotedAmountAed.toLocaleString()}.
                        </p>
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Payment Link (HTTPS required)
                          </label>
                          <input
                            type="url"
                            value={bankPaymentLinkDraft}
                            onChange={(e) => setBankPaymentLinkDraft(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                            placeholder="https://ziina.com/payment/..."
                          />
                          <button
                            onClick={() => handleGenerateInvoice('bank')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-semibold disabled:opacity-50"
                          >
                            {actionLoading ? 'Sending...' : 'Send Revised Invoice'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* If invoice never sent */}
                {!lead.bankInvoiceSentAt ? (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Link (Ziina) <span className="text-gray-500 text-xs">(HTTPS required)</span>
                      </label>
                      <input
                        type="url"
                        value={bankPaymentLinkDraft}
                        onChange={(e) => setBankPaymentLinkDraft(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://ziina.com/payment/..."
                      />
                    </div>
                    <button
                      onClick={() => handleGenerateInvoice('bank')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Generate & Send Invoice
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* If invoice already sent */
                  <div className="space-y-4">
                    {/* Current Invoice Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-green-800">Invoice Sent</span>
                            {lead.bankInvoiceVersion && lead.bankInvoiceVersion > 1 && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                                v{lead.bankInvoiceVersion}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            Sent on {formatDubaiTime(lead.bankInvoiceSentAt!)}
                          </p>
                          {lead.bankInvoiceAmountAed !== null && (
                            <p className="text-xs text-gray-600 mb-1">
                              Invoice amount: AED {lead.bankInvoiceAmountAed.toLocaleString()}
                            </p>
                          )}
                          {lead.bankQuotedAmountAed !== null && (
                            <p className="text-xs text-gray-600">
                              Current quote: AED {lead.bankQuotedAmountAed.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                          <p className="text-sm font-mono font-semibold text-gray-900">{lead.bankInvoiceNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {lead.bankInvoiceSentAt && (lead as any).bankInvoiceHtml && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/invoice/view-link?leadId=${lead.id}&project=bank`);
                                const data = await response.json();
                                if (data.ok && data.invoiceViewUrl) {
                                  window.open(data.invoiceViewUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  setError(data.error || 'Failed to open invoice view');
                                  setTimeout(() => setError(''), 5000);
                                }
                              } catch (error) {
                                console.error('Error fetching bank invoice view link:', error);
                                setError('Failed to open invoice view');
                                setTimeout(() => setError(''), 5000);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Invoice
                          </button>
                        )}
                        {lead.bankInvoicePaymentLink && (
                          <a
                            href={lead.bankInvoicePaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open Payment Link
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Revised Invoice Form (if payment not received) */}
                    {!lead.bankPaymentReceivedAt && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-700 mb-3">Send Revised Invoice</p>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Payment Link (HTTPS required)
                          </label>
                          <input
                            type="url"
                            value={bankPaymentLinkDraft}
                            onChange={(e) => setBankPaymentLinkDraft(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="https://ziina.com/payment/..."
                          />
                        </div>
                        <button
                          onClick={() => handleGenerateInvoice('bank')}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold disabled:opacity-50"
                        >
                          {actionLoading ? 'Sending...' : 'Send Revised Invoice'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Bank Invoice History */}
                {bankInvoiceRevisions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Invoice History</h4>
                    <div className="space-y-2">
                      {bankInvoiceRevisions.map((revision) => (
                        <div key={revision.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-gray-600">R{revision.version}</span>
                            <span className="text-xs text-gray-700">AED {revision.amountAed.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">
                              {revision.invoiceNumber || 'No number'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDubaiTime(revision.sentAt)}
                            </span>
                          </div>
                          {(revision as any).viewUrl && (
                            <a
                              href={(revision as any).viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bank Decline - Can decline at any stage before payment */}
            {!lead.bankPaymentReceivedAt && !lead.bankDeclinedAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">Bank Decline</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Mark Bank Project Declined</p>
                  {!showDeclineForm ? (
                    <button
                      onClick={() => setShowDeclineForm(true)}
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
                    >
                      Mark Declined
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Stage</label>
                        <select
                          value={declineStage}
                          onChange={(e) => setDeclineStage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="After Quote">After Quote</option>
                          <option value="After Invoice">After Invoice</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Reason (optional)</label>
                        <input
                          type="text"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., Customer not ready, pricing concerns..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setActionLoading(true);
                            try {
                              const response = await fetch(`/api/leads/${id}/decline`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  reason: declineReason || undefined,
                                  stage: declineStage,
                                  project: 'bank',
                                }),
                              });
                              const data = await response.json();
                              if (response.ok && data.ok) {
                                await fetchLead();
                                setShowDeclineForm(false);
                                setDeclineReason('');
                                setDeclineStage('After Invoice');
                                setSuccessMessage('Bank project marked as declined');
                                setTimeout(() => setSuccessMessage(null), 5000);
                              } else {
                                setError(data.error || 'Failed to mark declined');
                                setTimeout(() => setError(''), 5000);
                              }
                            } catch (err) {
                              console.error('Error marking bank declined:', err);
                              setError('Failed to mark declined');
                              setTimeout(() => setError(''), 5000);
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => {
                            setShowDeclineForm(false);
                            setDeclineReason('');
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Step 6: Payment */}
            {lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt && !lead.bankDeclinedAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">6. Bank Payment</h3>
                
                <div className="space-y-4">
                  {/* Mark Payment Received */}
                  <button
                    onClick={handleMarkBankPaymentReceived}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Bank Payment Received
                  </button>
                  
                  {/* Payment Reminder */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {/* Bank Payment Reminder Stamp - Prominent Visual Indicator */}
                    {(lead.bankPaymentReminderSentAt || lead.bankPaymentReminderCount > 0) && (
                      <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                                BANK PAYMENT REMINDER SENT
                              </span>
                              <span className="text-xs font-semibold text-amber-800">
                                #{lead.bankPaymentReminderCount || 0} {(lead.bankPaymentReminderCount || 0) === 1 ? 'Reminder' : 'Reminders'}
                              </span>
                            </div>
                            {lead.bankPaymentReminderSentAt && (
                              <p className="text-sm font-medium text-amber-900">
                                Last sent: {formatDubaiTime(lead.bankPaymentReminderSentAt)}
                              </p>
                            )}
                            <p className="text-xs text-amber-700 mt-1">
                              Please check before sending another reminder to avoid duplicates.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Send Payment Reminder</p>
                      </div>
                      <button
                        onClick={async () => {
                          setSendingReminder(true);
                          setError('');
                          try {
                            const response = await fetch(`/api/leads/${id}/email/reminder/payment`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ project: 'bank' }),
                            });
                            const data = await response.json();
                            if (response.ok && data.ok) {
                              await fetchLead();
                              setReminderSuccess({
                                sentAt: new Date(data.bankPaymentReminderSentAt || Date.now()),
                                count: data.bankPaymentReminderCount || 0,
                              });
                              setTimeout(() => setReminderSuccess(null), 5000);
                            } else {
                              setError(data.error || 'Failed to send reminder');
                              setTimeout(() => setError(''), 5000);
                            }
                          } catch (err) {
                            console.error('Error sending bank payment reminder:', err);
                            setError('Failed to send reminder');
                            setTimeout(() => setError(''), 5000);
                          } finally {
                            setSendingReminder(false);
                          }
                        }}
                        disabled={sendingReminder || !lead.email}
                        className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${(lead.bankPaymentReminderSentAt || lead.bankPaymentReminderCount > 0) ? 'ring-2 ring-amber-400' : ''}`}
                      >
                        {sendingReminder ? 'Sending...' : 'Send Payment Reminder'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bank Step 7: Completion */}
            {lead.bankPaymentReceivedAt && !lead.bankCompletedAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-5">7. Bank Completion</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <button
                    onClick={handleMarkBankCompleted}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Bank Completed
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Bank Declined Status */}
            {lead.bankDeclinedAt && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-red-800">Bank Project Declined</span>
                  </div>
                  <p className="text-xs text-red-700 mb-1">
                    Declined on {formatDubaiTime(lead.bankDeclinedAt)}
                  </p>
                  {lead.bankDeclineReason && (
                    <p className="text-xs text-red-600 italic mt-1">
                      Reason: {lead.bankDeclineReason}
                    </p>
                  )}
                  {lead.bankDeclineStage && (
                    <p className="text-xs text-red-600 mt-1">
                      Stage: {lead.bankDeclineStage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Section - Admin Notes (not customer form notes) */}
        {/* ⚠️ ADMIN NOTES SECTION - FINALIZED & APPROVED ⚠️
            This section has been reviewed and approved for company setup.
            - This section is for admin-added notes only, NOT customer form notes
            - Customer form notes are shown in the Client & Request section, not here
            - Admin notes are stored separately from customer form notes using "--- Admin Notes ---" separator
            - Lead reference is preserved when saving admin notes
            - Notes are saved automatically on blur or manually via Save button
            Please do not modify without careful review and approval.
        */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Admin Notes</h2>
            <span className="text-xs text-gray-500 italic">(Internal notes - not visible to customer)</span>
          </div>
          <div className="space-y-3">
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={async () => {
                // Reconstruct full notes: preserve customer form notes, add admin notes with separator, preserve bank details and lead reference
                const { customerNotes, monthlyTurnover, existingUaeBankAccount, companyJurisdiction, companyStatus } = parseNotesAndBankDetails(lead.notes);
                
                // Start with customer form notes (if any)
                let fullNotes = customerNotes || '';
                
                // Add admin notes from bottom section (with separator to distinguish from customer notes)
                if (localNotes && localNotes.trim()) {
                  fullNotes += (fullNotes ? '\n\n' : '') + '--- Admin Notes ---\n' + localNotes.trim();
                }
                
                // Reconstruct bank details section if they exist
                const bankFields = [];
                if (companyJurisdiction) bankFields.push(`Company Jurisdiction: ${companyJurisdiction}`);
                if (companyStatus) bankFields.push(`Company Status: ${companyStatus}`);
                if (monthlyTurnover) bankFields.push(`Monthly Turnover: ${monthlyTurnover}`);
                if (existingUaeBankAccount) bankFields.push(`Existing UAE Bank Account: ${existingUaeBankAccount}`);
                
                if (bankFields.length > 0) {
                  fullNotes += (fullNotes ? '\n\n' : '') + 'Bank Account Details:\n' + bankFields.join('\n');
                }
                
                // Add lead reference
                const leadRefMatch = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
                if (leadRefMatch) {
                  fullNotes += (fullNotes ? '\n\n' : '') + `Lead Reference: ${leadRefMatch[1]}`;
                }
                
                if (fullNotes !== (lead.notes || '')) {
                  setSavingNotes(true);
                  setNotesSaved(false);
                  try {
                    await updateLead({ notes: fullNotes || null });
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 3000);
                  } catch (error) {
                    console.error('Error saving notes:', error);
                  } finally {
                    setSavingNotes(false);
                  }
                }
              }}
              placeholder="Add admin notes about this lead (customer form notes are shown in Client & Request section)..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm resize-y"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notesSaved && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </span>
                )}
                <p className="text-xs text-gray-500">Notes are saved automatically when you click outside the field</p>
              </div>
              <button
                onClick={async () => {
                  // Reconstruct full notes: preserve customer form notes, add admin notes with separator, preserve bank details and lead reference
                  const { customerNotes, monthlyTurnover, existingUaeBankAccount, companyJurisdiction, companyStatus } = parseNotesAndBankDetails(lead.notes);
                  
                  // Start with customer form notes (if any)
                  let fullNotes = customerNotes || '';
                  
                  // Add admin notes from bottom section (with separator to distinguish from customer notes)
                  if (localNotes && localNotes.trim()) {
                    fullNotes += (fullNotes ? '\n\n' : '') + '--- Admin Notes ---\n' + localNotes.trim();
                  }
                  
                  // Reconstruct bank details section if they exist
                  const bankFields = [];
                  if (companyJurisdiction) bankFields.push(`Company Jurisdiction: ${companyJurisdiction}`);
                  if (companyStatus) bankFields.push(`Company Status: ${companyStatus}`);
                  if (monthlyTurnover) bankFields.push(`Monthly Turnover: ${monthlyTurnover}`);
                  if (existingUaeBankAccount) bankFields.push(`Existing UAE Bank Account: ${existingUaeBankAccount}`);
                  
                  if (bankFields.length > 0) {
                    fullNotes += (fullNotes ? '\n\n' : '') + 'Bank Account Details:\n' + bankFields.join('\n');
                  }
                  
                  // Add lead reference
                  const leadRefMatch = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
                  if (leadRefMatch) {
                    fullNotes += (fullNotes ? '\n\n' : '') + `Lead Reference: ${leadRefMatch[1]}`;
                  }
                  
                  if (fullNotes !== (lead.notes || '')) {
                    setSavingNotes(true);
                    setNotesSaved(false);
                    try {
                      await updateLead({ notes: fullNotes || null });
                      setNotesSaved(true);
                      setTimeout(() => setNotesSaved(false), 3000);
                    } catch (error) {
                      console.error('Error saving notes:', error);
                    } finally {
                      setSavingNotes(false);
                    }
                  }
                }}
                disabled={savingNotes || (() => {
                  // Check if admin notes changed
                  const { adminNotes: currentAdminNotes } = parseNotesAndBankDetails(lead.notes);
                  return localNotes === (currentAdminNotes || '');
                })()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNotes ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* History - Collapsed by Default */}
        {/* ⚠️ HISTORY SECTION - FINALIZED & APPROVED ⚠️
            This section has been reviewed and approved for company setup.
            - Displays all activity history for the lead
            - Shows events chronologically with timestamps
            - Collapsed by default, expandable on click
            Please do not modify without careful review and approval.
        */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <button
            onClick={() => setActivityExpanded(!activityExpanded)}
            className="flex items-center justify-between w-full text-left hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">History</h2>
            </div>
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
    </div>
    </>
  );
}

