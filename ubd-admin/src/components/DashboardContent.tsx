'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import DashboardChart from './DashboardChart';

interface Lead {
  id: string;
  createdAt: Date;
  fullName: string;
  status: string;
  quotedAmountAed: number | null;
  bankQuotedAmountAed: number | null;
  paymentReceivedAt: Date | null;
  bankPaymentReceivedAt: Date | null;
  companyQuoteSentAt: Date | null;
  bankQuoteSentAt: Date | null;
  companyInvoiceSentAt: Date | null;
  bankInvoiceSentAt: Date | null;
  companyCompletedAt: Date | null;
  bankCompletedAt: Date | null;
}

interface DashboardContentProps {
  initialLeads: Lead[];
  initialMetrics: {
    totalLeads: number;
    newLeadsToday: number;
    newLeads: number;
    agentContacted: number;
    feasibilityReview: number;
    quoted: number;
    invoiceSent: number;
    awaitingPayment: number;
    paymentReceived: number;
    inProgress: number;
    completed: number;
    notFeasible: number;
    declined: number;
    awaitingAction: number;
    awaitingQuote: number;
    awaitingPaymentCount: number;
    totalQuoted: number;
    totalPaid: number;
    pendingPayments: number;
    withAthar: number;
    withAnoop: number;
    withSelf: number;
    unassigned: number;
  };
}

type TimeRange = 'today' | 'week' | 'month' | 'all';

