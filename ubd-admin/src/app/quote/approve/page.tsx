'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DecisionButtons from './DecisionButtons';
import QuoteViewTracker from './QuoteViewTracker';

interface QuoteDetails {
  ok: boolean;
  quotedAmountAed: number | null;
  serviceName: string;
  customerName: string | null;
  companyName: string | null;
  quoteCoverage?: string;
  quoteViewedAt: string | null;
  proceededAt: string | null;
  approvedAt: string | null;
  declinedAt: string | null;
  quoteDeclineReason: string | null;
  questionsAt: string | null;
  questionsReason: string | null;
  alreadyProceeded: boolean;
  alreadyDeclined: boolean;
  alreadyHasQuestions?: boolean;
  error?: string;
}

/**
 * Format date helper
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Dubai',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function QuoteDecisionPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ status?: number; responseBody?: string } | null>(null);

  // Get support email and WhatsApp (client-side, will use default if env var not available)
  const supportEmail = 'support@uaebusinessdesk.com';
  const supportWhatsApp = '+971 50 420 9110';

  // Fetch quote details function (reusable, memoized)
  const fetchQuoteDetails = useCallback(async () => {
    if (!token) {
      setError('Invalid Link');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/quote/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        cache: 'no-store', // Ensure we always get latest data from DB - never use cached data
      });

      // If response is not ok, read response.text() safely
      if (!response.ok) {
        let responseBodyText = '';
        try {
          responseBodyText = await response.text();
        } catch (textError) {
          // If we can't read the body, that's okay
          console.warn('[Quote Decision Page] Could not read error response body:', textError);
        }

        // Try to parse as JSON if we got text
        let errorData: any = {};
        if (responseBodyText) {
          try {
            errorData = JSON.parse(responseBodyText);
          } catch (parseError) {
            // If not JSON, use the raw text as error message
            errorData = { error: responseBodyText };
          }
        }

        // Store error details for dev debugging
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          setErrorDetails({
            status: response.status,
            responseBody: responseBodyText.substring(0, 300), // First 300 chars
          });
        }

        // Set user-friendly error message
        if (response.status === 401) {
          setError('Invalid or Expired Link');
        } else if (response.status === 404) {
          setError('Lead Not Found');
        } else {
          setError(errorData.error || 'Failed to load quote details');
        }
        setLoading(false);
        return;
      }

      // Response is ok - parse JSON
      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, treat as error
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          setErrorDetails({
            status: response.status,
            responseBody: 'Response is not valid JSON',
          });
        }
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      // Check if data indicates success
      if (!data.ok) {
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          setErrorDetails({
            status: response.status,
            responseBody: JSON.stringify(data).substring(0, 300),
          });
        }
        setError(data.error || 'Failed to load quote details');
        setLoading(false);
        return;
      }

      // Success - set quote details
      setQuoteDetails(data);
      setError(null);
      setErrorDetails(null);
    } catch (err: any) {
      console.error('[Quote Decision Page] Error fetching details:', err);
      setError('Error Processing Request');
      
      // Store error details for dev debugging
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        setErrorDetails({
          status: undefined,
          responseBody: err.message || String(err),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch quote details on load
  useEffect(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]);

  // Format amount in AED
  const formattedAmount = quoteDetails?.quotedAmountAed 
    ? quoteDetails.quotedAmountAed.toLocaleString('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
      })
    : null;

  // Format dates (use proceededAt for "Already proceeded" check)
  const proceedDate = quoteDetails?.proceededAt ? new Date(quoteDetails.proceededAt) : null;
  const declineDate = quoteDetails?.declinedAt ? new Date(quoteDetails.declinedAt) : null;
  const questionsDate = quoteDetails?.questionsAt ? new Date(quoteDetails.questionsAt) : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-12 text-center">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading quote details...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error || !quoteDetails) {
    const errorMessage = error || quoteDetails?.error || 'Unknown error';
    const isDev = process.env.NODE_ENV !== 'production';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-12 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorMessage === 'Invalid Link' ? 'Invalid Link' :
             errorMessage === 'Invalid or Expired Link' ? 'Invalid or Expired Link' :
             errorMessage === 'Lead Not Found' ? 'Lead Not Found' :
             'Error Processing Request'}
          </h1>
          <p className="text-gray-600">
            {errorMessage === 'Invalid Link' ? 'This approval link is invalid or missing a token.' :
             errorMessage === 'Invalid or Expired Link' ? 'This approval link is invalid or has expired. Please contact us for assistance.' :
             errorMessage === 'Lead Not Found' ? 'The quote could not be found. Please contact us for assistance.' :
             'An error occurred while processing your request. Please contact us for assistance.'}
          </p>
          
          {/* DEV-only: Show detailed error information */}
          {isDev && errorDetails && (
            <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-left">
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Debug Info (DEV only)</p>
              <div className="space-y-2 text-xs font-mono">
                {errorDetails.status !== undefined && (
                  <div>
                    <span className="text-gray-600">HTTP Status:</span>{' '}
                    <span className="text-red-600 font-semibold">{errorDetails.status}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Error Message:</span>{' '}
                  <span className="text-red-600">{errorMessage}</span>
                </div>
                {errorDetails.responseBody && (
                  <div>
                    <span className="text-gray-600">Response Body:</span>
                    <pre className="mt-1 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-32">
                      {errorDetails.responseBody.replace(/token["']?\s*:\s*["'][^"']+["']/gi, 'token: "[REDACTED]"')}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state - render quote details
  return (
    <>
      {/* Track quote view on page load */}
      {token && <QuoteViewTracker token={token} />}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">View Quote</h1>
            <p className="text-indigo-100 text-sm">Review your service quote and make a decision</p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">

            {/* Quote Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Information */}
              {(quoteDetails.customerName || quoteDetails.companyName) && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Information</h3>
                  {quoteDetails.customerName && (
                    <p className="text-base text-gray-900 font-medium mb-2">
                      {quoteDetails.customerName}
                    </p>
                  )}
                  {quoteDetails.companyName && quoteDetails.customerName !== quoteDetails.companyName && (
                    <p className="text-sm text-gray-600">
                      {quoteDetails.companyName}
                    </p>
                  )}
                </div>
              )}

              {/* Service Information */}
              {quoteDetails.serviceName && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Service</h3>
                  <p className="text-lg font-bold text-gray-900">{quoteDetails.serviceName}</p>
                </div>
              )}
            </div>

            {/* Quote Amount - Prominent Display */}
            {formattedAmount && (
              <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-200">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Quoted Amount</p>
                  <p className="text-4xl font-bold text-indigo-600 mb-4">{formattedAmount}</p>
                  {quoteDetails.quoteCoverage && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-amber-900 mb-1">What this quote covers:</p>
                      <p className="text-sm text-amber-800">{quoteDetails.quoteCoverage}</p>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800 font-medium">
                      No payment is required at this stage.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Decision Buttons */}
          {token && (
            <DecisionButtons
              token={token}
              alreadyProceeded={quoteDetails.alreadyProceeded}
              alreadyDeclined={quoteDetails.alreadyDeclined}
              alreadyHasQuestions={quoteDetails.alreadyHasQuestions}
              proceedDate={proceedDate}
              declineDate={declineDate}
              questionsDate={questionsDate}
              supportEmail={supportEmail}
              supportWhatsApp={supportWhatsApp}
              onDecisionComplete={fetchQuoteDetails}
            />
          )}

            {/* What happens next - Show only if not already decided */}
            {!quoteDetails.alreadyProceeded && !quoteDetails.alreadyDeclined && !quoteDetails.alreadyHasQuestions && (
              <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  What happens next?
                </h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </div>
                    <span className="pt-0.5">We'll email you a secure payment link.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <span className="pt-0.5">Once payment is received, we'll start processing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <span className="pt-0.5">We may contact you if we need clarifications.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Need help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Need help?</p>
                  <p className="text-sm text-gray-600">
                    Reply to the quote email or contact us at{' '}
                    <a href={`mailto:${supportEmail}`} className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                      {supportEmail}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
