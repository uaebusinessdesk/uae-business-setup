import { NextRequest, NextResponse } from 'next/server';
import { verifyInvoiceToken } from '@/lib/invoice-token';
import { db } from '@/lib/db';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/invoice/details
 * Get invoice details by token
 * Body: { token: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    let leadId: string;
    let version: number | undefined;
    let project: 'company' | 'bank' | 'bank-deal';
    try {
      const decoded = await verifyInvoiceToken(token);
      leadId = decoded.leadId;
      version = decoded.version;
      project = decoded.project || 'company';
    } catch (error: any) {
      console.error('[API/Invoice/Details] Token verification failed:', error);
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch lead details for customer information
    let lead: any = null;
    try {
      lead = await db.lead.findUnique({
        where: { id: leadId },
        select: {
          fullName: true,
          email: true,
          whatsapp: true,
          nationality: true,
          residenceCountry: true,
          setupType: true,
          activity: true,
          shareholdersCount: true,
          visasRequired: true,
          visasCount: true,
          timeline: true,
        },
      });
    } catch (leadError) {
      // Continue even if lead fetch fails - we'll just not include customer details
      console.warn('[API/Invoice/Details] Could not fetch lead details:', leadError);
    }

    // If version is provided, fetch that specific revision
    if (version !== undefined) {
      const revision = project === 'bank' || project === 'bank-deal'
        ? await db.bankInvoiceRevision.findUnique({
            where: {
              leadId_version: {
                leadId,
                version,
              },
            },
          })
        : await db.companyInvoiceRevision.findUnique({
            where: {
              leadId_version: {
                leadId,
                version,
              },
            },
          });

      if (!revision) {
        return NextResponse.json(
          { ok: false, error: 'Invoice revision not found' },
          { status: 404 }
        );
      }

      // Track invoice view (only on first view)
      const now = new Date();
      try {
        const leadRecord = await db.lead.findUnique({
          where: { id: leadId },
          select: {
            fullName: true,
            email: true,
            companyInvoiceViewedAt: true,
            bankInvoiceViewedAt: true,
            bankDealInvoiceViewedAt: true,
            companyInvoiceAmountAed: true,
            bankInvoiceAmountAed: true,
            bankDealInvoiceAmountAed: true,
            companyInvoiceNumber: true,
            bankInvoiceNumber: true,
            bankDealInvoiceNumber: true,
          },
        });
        
        const leadData = leadRecord;
        if (leadData) {
          const viewedAtField = project === 'bank-deal'
            ? leadData.bankDealInvoiceViewedAt
            : (project === 'bank' ? leadData.bankInvoiceViewedAt : leadData.companyInvoiceViewedAt);
          if (!viewedAtField) {
            const updateData: any = project === 'bank-deal'
              ? { bankDealInvoiceViewedAt: now }
              : (project === 'bank'
                ? { bankInvoiceViewedAt: now }
                : { companyInvoiceViewedAt: now });

            await db.lead.update({
              where: { id: leadId },
              data: updateData,
            });

            // Send admin notification (only on first view)
            // ⚠️ INVOICE VIEWED NOTIFICATION - FINALIZED & APPROVED ⚠️
            // This notification has been reviewed and approved.
            // Admin receives email notification when customer views the invoice.
            // Please do not modify without careful review and approval.
            try {
              const invoiceAmount = project === 'bank-deal'
                ? (revision.amountAed || leadData.bankDealInvoiceAmountAed)
                : (project === 'bank'
                  ? (revision.amountAed || leadData.bankInvoiceAmountAed)
                  : (revision.amountAed || leadData.companyInvoiceAmountAed));
              const invoiceNumber = project === 'bank-deal'
                ? (revision.invoiceNumber || leadData.bankDealInvoiceNumber)
                : (project === 'bank'
                  ? (revision.invoiceNumber || leadData.bankInvoiceNumber)
                  : (revision.invoiceNumber || leadData.companyInvoiceNumber));
              const fullName = leadData.fullName || 'Unknown';
              const email = leadData.email || 'No email';
              const amountStr = invoiceAmount ? `AED ${invoiceAmount.toLocaleString()}` : 'Amount not set';
              const projectLabel = project === 'bank-deal' ? 'Bank Deal' : (project === 'bank' ? 'Bank' : 'Company');

              await notifyAdmin({
                event: 'invoice_viewed',
                leadId,
                project: project === 'bank-deal' ? 'bank' : project as 'bank' | 'company',
                subject: `[Invoice Viewed] Lead ${fullName} – ${invoiceNumber || amountStr}`,
                lines: [
                  `Invoice viewed by customer`,
                  `Lead: ${fullName}`,
                  `Email: ${email}`,
                  `Invoice: ${invoiceNumber || 'N/A'}`,
                  `Amount: ${amountStr}`,
                  `Project: ${projectLabel}`,
                  `Viewed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
                ],
              });
            } catch (notifyError) {
              console.error('Failed to send admin notification:', notifyError);
              // Don't fail the request if notification fails
            }
          }
        }
      } catch (trackError) {
        console.error('Failed to track invoice view:', trackError);
        // Don't fail the request if tracking fails
      }

      return NextResponse.json({
        ok: true,
        invoice: {
          number: revision.invoiceNumber,
          version: revision.version,
          amountAed: revision.amountAed,
          paymentLink: revision.paymentLink,
          html: revision.html,
          sentAt: revision.sentAt,
        },
        customer: lead ? {
          fullName: lead.fullName,
          email: lead.email,
          whatsapp: lead.whatsapp,
          nationality: lead.nationality,
          residenceCountry: lead.residenceCountry,
          setupType: lead.setupType,
          activity: lead.activity,
          shareholdersCount: lead.shareholdersCount,
          visasRequired: lead.visasRequired,
          visasCount: lead.visasCount,
          timeline: lead.timeline,
        } : null,
      });
    }

    // No version in token: fetch latest revision (highest version number)
    const latestRevision = project === 'bank' || project === 'bank-deal'
      ? await db.bankInvoiceRevision.findFirst({
          where: { leadId },
          orderBy: { version: 'desc' },
        })
      : await db.companyInvoiceRevision.findFirst({
          where: { leadId },
          orderBy: { version: 'desc' },
        });

    if (latestRevision) {
      // Track invoice view (only on first view)
      const now = new Date();
      try {
        const leadRecord = await db.lead.findUnique({
          where: { id: leadId },
          select: {
            fullName: true,
            email: true,
            companyInvoiceViewedAt: true,
            bankInvoiceViewedAt: true,
            bankDealInvoiceViewedAt: true,
            companyInvoiceAmountAed: true,
            bankInvoiceAmountAed: true,
            bankDealInvoiceAmountAed: true,
            companyInvoiceNumber: true,
            bankInvoiceNumber: true,
            bankDealInvoiceNumber: true,
          },
        });
        
        const leadData = leadRecord;
        if (leadData) {
          const viewedAtField = project === 'bank-deal'
            ? leadData.bankDealInvoiceViewedAt
            : (project === 'bank' ? leadData.bankInvoiceViewedAt : leadData.companyInvoiceViewedAt);
          if (!viewedAtField) {
            const updateData: any = project === 'bank-deal'
              ? { bankDealInvoiceViewedAt: now }
              : (project === 'bank'
                ? { bankInvoiceViewedAt: now }
                : { companyInvoiceViewedAt: now });

            await db.lead.update({
              where: { id: leadId },
              data: updateData,
            });

            // Send admin notification (only on first view)
            // ⚠️ INVOICE VIEWED NOTIFICATION - FINALIZED & APPROVED ⚠️
            // This notification has been reviewed and approved.
            // Admin receives email notification when customer views the invoice.
            // Please do not modify without careful review and approval.
            try {
              const invoiceAmount = project === 'bank-deal'
                ? (latestRevision.amountAed || leadData.bankDealInvoiceAmountAed)
                : (project === 'bank'
                  ? (latestRevision.amountAed || leadData.bankInvoiceAmountAed)
                  : (latestRevision.amountAed || leadData.companyInvoiceAmountAed));
              const invoiceNumber = project === 'bank-deal'
                ? (latestRevision.invoiceNumber || leadData.bankDealInvoiceNumber)
                : (project === 'bank'
                  ? (latestRevision.invoiceNumber || leadData.bankInvoiceNumber)
                  : (latestRevision.invoiceNumber || leadData.companyInvoiceNumber));
              const fullName = leadData.fullName || 'Unknown';
              const email = leadData.email || 'No email';
              const amountStr = invoiceAmount ? `AED ${invoiceAmount.toLocaleString()}` : 'Amount not set';
              const projectLabel = project === 'bank-deal' ? 'Bank Deal' : (project === 'bank' ? 'Bank' : 'Company');

              await notifyAdmin({
                event: 'invoice_viewed',
                leadId,
                project: project === 'bank-deal' ? 'bank' : project as 'bank' | 'company',
                subject: `[Invoice Viewed] Lead ${fullName} – ${invoiceNumber || amountStr}`,
                lines: [
                  `Invoice viewed by customer`,
                  `Lead: ${fullName}`,
                  `Email: ${email}`,
                  `Invoice: ${invoiceNumber || 'N/A'}`,
                  `Amount: ${amountStr}`,
                  `Project: ${projectLabel}`,
                  `Viewed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
                ],
              });
            } catch (notifyError) {
              console.error('Failed to send admin notification:', notifyError);
              // Don't fail the request if notification fails
            }
          }
        }
      } catch (trackError) {
        console.error('Failed to track invoice view:', trackError);
        // Don't fail the request if tracking fails
      }

      return NextResponse.json({
        ok: true,
        invoice: {
          number: latestRevision.invoiceNumber,
          version: latestRevision.version,
          amountAed: latestRevision.amountAed,
          paymentLink: latestRevision.paymentLink,
          html: latestRevision.html,
          sentAt: latestRevision.sentAt,
        },
        customer: lead ? {
          fullName: lead.fullName,
          email: lead.email,
          whatsapp: lead.whatsapp,
          nationality: lead.nationality,
          residenceCountry: lead.residenceCountry,
          setupType: lead.setupType,
          activity: lead.activity,
          shareholdersCount: lead.shareholdersCount,
          visasRequired: lead.visasRequired,
          visasCount: lead.visasCount,
          timeline: lead.timeline,
        } : null,
      });
    }

    // Fallback to Lead fields for backward compatibility
    const leadData = await db.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        fullName: true,
        email: true,
        whatsapp: true,
        nationality: true,
        residenceCountry: true,
        setupType: true,
        activity: true,
        shareholdersCount: true,
        visasRequired: true,
        visasCount: true,
        timeline: true,
        companyInvoiceNumber: true,
        companyInvoiceVersion: true,
        companyInvoiceAmountAed: true,
        companyInvoicePaymentLink: true,
        companyInvoiceHtml: true,
        companyInvoiceSentAt: true,
        companyInvoiceViewedAt: true,
        bankInvoiceNumber: true,
        bankInvoiceVersion: true,
        bankInvoiceAmountAed: true,
        bankInvoicePaymentLink: true,
        bankInvoiceHtml: true,
        bankInvoiceSentAt: true,
        bankInvoiceViewedAt: true,
        bankDealInvoiceNumber: true,
        bankDealInvoiceVersion: true,
        bankDealInvoiceAmountAed: true,
        bankDealInvoicePaymentLink: true,
        bankDealInvoiceHtml: true,
        bankDealInvoiceSentAt: true,
        bankDealInvoiceViewedAt: true,
      },
    });

    if (!leadData) {
      return NextResponse.json(
        { ok: false, error: 'Invoice not found or link expired' },
        { status: 404 }
      );
    }

    // Return 404 if invoice not available based on project
    if (project === 'bank-deal') {
      if (!leadData.bankDealInvoiceSentAt) {
        return NextResponse.json(
          { ok: false, error: 'Invoice not found. The invoice has not been sent yet for this lead.' },
          { status: 404 }
        );
      }
      
      if (!leadData.bankDealInvoiceHtml) {
        return NextResponse.json(
          { ok: false, error: 'Invoice data incomplete. The invoice was sent but the HTML content is missing.' },
          { status: 404 }
        );
      }

      // Track invoice view (only on first view)
      const now = new Date();
      try {
        if (!leadData.bankDealInvoiceViewedAt) {
          await db.lead.update({
            where: { id: leadId },
            data: { bankDealInvoiceViewedAt: now },
          });

          // Send admin notification (only on first view)
          try {
            const amountStr = leadData.bankDealInvoiceAmountAed 
              ? `AED ${leadData.bankDealInvoiceAmountAed.toLocaleString()}` 
              : 'Amount not set';
            const invoiceNumber = leadData.bankDealInvoiceNumber || 'N/A';

            await notifyAdmin({
              event: 'invoice_viewed',
              leadId,
              project: 'bank' as 'bank' | 'company',
              subject: `[Invoice Viewed] Lead ${leadData.fullName} – ${invoiceNumber}`,
              lines: [
                `Invoice viewed by customer`,
                `Lead: ${leadData.fullName}`,
                `Email: ${leadData.email || 'No email'}`,
                `Invoice: ${invoiceNumber}`,
                `Amount: ${amountStr}`,
                `Project: Bank Deal`,
                `Viewed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
              ],
            });
          } catch (notifyError) {
            console.error('Failed to send admin notification:', notifyError);
            // Don't fail the request if notification fails
          }
        }
      } catch (trackError) {
        console.error('Failed to track invoice view:', trackError);
        // Don't fail the request if tracking fails
      }

      return NextResponse.json({
        ok: true,
        invoice: {
          number: leadData.bankDealInvoiceNumber,
          version: leadData.bankDealInvoiceVersion || 1,
          amountAed: leadData.bankDealInvoiceAmountAed,
          paymentLink: leadData.bankDealInvoicePaymentLink || null,
          html: leadData.bankDealInvoiceHtml,
          sentAt: leadData.bankDealInvoiceSentAt,
        },
        customer: {
          fullName: leadData.fullName,
          email: leadData.email,
          whatsapp: leadData.whatsapp,
          nationality: leadData.nationality,
          residenceCountry: leadData.residenceCountry,
          setupType: leadData.setupType,
          activity: leadData.activity,
          shareholdersCount: leadData.shareholdersCount,
          visasRequired: leadData.visasRequired,
          visasCount: leadData.visasCount,
          timeline: leadData.timeline,
        },
      });
    } else if (project === 'bank') {
      if (!leadData.bankInvoiceSentAt) {
        return NextResponse.json(
          { ok: false, error: 'Invoice not found. The invoice has not been sent yet for this lead.' },
          { status: 404 }
        );
      }
      
      if (!leadData.bankInvoiceHtml) {
        return NextResponse.json(
          { ok: false, error: 'Invoice data incomplete. The invoice was sent but the HTML content is missing.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        invoice: {
          number: leadData.bankInvoiceNumber,
          version: leadData.bankInvoiceVersion || 1,
          amountAed: leadData.bankInvoiceAmountAed,
          paymentLink: leadData.bankInvoicePaymentLink || null,
          html: leadData.bankInvoiceHtml,
          sentAt: leadData.bankInvoiceSentAt,
        },
        customer: {
          fullName: leadData.fullName,
          email: leadData.email,
          whatsapp: leadData.whatsapp,
          nationality: leadData.nationality,
          residenceCountry: leadData.residenceCountry,
          setupType: leadData.setupType,
          activity: leadData.activity,
          shareholdersCount: leadData.shareholdersCount,
          visasRequired: leadData.visasRequired,
          visasCount: leadData.visasCount,
          timeline: leadData.timeline,
        },
      });
    } else {
      // Company invoice fallback
      if (!leadData.companyInvoiceSentAt) {
        return NextResponse.json(
          { ok: false, error: 'Invoice not found. The invoice has not been sent yet for this lead.' },
          { status: 404 }
        );
      }
      
      if (!leadData.companyInvoiceHtml) {
        return NextResponse.json(
          { ok: false, error: 'Invoice data incomplete. The invoice was sent but the HTML content is missing.' },
          { status: 404 }
        );
      }

      // Track invoice view (only on first view)
      const now = new Date();
      try {
        if (!leadData.companyInvoiceViewedAt) {
          await db.lead.update({
            where: { id: leadId },
            data: { companyInvoiceViewedAt: now },
          });

          // Send admin notification (only on first view)
          // ⚠️ INVOICE VIEWED NOTIFICATION - FINALIZED & APPROVED ⚠️
          // This notification has been reviewed and approved.
          // Admin receives email notification when customer views the invoice.
          // Please do not modify without careful review and approval.
          try {
            const amountStr = leadData.companyInvoiceAmountAed 
              ? `AED ${leadData.companyInvoiceAmountAed.toLocaleString()}` 
              : 'Amount not set';
            const invoiceNumber = leadData.companyInvoiceNumber || 'N/A';

            await notifyAdmin({
              event: 'invoice_viewed',
              leadId,
              project: 'company',
              subject: `[Invoice Viewed] Lead ${leadData.fullName} – ${invoiceNumber}`,
              lines: [
                `Invoice viewed by customer`,
                `Lead: ${leadData.fullName}`,
                `Email: ${leadData.email || 'No email'}`,
                `Invoice: ${invoiceNumber}`,
                `Amount: ${amountStr}`,
                `Project: Company`,
                `Viewed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
              ],
            });
          } catch (notifyError) {
            console.error('Failed to send admin notification:', notifyError);
            // Don't fail the request if notification fails
          }
        }
      } catch (trackError) {
        console.error('Failed to track invoice view:', trackError);
        // Don't fail the request if tracking fails
      }

      return NextResponse.json({
        ok: true,
        invoice: {
          number: leadData.companyInvoiceNumber,
          version: leadData.companyInvoiceVersion || 1,
          amountAed: leadData.companyInvoiceAmountAed,
          paymentLink: leadData.companyInvoicePaymentLink || null,
          html: leadData.companyInvoiceHtml,
          sentAt: leadData.companyInvoiceSentAt,
        },
        customer: {
          fullName: leadData.fullName,
          email: leadData.email,
          whatsapp: leadData.whatsapp,
          nationality: leadData.nationality,
          residenceCountry: leadData.residenceCountry,
          setupType: leadData.setupType,
          activity: leadData.activity,
          shareholdersCount: leadData.shareholdersCount,
          visasRequired: leadData.visasRequired,
          visasCount: leadData.visasCount,
          timeline: leadData.timeline,
        },
      });
    }
  } catch (error: any) {
    console.error('[API/Invoice/Details] Error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to retrieve invoice details',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
      errorResponse.debugName = (error as any)?.name;
      errorResponse.debugCode = (error as any)?.code;
      errorResponse.debugStack = (error as any)?.stack?.split('\n').slice(0, 6).join('\n');
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