export default function DashboardContent({
  initialLeads,
  initialMetrics,
}: DashboardContentProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Ensure leads is always an array
  const leads = useMemo(() => {
    if (!initialLeads || !Array.isArray(initialLeads)) {
      return [];
    }
    // Ensure dates are Date objects
    return initialLeads.map(lead => ({
      ...lead,
      createdAt: new Date(lead.createdAt),
      paymentReceivedAt: lead.paymentReceivedAt ? new Date(lead.paymentReceivedAt) : null,
      bankPaymentReceivedAt: lead.bankPaymentReceivedAt ? new Date(lead.bankPaymentReceivedAt) : null,
      companyQuoteSentAt: lead.companyQuoteSentAt ? new Date(lead.companyQuoteSentAt) : null,
      bankQuoteSentAt: lead.bankQuoteSentAt ? new Date(lead.bankQuoteSentAt) : null,
      companyInvoiceSentAt: lead.companyInvoiceSentAt ? new Date(lead.companyInvoiceSentAt) : null,
      bankInvoiceSentAt: lead.bankInvoiceSentAt ? new Date(lead.bankInvoiceSentAt) : null,
      companyCompletedAt: lead.companyCompletedAt ? new Date(lead.companyCompletedAt) : null,
      bankCompletedAt: lead.bankCompletedAt ? new Date(lead.bankCompletedAt) : null,
    }));
  }, [initialLeads]);

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case 'week':
        return {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now),
        };
      case 'month':
        return {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now),
        };
      default:
        return null;
    }
  }, [timeRange]);

  // Filter leads based on time range
  const filteredLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    if (!dateRange) return leads;
    return leads.filter((lead) =>
      isWithinInterval(new Date(lead.createdAt), dateRange)
    );
  }, [leads, dateRange]);

  // Calculate metrics for filtered leads
  const metrics = useMemo(() => {
    if (timeRange === 'all') return initialMetrics;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newLeadsToday = 0;
    let newLeads = 0;
    let agentContacted = 0;
    let feasibilityReview = 0;
    let quoted = 0;
    let invoiceSent = 0;
    let awaitingPayment = 0;
    let paymentReceived = 0;
    let inProgress = 0;
    let completed = 0;
    let notFeasible = 0;
    let declined = 0;
    let awaitingAction = 0;
    let awaitingQuote = 0;
    let awaitingPaymentCount = 0;
    let totalQuoted = 0;
    let totalPaid = 0;
    let pendingPayments = 0;

    for (const lead of filteredLeads) {
      const status = lead.status;
      const createdDate = new Date(lead.createdAt);
      createdDate.setHours(0, 0, 0, 0);

      if (createdDate.getTime() === today.getTime()) {
        newLeadsToday++;
      }

      if (status === 'New') newLeads++;
      else if (status === 'Agent Contacted') agentContacted++;
      else if (status === 'Feasibility Review') feasibilityReview++;
      else if (status === 'Quoted') quoted++;
      else if (status === 'Invoice Sent') invoiceSent++;
      else if (status === 'Awaiting Payment') awaitingPayment++;
      else if (
        status === 'Payment Received' ||
        status === 'Company In Progress' ||
        status === 'Bank In Progress'
      ) {
        paymentReceived++;
        inProgress++;
      } else if (status === 'Completed') completed++;
      else if (status === 'Not Feasible') notFeasible++;
      else if (status === 'Declined') declined++;

      if (status === 'New' || status === 'Quoted' || status === 'Invoice Sent') {
        awaitingAction++;
      }

      if (lead.companyQuoteSentAt && !lead.quotedAmountAed) {
        awaitingQuote++;
      }

      if (
        status === 'Awaiting Payment' ||
        (lead.companyInvoiceSentAt && !lead.paymentReceivedAt) ||
        (lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt)
      ) {
        awaitingPaymentCount++;
      }

      if (lead.quotedAmountAed) totalQuoted += lead.quotedAmountAed;
      if (lead.bankQuotedAmountAed) totalQuoted += lead.bankQuotedAmountAed;
      if (lead.paymentReceivedAt && lead.quotedAmountAed)
        totalPaid += lead.quotedAmountAed;
      if (lead.bankPaymentReceivedAt && lead.bankQuotedAmountAed)
        totalPaid += lead.bankQuotedAmountAed;
      if (
        lead.companyInvoiceSentAt &&
        !lead.paymentReceivedAt &&
        lead.quotedAmountAed
      ) {
        pendingPayments += lead.quotedAmountAed;
      }
      if (
        lead.bankInvoiceSentAt &&
        !lead.bankPaymentReceivedAt &&
        lead.bankQuotedAmountAed
      ) {
        pendingPayments += lead.bankQuotedAmountAed;
      }
    }

    return {
      totalLeads: filteredLeads.length,
      newLeadsToday,
      newLeads,
      agentContacted,
      feasibilityReview,
      quoted,
      invoiceSent,
      awaitingPayment,
      paymentReceived,
      inProgress,
      completed,
      notFeasible,
      declined,
      awaitingAction,
      awaitingQuote,
      awaitingPaymentCount,
      totalQuoted,
      totalPaid,
      pendingPayments,
      withAthar: initialMetrics.withAthar,
      withAnoop: initialMetrics.withAnoop,
      withSelf: initialMetrics.withSelf,
      unassigned: initialMetrics.unassigned,
    };
  }, [filteredLeads, timeRange, initialMetrics]);

  // Prepare chart data
  const leadTrendsData = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const count = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return isWithinInterval(leadDate, { start: dayStart, end: dayEnd });
      }).length;
      data.push({
        name: format(date, 'MMM dd'),
        value: count,
      });
    }
    return data;
  }, [leads, timeRange]);

  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredLeads]);

  const revenueTrendsData = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const revenue = leads
        .filter((lead) => {
          const paymentDate = lead.paymentReceivedAt || lead.bankPaymentReceivedAt;
          if (!paymentDate) return false;
          const payDate = new Date(paymentDate);
          return isWithinInterval(payDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, lead) => {
          let amount = 0;
          if (lead.paymentReceivedAt && lead.quotedAmountAed) {
            amount += lead.quotedAmountAed;
          }
          if (lead.bankPaymentReceivedAt && lead.bankQuotedAmountAed) {
            amount += lead.bankQuotedAmountAed;
          }
          return sum + amount;
        }, 0);
      data.push({
        name: format(date, 'MMM dd'),
        value: revenue,
      });
    }
    return data;
  }, [leads, timeRange]);

  // Calculate conversion rates
  const conversionRates = useMemo(() => {
    const total = metrics.totalLeads || 1;
    return {
      newToQuoted: ((metrics.quoted / total) * 100).toFixed(1),
      quotedToPaid: metrics.quoted
        ? ((metrics.paymentReceived / metrics.quoted) * 100).toFixed(1)
        : '0',
      paidToCompleted: metrics.paymentReceived
        ? ((metrics.completed / metrics.paymentReceived) * 100).toFixed(1)
        : '0',
    };
  }, [metrics]);

  // Calculate percentage changes (simplified - comparing current period to previous period)
  const percentageChanges = useMemo(() => {
    // For now, we'll calculate based on time range
    // In a real implementation, you'd compare to the previous period
    const previousPeriodLeads = leads.filter((lead) => {
      if (!dateRange) return false;
      const prevStart = new Date(dateRange.start);
      const prevEnd = new Date(dateRange.end);
      const daysDiff = Math.ceil((prevEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
      prevStart.setDate(prevStart.getDate() - daysDiff);
      prevEnd.setDate(prevEnd.getDate() - daysDiff);
      return isWithinInterval(new Date(lead.createdAt), { start: prevStart, end: prevEnd });
    });

    const prevTotal = previousPeriodLeads.length;
    const currentTotal = filteredLeads.length;
    const totalChange = prevTotal > 0 ? (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(1) : '0';

    const prevNew = previousPeriodLeads.filter((l) => l.status === 'New').length;
    const newChange = prevNew > 0 ? (((metrics.newLeads - prevNew) / prevNew) * 100).toFixed(1) : '0';

    const prevCompleted = previousPeriodLeads.filter((l) => l.status === 'Completed').length;
    const completedChange = prevCompleted > 0 ? (((metrics.completed - prevCompleted) / prevCompleted) * 100).toFixed(1) : '0';

    return {
      total: totalChange,
      new: newChange,
      completed: completedChange,
    };
  }, [leads, filteredLeads, metrics, dateRange]);

  // Check if we have any data
  if (leads.length === 0) {
    return (
      <div className="space-y-6 md:space-y-10">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leads Yet</h3>
          <p className="text-gray-500 mb-6">
            Once you start receiving leads, they will appear here.
          </p>
          <Link
            href="/admin/leads/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Lead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Time Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Time Range:</span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-[80px] sm:min-w-0 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === 'week'
                  ? 'This Week'
                  : range === 'month'
                  ? 'This Month'
                  : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      {timeRange === 'today' || timeRange === 'all' ? (
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Today's Summary</h2>
          </div>
          <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-lg border border-amber-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.newLeadsToday}</div>
                  <div className="text-sm text-gray-600">New Leads Today</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.awaitingAction}</div>
                  <div className="text-sm text-gray-600">Requires Action</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
            {metrics.awaitingQuote > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="flex items-center gap-2 text-amber-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {metrics.awaitingQuote} leads are waiting for quotes
                  </span>
                </div>
              </div>
            )}
            {metrics.awaitingPaymentCount > 0 && (
              <div className="mt-2 flex items-center gap-2 text-orange-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {metrics.awaitingPaymentCount} leads are waiting for payment
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Key Metrics Section */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Key Metrics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Total Leads Card */}
          <Link
            href="/admin/leads"
            className="group relative bg-gradient-to-br from-white to-indigo-50/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 hover:border-indigo-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl group-hover:from-indigo-200 group-hover:to-blue-200 transition-all transform group-hover:scale-110">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {metrics.totalLeads}
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-2">
                Total Leads
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  +{metrics.newLeadsToday} today
                </div>
                {timeRange !== 'all' && parseFloat(percentageChanges.total) !== 0 && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${parseFloat(percentageChanges.total) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(percentageChanges.total) > 0 ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {Math.abs(parseFloat(percentageChanges.total))}%
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* New Leads Card */}
          <Link
            href="/admin/leads?status=New"
            className="group relative bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 hover:border-blue-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:from-blue-200 group-hover:to-cyan-200 transition-all transform group-hover:scale-110">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-4xl font-bold text-blue-600">
                  {metrics.newLeads}
                </div>
                {timeRange !== 'all' && parseFloat(percentageChanges.new) !== 0 && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${parseFloat(percentageChanges.new) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(percentageChanges.new) > 0 ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {Math.abs(parseFloat(percentageChanges.new))}%
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-600">New Leads</div>
            </div>
          </Link>

          {/* Awaiting Action Card */}
          <Link
            href="/admin/leads?status=Quoted"
            className="group relative bg-gradient-to-br from-white to-yellow-50/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-yellow-100 hover:border-yellow-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/50 to-transparent rounded-bl-full"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl group-hover:from-yellow-200 group-hover:to-amber-200 transition-all transform group-hover:scale-110">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-yellow-600 mb-1">
                {metrics.awaitingAction}
              </div>
              <div className="text-sm font-semibold text-gray-600">
                Awaiting Action
              </div>
            </div>
          </Link>

          {/* Completed Card */}
          <Link
            href="/admin/leads?status=Completed"
            className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-transparent rounded-bl-full"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all transform group-hover:scale-110">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-4xl font-bold text-green-600">
                  {metrics.completed}
                </div>
                {timeRange !== 'all' && parseFloat(percentageChanges.completed) !== 0 && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${parseFloat(percentageChanges.completed) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(percentageChanges.completed) > 0 ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {Math.abs(parseFloat(percentageChanges.completed))}%
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-600">Completed</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="hidden lg:block">
          <DashboardChart
            type="line"
            data={leadTrendsData}
            title="Lead Trends"
            height={280}
            color="#6366f1"
          />
        </div>
        <div className="hidden lg:block">
          <DashboardChart
            type="pie"
            data={statusDistributionData}
            title="Status Distribution"
            height={280}
          />
        </div>
        <div className="lg:hidden">
          <DashboardChart
            type="line"
            data={leadTrendsData}
            title="Lead Trends"
            height={240}
            color="#6366f1"
          />
        </div>
        <div className="lg:hidden">
          <DashboardChart
            type="pie"
            data={statusDistributionData}
            title="Status Distribution"
            height={240}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <DashboardChart
          type="bar"
          data={revenueTrendsData}
          title="Revenue Trends"
          height={300}
          color="#10b981"
        />
      </div>
      <div className="md:hidden">
        <DashboardChart
          type="bar"
          data={revenueTrendsData}
          title="Revenue Trends"
          height={240}
          color="#10b981"
        />
      </div>

      {/* Conversion Funnel */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Conversion Funnel</h2>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm md:text-base">
                  1
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">New Leads</div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {metrics.newLeads} leads
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {metrics.newLeads}
                </div>
                <div className="text-xs text-gray-500">100%</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm md:text-base">
                  2
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Quoted</div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {metrics.quoted} leads
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {metrics.quoted}
                </div>
                <div className="text-xs text-gray-500">
                  {conversionRates.newToQuoted}%
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                style={{
                  width: `${Math.min((metrics.quoted / (metrics.newLeads || 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm md:text-base">
                  3
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Paid</div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {metrics.paymentReceived} leads
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">
                  {metrics.paymentReceived}
                </div>
                <div className="text-xs text-gray-500">
                  {conversionRates.quotedToPaid}%
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                style={{
                  width: `${Math.min((metrics.paymentReceived / (metrics.quoted || 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm md:text-base">
                  4
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Completed</div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {metrics.completed} leads
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {metrics.completed}
                </div>
                <div className="text-xs text-gray-500">
                  {conversionRates.paidToCompleted}%
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                style={{
                  width: `${Math.min((metrics.completed / (metrics.paymentReceived || 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Revenue Metrics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Quoted
            </div>
            <div className="text-3xl font-bold text-gray-900">
              AED {metrics.totalQuoted.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Paid
            </div>
            <div className="text-3xl font-bold text-green-600">
              AED {metrics.totalPaid.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Pending Payments
            </div>
            <div className="text-3xl font-bold text-orange-600">
              AED {metrics.pendingPayments.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Leads by Status</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { status: 'New', count: metrics.newLeads, colorClass: 'blue', textClass: 'text-blue-600', borderClass: 'hover:border-blue-400' },
            {
              status: 'Agent Contacted',
              count: metrics.agentContacted,
              colorClass: 'yellow',
              textClass: 'text-yellow-600',
              borderClass: 'hover:border-yellow-400',
            },
            { status: 'Quoted', count: metrics.quoted, colorClass: 'purple', textClass: 'text-purple-600', borderClass: 'hover:border-purple-400' },
            {
              status: 'Invoice Sent',
              count: metrics.invoiceSent,
              colorClass: 'indigo',
              textClass: 'text-indigo-600',
              borderClass: 'hover:border-indigo-400',
            },
            {
              status: 'Awaiting Payment',
              count: metrics.awaitingPayment,
              colorClass: 'orange',
              textClass: 'text-orange-600',
              borderClass: 'hover:border-orange-400',
            },
            {
              status: 'Completed',
              count: metrics.completed,
              colorClass: 'green',
              textClass: 'text-green-600',
              borderClass: 'hover:border-green-400',
            },
          ].map((item) => (
            <Link
              key={item.status}
              href={`/admin/leads?status=${encodeURIComponent(item.status)}`}
              className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg ${item.borderClass} transition-all text-center group`}
            >
              <div
                className={`text-2xl font-bold ${item.textClass} mb-1 group-hover:scale-110 transition-transform`}
              >
                {item.count}
              </div>
              <div className="text-xs font-medium text-gray-600">
                {item.status}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions & Agent Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/admin/leads?status=New"
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    View All New Leads
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.newLeads} leads need attention
                  </div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/admin/leads?status=Quoted"
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg hover:border-purple-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    Leads Awaiting Quote
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.awaitingQuote} leads need quotes
                  </div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/admin/leads?status=Awaiting Payment"
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg hover:border-orange-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    Leads Awaiting Payment
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.awaitingPaymentCount} leads waiting for payment
                  </div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Agent Workload */}
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Agent Workload</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Use the Agents page to view and manage agent assignments. Legacy
              agent counts are shown below for reference.
            </p>
            <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: 'Athar',
                count: metrics.withAthar,
                textClass: 'text-blue-600',
                borderClass: 'hover:border-blue-400',
                href: '/admin/leads?assigned=athar',
              },
              {
                name: 'Anoop',
                count: metrics.withAnoop,
                textClass: 'text-purple-600',
                borderClass: 'hover:border-purple-400',
                href: '/admin/leads?assigned=anoop',
              },
              {
                name: 'Self',
                count: metrics.withSelf,
                textClass: 'text-green-600',
                borderClass: 'hover:border-green-400',
                href: '/admin/leads?assigned=self',
              },
              {
                name: 'Unassigned',
                count: metrics.unassigned,
                textClass: 'text-gray-600',
                borderClass: 'hover:border-gray-400',
                href: '/admin/leads?assigned=unassigned',
              },
            ].map((agent) => (
              <Link
                key={agent.name}
                href={agent.href}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md ${agent.borderClass} transition-all text-center group`}
              >
                <div
                  className={`text-2xl font-bold ${agent.textClass} mb-1 group-hover:scale-110 transition-transform`}
                >
                  {agent.count}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {agent.name}
                </div>
                {agent.name !== 'Unassigned' && (
                  <div className="text-xs text-gray-500 mt-1">(Legacy)</div>
                )}
              </Link>
            ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/admin/agents"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                View All Agents
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

