'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientImage from '@/components/ClientImage';

interface CustomerDetails {
  fullName: string | null;
  email: string | null;
  whatsapp: string | null;
  nationality: string | null;
  residenceCountry: string | null;
  setupType: string | null;
  activity: string | null;
  shareholdersCount: number | null;
  visasRequired: boolean | null;
  visasCount: number | null;
  timeline: string | null;
}

interface InvoiceDetails {
  ok: boolean;
  invoice?: {
    number: string | null;
    version: number;
    amountAed: number | null;
    paymentLink: string | null;
    html: string;
    sentAt?: string;
  };
  customer?: CustomerDetails | null;
  error?: string;
}

/**
 * Format amount in AED
 */
function formatAmount(amount: number | null): string | null {
  if (!amount) return null;
  return amount.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });
}

function InvoiceViewPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ status?: number; responseBody?: string } | null>(null);

  // Get support email (client-side, will use default if env var not available)
  const supportEmail = 'support@uaebusinessdesk.com';

  // Fetch invoice details function (reusable, memoized)
  const fetchInvoiceDetails = useCallback(async () => {
    if (!token) {
      setError('Invalid Link');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/invoice/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        cache: 'no-store', // Ensure we always get latest data from DB
      });

      // If response is not ok, read response.text() safely
      if (!response.ok) {
        let responseBodyText = '';
        try {
          responseBodyText = await response.text();
        } catch (textError) {
          console.warn('[Invoice View Page] Could not read error response body:', textError);
        }

        // Try to parse as JSON if we got text
        let errorData: any = {};
        if (responseBodyText) {
          try {
            errorData = JSON.parse(responseBodyText);
          } catch (parseError) {
            errorData = { error: responseBodyText };
          }
        }

        // Store error details for dev debugging
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          setErrorDetails({
            status: response.status,
            responseBody: responseBodyText.substring(0, 300),
          });
        }

        // Set user-friendly error message
        if (response.status === 401) {
          setError('Invalid or Expired Link');
        } else if (response.status === 404) {
          setError('Invoice Not Found');
        } else {
          setError(errorData.error || 'Failed to load invoice details');
        }
        setLoading(false);
        return;
      }

      // Response is ok - parse JSON
      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
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
        setError(data.error || 'Failed to load invoice details');
        setLoading(false);
        return;
      }

      // Success - set invoice details
      if (data.invoice) {
        setInvoiceDetails({
          ok: true,
          invoice: data.invoice,
        });
      } else {
        setInvoiceDetails(data);
      }
      setError(null);
      setErrorDetails(null);
    } catch (err: any) {
      console.error('[Invoice View Page] Error fetching details:', err);
      setError('Error Processing Request');
      
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

  // Fetch invoice details on load
  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  // Format amount
  const invoice = invoiceDetails?.invoice;
  const customer = invoiceDetails?.customer;
  const formattedAmount = invoice?.amountAed 
    ? formatAmount(invoice.amountAed)
    : null;
  const isRevised = invoice ? (invoice.version > 1) : false;

  // Format setup type for display
  const formatSetupType = (setupType: string | null | undefined): string => {
    if (!setupType) return 'N/A';
    // Capitalize first letter of each word
    return setupType.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

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
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error || !invoiceDetails || !invoiceDetails.invoice) {
    const errorMessage = error || invoiceDetails?.error || 'Unknown error';
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
             errorMessage === 'Invoice Not Found' ? 'Invoice Not Found' :
             'Error Processing Request'}
          </h1>
          <p className="text-gray-600">
            {errorMessage === 'Invalid Link' ? 'This invoice link is invalid or missing a token.' :
             errorMessage === 'Invalid or Expired Link' ? 'This invoice link is invalid or has expired. Please contact us for assistance.' :
             errorMessage === 'Invoice Not Found' ? 'The invoice could not be found. Please contact us for assistance.' :
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

  // Success state - render invoice details
  const logoUrl = 'https://www.uaebusinessdesk.com/assets/header-logo.png';
  const brandName = 'UAE Business Desk';
  const tagline = 'Clarity before commitment';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card with Standardized Header */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-6">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <ClientImage
                src={logoUrl}
                alt={brandName}
                className="w-10 h-10 object-contain"
              />
              <span className="text-4xl font-bold text-white tracking-wider">UBD</span>
            </div>
            <p className="text-white/90 italic text-sm mb-4 tracking-wide">{tagline}</p>
            <h1 className="text-3xl font-bold text-white mb-2">Invoice</h1>
            {isRevised && invoice && (
              <p className="text-sm text-white/80 font-medium mt-2">
                Revised Invoice (R{invoice.version})
              </p>
            )}
            {invoice?.number && (
              <p className="text-sm text-white/80 mt-2">Invoice #{invoice.number}</p>
            )}
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">

            {/* Invoice Amount - Prominent */}
            {formattedAmount && (
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-8 border-2 border-amber-200">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Amount</p>
                  <p className="text-5xl font-bold text-amber-600 mb-4">{formattedAmount}</p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {invoice?.paymentLink && (
              <div className="mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 text-center">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Complete Your Payment</h2>
                  <p className="text-sm text-gray-600 mb-4">Please complete your payment using the secure link below:</p>
                  <a
                    href={invoice.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg rounded-xl hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Pay Now via Ziina
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="mt-4 text-xs text-gray-600">
                    Or copy this link: <span className="font-mono text-xs break-all">{invoice.paymentLink}</span>
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    Opens in a new tab
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information Card */}
        {customer && (
          <div className="bg-white shadow-2xl rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customer.fullName && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-base text-gray-900">{customer.fullName}</p>
                </div>
              )}
              {customer.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-base text-amber-600 hover:text-amber-800 underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.whatsapp && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-base text-amber-600 hover:text-amber-800 underline">
                    {customer.whatsapp}
                  </a>
                </div>
              )}
              {customer.nationality && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Nationality</p>
                  <p className="text-base text-gray-900">{customer.nationality}</p>
                </div>
              )}
              {customer.residenceCountry && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Country of Residence</p>
                  <p className="text-base text-gray-900">{customer.residenceCountry}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Request Details Card */}
        {customer && (
          <div className="bg-white shadow-2xl rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Service Request Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customer.setupType && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Setup Type</p>
                  <p className="text-base text-gray-900 font-semibold">{formatSetupType(customer.setupType)}</p>
                </div>
              )}
              {customer.activity && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Business Activity</p>
                  <p className="text-base text-gray-900">{customer.activity}</p>
                </div>
              )}
              {customer.shareholdersCount !== null && customer.shareholdersCount !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Number of Shareholders</p>
                  <p className="text-base text-gray-900">{customer.shareholdersCount}</p>
                </div>
              )}
              {customer.visasRequired !== null && customer.visasRequired !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Visas Required</p>
                  <p className="text-base text-gray-900">
                    {customer.visasRequired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Yes
                        {customer.visasCount !== null && customer.visasCount !== undefined && ` (${customer.visasCount})`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </p>
                </div>
              )}
              {customer.timeline && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Preferred Timeline</p>
                  <p className="text-base text-gray-900">{customer.timeline}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Need help */}
        <div className="bg-white shadow-2xl rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Need help?</p>
              <p className="text-sm text-gray-600">
                Contact us at{' '}
                <a href={`mailto:${supportEmail}`} className="text-amber-600 hover:text-amber-800 font-medium underline">
                  {supportEmail}
                </a>
                {' '}or{' '}
                <a href="https://wa.me/971504209110?text=Hi%20UAE%20Business%20Desk,%20I%20have%20a%20question%20about%20my%20invoice." className="text-amber-600 hover:text-amber-800 font-medium underline">
                  WhatsApp: +971 50 420 9110
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvoiceViewPageContent />
    </Suspense>
  );
}
