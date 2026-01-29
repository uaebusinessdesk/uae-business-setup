import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateLeadRef } from '@/lib/email';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { normalizePhone, isValidE164 } from '@/lib/phone';

const adminRecipient = 'support@uaebusinessdesk.com';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://uaebusinessdesk.com',
  'https://www.uaebusinessdesk.com',
];

function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

function jsonError(origin: string | null, status: number, error: string, message: string): NextResponse {
  const response = NextResponse.json({ ok: false, error, message }, { status });
  return addCorsHeaders(response, origin);
}

function logRequest(origin: string | null, referer: string | null, ok: boolean): void {
  console.log(`[PUBLIC_LEAD_CAPTURE] origin=${origin || 'unknown'} referer=${referer || 'unknown'} ok=${ok}`);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.error('[public-leads-capture] email timeout', { label, ms });
      reject(new Error(`Timeout after ${ms}ms (${label})`));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const knownFields = new Set([
  'fullName',
  'whatsapp',
  'email',
  'serviceRequired',
  'helpWith',
  'serviceChoice',
  'nationality',
  'residenceCountry',
  'residence',
  'emirate',
  'activity',
  'shareholdersCount',
  'visasRequired',
  'visasCount',
  'timeline',
  'notes',
  'serviceDetails',
  'companyJurisdiction',
  'companyStatus',
  'monthlyTurnover',
  'turnoverLater',
  'existingUaeBankAccount',
  'existingAccountLater',
  'needsBankAccount',
  'privacyAccepted',
  'website',
]);

function toTrimmedString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

function toOptionalString(value: any): string | null {
  const trimmed = toTrimmedString(value);
  return trimmed ? trimmed : null;
}

function toOptionalInt(value: any): number | null {
  const trimmed = toTrimmedString(value);
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toOptionalBoolean(value: any): boolean | null {
  if (value === true || value === 'yes' || value === 'true') return true;
  if (value === false || value === 'no' || value === 'false') return false;
  return null;
}

function collectExtraFields(body: Record<string, any>): string[] {
  const extras: string[] = [];
  Object.keys(body || {}).forEach((key) => {
    if (knownFields.has(key)) return;
    const raw = body[key];
    if (raw === undefined || raw === null || raw === '') return;
    let value: string;
    if (typeof raw === 'string') {
      value = raw.trim();
    } else {
      try {
        value = JSON.stringify(raw);
      } catch {
        value = String(raw);
      }
    }
    if (!value) return;
    extras.push(`${key}: ${value}`);
  });
  return extras;
}

function formatTimeline(timeline: string | null): string {
  if (!timeline) return '';
  const timelineMap: Record<string, string> = {
    'immediately': 'Immediately',
    'within-1-month': 'Within 1 month',
    '1-3-months': '1–3 months',
    'exploring': 'Exploring',
  };
  return timelineMap[timeline.toLowerCase()] || timeline;
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const t0 = Date.now();
    console.info('[public-leads-capture] start', { origin, referer });
    let body: any;
    try {
      body = await request.json();
    } catch {
      const message = 'Invalid JSON in request body';
      logRequest(origin, referer, false);
      return jsonError(origin, 400, 'BAD_REQUEST', message);
    }

    const fullName = toTrimmedString(body.fullName);
    const whatsappRaw = toTrimmedString(body.whatsapp);
    const serviceRequired = toTrimmedString(body.serviceRequired || body.helpWith || body.serviceChoice);

    if (!fullName || !whatsappRaw || !serviceRequired) {
      const message = 'Missing required fields';
      logRequest(origin, referer, false);
      return jsonError(origin, 400, 'BAD_REQUEST', message);
    }

    const normalizedPhone = normalizePhone(whatsappRaw);
    if (!isValidE164(normalizedPhone)) {
      const message = 'Invalid phone number. Please include country code, e.g. +97150xxxxxxx';
      logRequest(origin, referer, false);
      return jsonError(origin, 400, 'BAD_REQUEST', message);
    }

    const leadRef = generateLeadRef();

    const notesParts: string[] = [];
    const rawNotes = toOptionalString(body.notes);
    if (rawNotes) {
      notesParts.push(rawNotes);
    }

    const bankFields: string[] = [];
    const companyJurisdiction = toOptionalString(body.companyJurisdiction);
    if (companyJurisdiction) bankFields.push(`Company Jurisdiction: ${companyJurisdiction}`);
    const companyStatus = toOptionalString(body.companyStatus);
    if (companyStatus) bankFields.push(`Company Status: ${companyStatus}`);
    const monthlyTurnover = toOptionalString(body.monthlyTurnover || body.turnoverLater);
    if (monthlyTurnover) bankFields.push(`Monthly Turnover: ${monthlyTurnover}`);
    if (body.existingUaeBankAccount !== undefined && body.existingUaeBankAccount !== null) {
      const existingValue = body.existingUaeBankAccount === 'yes' || body.existingUaeBankAccount === true ? 'Yes' : 'No';
      bankFields.push(`Existing UAE Bank Account: ${existingValue}`);
    } else if (body.existingAccountLater !== undefined && body.existingAccountLater !== null) {
      const existingValue = body.existingAccountLater === 'yes' || body.existingAccountLater === true ? 'Yes' : 'No';
      bankFields.push(`Existing UAE Bank Account: ${existingValue}`);
    }

    if (bankFields.length > 0) {
      notesParts.push(`Bank Account Details:\n${bankFields.join('\n')}`);
    }

    const extraFields = collectExtraFields(body);
    if (extraFields.length > 0) {
      notesParts.push(`Additional Fields:\n${extraFields.join('\n')}`);
    }

    notesParts.push(`Lead Reference: ${leadRef}`);
    const notesWithRef = notesParts.join('\n\n');

    let serviceDetailsString: string | null = null;
    if (body.serviceDetails) {
      try {
        serviceDetailsString = JSON.stringify(body.serviceDetails);
      } catch {
        serviceDetailsString = null;
      }
    }

    let setupType: string;
    if (serviceRequired === 'existing-company' || serviceRequired === 'bank' || body.serviceDetails?.bankAccountPrescreen) {
      setupType = 'bank';
    } else if (serviceRequired === 'mainland' || serviceRequired === 'freezone' || serviceRequired === 'offshore') {
      setupType = serviceRequired;
    } else if (serviceRequired === 'not-sure' || serviceRequired === 'not_sure') {
      setupType = 'not_sure';
    } else {
      setupType = serviceRequired;
    }

    const needsBankAccount = setupType === 'bank';
    const bankStage = needsBankAccount ? 'queued' : 'not_applicable';

    const lead = await db.lead.create({
      data: {
        fullName,
        whatsapp: normalizedPhone,
        email: toOptionalString(body.email),
        nationality: toOptionalString(body.nationality),
        residenceCountry: toOptionalString(body.residenceCountry || body.residence),
        emirate: toOptionalString(body.emirate),
        setupType,
        activity: toOptionalString(body.activity),
        shareholdersCount: toOptionalInt(body.shareholdersCount),
        visasRequired: toOptionalBoolean(body.visasRequired),
        visasCount: toOptionalInt(body.visasCount),
        timeline: toOptionalString(body.timeline),
        notes: notesWithRef,
        serviceDetails: serviceDetailsString,
        stage: 'new',
        assignedTo: 'unassigned',
        invoiceStatus: 'not_sent',
        assignedAgent: 'unassigned',
        companyStage: 'new',
        companyFeasible: false,
        companyAssignedTo: 'unassigned',
        companyInvoiceStatus: 'not_sent',
        needsBankAccount,
        bankStage,
        bankInvoiceStatus: 'not_sent',
      },
    });
    console.info('[public-leads-capture] created lead', { id: lead.id, ms: Date.now() - t0 });

    const isCallbackRequest = false;
    const isEnquiry = serviceRequired === 'not-sure' || serviceRequired === 'not_sure';
    const adminEmail = adminRecipient;

    let adminSubject: string;
    if (isCallbackRequest) {
      adminSubject = `📞 Callback Request – ${leadRef} | ${lead.fullName}`;
    } else {
      const isBankAccountSetup = setupType === 'bank' || serviceRequired === 'bank' || serviceRequired === 'existing-company';
      const serviceType = isBankAccountSetup ? 'Bank Account Setup' :
                          serviceRequired === 'mainland' ? 'Mainland' :
                          serviceRequired === 'freezone' ? 'Free Zone' :
                          serviceRequired === 'offshore' ? 'Offshore' :
                          serviceRequired === 'not-sure' ? 'General Enquiry' :
                          'Company Setup';
      adminSubject = isEnquiry
        ? `📧 New Enquiry – ${leadRef} | ${lead.fullName}`
        : `🎯 New Lead: ${serviceType} – ${leadRef} | ${lead.fullName}`;
    }

    let serviceName: string;
    if (isCallbackRequest) {
      serviceName = 'Callback Request';
    } else {
      serviceName = serviceRequired === 'mainland' ? 'Mainland Company Setup' :
                    serviceRequired === 'freezone' ? 'Free Zone Company Setup' :
                    serviceRequired === 'offshore' ? 'Offshore Company Setup' :
                    serviceRequired === 'existing-company' ? 'Bank Account Setup' :
                    serviceRequired === 'not-sure' ? 'General Enquiry' :
                    serviceRequired;
    }

    const agentName = lead.assignedAgent === 'athar' ? 'Athar' :
                     lead.assignedAgent === 'anoop' ? 'Anoop' :
                     lead.assignedAgent === 'self' ? 'Self' :
                     'Unassigned';

    const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.uaebusinessdesk.com/assets/footer-logo.png';

    const adminHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333333;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 700px;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); padding: 30px 40px; text-align: center;">
                    <img src="${logoUrl}" alt="UAE Business Desk" width="160" height="auto" style="max-width: 160px; height: auto; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; border: 0; outline: none; text-decoration: none;" />
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${isCallbackRequest ? '📞 Callback Request Received' : isEnquiry ? 'New Enquiry Received' : 'New Lead Received'}</h1>
                  </td>
                </tr>
                
                <!-- Reference Badge -->
                <tr>
                  <td style="padding: 24px 40px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f3; border-left: 4px solid #c9a14a; border-radius: 4px; padding: 16px 20px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #0b2a4a; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${isEnquiry ? 'Enquiry Reference' : 'Lead Reference'}</p>
                          <p style="margin: 4px 0 0; color: #333333; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">${leadRef}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Client Information Section -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <h2 style="margin: 0 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Client Information</h2>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; width: 40%;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Name</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #0b2a4a; font-size: 15px; font-weight: 600;">${lead.fullName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">WhatsApp</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #0b2a4a; font-size: 15px;">
                            <a href="https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}" style="color: #0b2a4a; text-decoration: none; font-weight: 600;">${lead.whatsapp}</a>
                          </p>
                        </td>
                      </tr>
                      ${lead.email ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Email</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #0b2a4a; font-size: 15px;">
                            <a href="mailto:${lead.email}" style="color: #0b2a4a; text-decoration: none; font-weight: 600;">${lead.email}</a>
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.nationality ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Nationality</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.nationality}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.residenceCountry ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Country of Residence</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.residenceCountry}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.emirate ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Preferred Emirate</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.emirate}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
                
                <!-- Service Details Section -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <h2 style="margin: 0 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Service Details</h2>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; width: 40%;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Service Requested</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #0b2a4a; font-size: 15px; font-weight: 600;">${serviceName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Assigned Agent</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px; font-weight: 600;">${agentName}</p>
                        </td>
                      </tr>
                      ${lead.activity ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Business Activity</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.activity}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.shareholdersCount ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Shareholders</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.shareholdersCount}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.visasRequired !== null ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Visas Required</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.visasRequired ? (lead.visasCount ? `${lead.visasCount}` : 'Yes') : 'No'}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.timeline ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Preferred Timeline</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${formatTimeline(lead.timeline)}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${lead.needsBankAccount && setupType === 'bank' ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Bank Account Support</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px; font-weight: 600;">Yes (Standalone Service)</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${body.companyJurisdiction ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Company Jurisdiction</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${body.companyJurisdiction}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${body.companyStatus ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Company Status</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${body.companyStatus}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${body.monthlyTurnover ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Monthly Turnover</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${body.monthlyTurnover}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${body.existingUaeBankAccount !== undefined && body.existingUaeBankAccount !== null ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Existing UAE Bank Account</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${body.existingUaeBankAccount === 'yes' || body.existingUaeBankAccount === true ? 'Yes' : 'No'}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
                
                <!-- Additional Notes Section (User-entered notes only) -->
                ${(() => {
                  // Remove lead reference and bank account details from notes
                  let userNotes = lead.notes || '';
                  // Remove lead reference
                  userNotes = userNotes.replace(new RegExp(`${isEnquiry ? 'Enquiry Reference' : 'Lead Reference'}: ${leadRef}`, 'g'), '').trim();
                  // Remove bank account details section
                  userNotes = userNotes.replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '').trim();
                  // Clean up extra newlines
                  userNotes = userNotes.replace(/\n{3,}/g, '\n\n').trim();
                  return userNotes;
                })() ? `
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <h2 style="margin: 0 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Additional Notes</h2>
                    <div style="background-color: #f8fafc; border-left: 3px solid #c9a14a; border-radius: 4px; padding: 16px 20px; margin: 0;">
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${(() => {
                        // Remove lead reference and bank account details from notes
                        let userNotes = lead.notes || '';
                        // Remove lead reference
                        userNotes = userNotes.replace(new RegExp(`${isEnquiry ? 'Enquiry Reference' : 'Lead Reference'}: ${leadRef}`, 'g'), '').trim();
                        // Remove bank account details section
                        userNotes = userNotes.replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '').trim();
                        // Clean up extra newlines
                        userNotes = userNotes.replace(/\n{3,}/g, '\n\n').trim();
                        return userNotes.replace(/\n/g, '<br>');
                      })()}</p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Action Required Section -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 6px; padding: 20px 24px; margin: 0;">
                      <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px; font-weight: 700;">📋 Action Required</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">Review the lead details above</li>
                        <li style="margin-bottom: 8px;">Assign an agent if not already assigned</li>
                        <li style="margin-bottom: 8px;">Contact the client within 24 hours via WhatsApp or email</li>
                        <li style="margin-bottom: 0;">Update lead status in admin portal after initial contact</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #faf8f3; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <a href="${process.env.ADMIN_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/admin/leads/${lead.id}" style="display: inline-block; background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">View Lead in Admin Portal →</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                            This is an automated notification from the UBD Lead Capture API.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const adminEmailPromise = withTimeout(
      sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
      }),
      15000,
      'admin-email'
    );
    console.info('[public-leads-capture] email dispatch queued', { leadId: lead.id });
    void adminEmailPromise.catch((err) => {
      console.error('[public-leads-capture] email failed', err);
    });

    if (lead.email) {
      try {
        const { toSetupTypeLabel } = await import('@/lib/setupType');
        const serviceName = toSetupTypeLabel(setupType);

        let bankPrescreen: any = null;
        if (setupType === 'bank' && body.serviceDetails?.bankAccountPrescreen) {
          bankPrescreen = body.serviceDetails.bankAccountPrescreen;
        }

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

        const clientSubject = isEnquiry
          ? `Thank you for your enquiry – ${leadRef} | ${serviceName}`
          : `Thank you for your consultation request – ${leadRef} | ${serviceName}`;

        const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.uaebusinessdesk.com/assets/header-logo.png';
        const tagline = 'Clarity before commitment';
        const brandName = process.env.BRAND_NAME || 'UAE Business Desk';

        const clientHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #faf8f3; line-height: 1.6; color: #333333;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f3; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="800" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 800px;">
                  <!-- Header with Footer Logo Structure -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
                      <!-- Footer Logo: Logo Image + UBD Text -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                        <tr>
                          <td align="center" style="padding: 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                              <tr>
                                <td style="vertical-align: middle; padding-right: 10px;">
                                  <img src="${logoUrl}" alt="${brandName}" width="40" height="auto" style="max-width: 40px; height: auto; display: block; border: 0; outline: none; text-decoration: none; vertical-align: middle;" />
                                </td>
                                <td style="vertical-align: middle;">
                                  <span style="font-size: 36px; font-weight: 700; color: rgba(255, 255, 255, 0.95); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.05em; line-height: 1; vertical-align: middle;">UBD</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!-- Tagline -->
                      <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-style: italic; letter-spacing: 0.02em;">${tagline}</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #0b2a4a; font-size: 24px; font-weight: 600;">Thank you for your consultation request</h2>
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">Dear ${lead.fullName},</p>
                      <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">${isEnquiry ? 'We have received your enquiry and appreciate you taking the time to reach out to us. Our team will review your request and get back to you shortly.' : 'Thank you for choosing UAE Business Desk for your company setup needs. We have received your consultation request and will begin reviewing your requirements immediately.'}</p>
                      
                      <!-- Reference Box -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f3; border-left: 4px solid #c9a14a; border-radius: 4px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 8px; color: #0b2a4a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${isEnquiry ? 'Your Enquiry Reference' : 'Your Reference Number'}</p>
                            <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace;">${leadRef}</p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Your Details Section -->
                      <h3 style="margin: 24px 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Details</h3>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                        ${lead.fullName ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Name</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.fullName}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.email ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Email</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.email}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.nationality ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Nationality</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.nationality}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.residenceCountry ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Country of Residence</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.residenceCountry}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.whatsapp ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">WhatsApp</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.whatsapp}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.emirate ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Preferred Emirate</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.emirate}</p>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                      
                      <!-- Service Details Section -->
                      <h3 style="margin: 24px 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Service Details</h3>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Service Requested</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #0b2a4a; font-size: 15px; font-weight: 600;">${serviceName}</p>
                          </td>
                        </tr>
                        ${lead.activity ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Business Activity</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.activity}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.shareholdersCount ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Number of Shareholders</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.shareholdersCount}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.visasRequired !== null ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Visas Required</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.visasRequired ? (lead.visasCount ? `${lead.visasCount}` : 'Yes') : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.timeline ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Preferred Timeline</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${formatTimeline(lead.timeline)}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${lead.needsBankAccount && setupType === 'bank' ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Bank Account Support</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">Yes (Standalone Service)</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${body.companyJurisdiction ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Company Jurisdiction</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${body.companyJurisdiction}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${body.companyStatus ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Company Status</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${body.companyStatus}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${body.monthlyTurnover ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Monthly Turnover</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${body.monthlyTurnover}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${body.existingUaeBankAccount !== undefined && body.existingUaeBankAccount !== null ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Existing UAE Bank Account</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${body.existingUaeBankAccount === 'yes' || body.existingUaeBankAccount === true ? 'Yes' : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen ? `
                        ${bankPrescreen.uaeSetupType ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">UAE Setup Type</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${formatUaeSetupType(bankPrescreen.uaeSetupType)}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.primaryActivityCategory ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Primary Business Activity</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${formatActivityCategory(bankPrescreen.primaryActivityCategory)}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.primaryActivityDetails ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Activity Details</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.primaryActivityDetails}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.ownerUaeResident ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Is the business owner a UAE resident?</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.ownerUaeResident === 'yes' ? 'Yes' : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.uboNationality ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">UBO's Nationality</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.uboNationality}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.expectedMonthlyTurnoverAed ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Expected Monthly Turnover (AED)</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${formatTurnover(bankPrescreen.expectedMonthlyTurnoverAed)}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.paymentGeographies && bankPrescreen.paymentGeographies.length > 0 ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Payment Geographies</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${Array.isArray(bankPrescreen.paymentGeographies) ? bankPrescreen.paymentGeographies.map(formatGeography).join(', ') : formatGeography(bankPrescreen.paymentGeographies)}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.paymentGeographiesOther ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Other Geographies</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.paymentGeographiesOther}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.involvesCrypto !== undefined && bankPrescreen.involvesCrypto !== null ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Crypto / Digital Assets Involved?</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.involvesCrypto === 'yes' ? 'Yes' : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.cashIntensive !== undefined && bankPrescreen.cashIntensive !== null ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Cash-Intensive Business?</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.cashIntensive === 'yes' ? 'Yes' : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.sanctionedHighRiskCountries !== undefined && bankPrescreen.sanctionedHighRiskCountries !== null ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Sanctioned / High-Risk Countries Expected?</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.sanctionedHighRiskCountries === 'yes' ? 'Yes' : 'No'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${bankPrescreen.kycDocsReady ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Can you provide standard KYC documents?</p>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            <p style="margin: 0; color: #333333; font-size: 15px;">${bankPrescreen.kycDocsReady === 'YES' || bankPrescreen.kycDocsReady === 'yes' ? 'Yes' : 'Not yet'}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ` : ''}
                      </table>
                      
                      ${(() => {
                        // Remove lead reference and bank account details from notes
                        let userNotes = lead.notes || '';
                        // Remove lead reference
                        userNotes = userNotes.replace(new RegExp(`${isEnquiry ? 'Enquiry Reference' : 'Lead Reference'}: ${leadRef}`, 'g'), '').trim();
                        // Remove bank account details section
                        userNotes = userNotes.replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '').trim();
                        // Clean up extra newlines
                        userNotes = userNotes.replace(/\n{3,}/g, '\n\n').trim();
                        return userNotes;
                      })() ? `
                      <!-- Additional Notes Section -->
                      <h3 style="margin: 24px 0 16px; color: #0b2a4a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Additional Notes</h3>
                      <div style="background-color: #f8fafc; border-left: 3px solid #c9a14a; border-radius: 4px; padding: 16px 20px; margin: 0 0 24px;">
                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${(() => {
                          // Remove lead reference and bank account details from notes
                          let userNotes = lead.notes || '';
                          // Remove lead reference
                          userNotes = userNotes.replace(new RegExp(`${isEnquiry ? 'Enquiry Reference' : 'Lead Reference'}: ${leadRef}`, 'g'), '').trim();
                          // Remove bank account details section
                          userNotes = userNotes.replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '').trim();
                          // Clean up extra newlines
                          userNotes = userNotes.replace(/\n{3,}/g, '\n\n').trim();
                          return userNotes.replace(/\n/g, '<br>');
                        })()}</p>
                      </div>
                      ` : ''}
                      
                      <!-- What Happens Next Section -->
                      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 6px; padding: 24px; margin: 32px 0 24px;">
                        <h3 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 700;">📋 What Happens Next</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 15px; line-height: 1.8;">
                          <li style="margin-bottom: 12px;">
                            <strong style="color: #1e40af;">Initial Review (1-2 Business Days)</strong><br>
                            <span style="color: #334155; font-size: 14px;">Our team will review your requirements and assess feasibility for your ${serviceName.toLowerCase()}.</span>
                          </li>
                          <li style="margin-bottom: 12px;">
                            <strong style="color: #1e40af;">We'll Contact You</strong><br>
                            <span style="color: #334155; font-size: 14px;">We'll contact you within one business day to discuss your requirements in detail.</span>
                          </li>
                          <li style="margin-bottom: 12px;">
                            <strong style="color: #1e40af;">Review & Approval</strong><br>
                            <span style="color: #334155; font-size: 14px;">We'll share our assessment and proposed approach. You approve before we proceed with any documentation or applications.</span>
                          </li>
                          <li style="margin-bottom: 0;">
                            <strong style="color: #1e40af;">Documentation & Facilitation</strong><br>
                            <span style="color: #334155; font-size: 14px;">Once approved, we'll prepare all required documentation and facilitate the application process with relevant authorities.</span>
                          </li>
                        </ol>
                      </div>
                      
                      <!-- Important Note -->
                      <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; padding: 16px 20px; margin: 24px 0;">
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          <strong>💡 Our Commitment:</strong> We review feasibility first and proceed only after your approval — no surprises, no unnecessary commitments. ${setupType === 'bank' ? 'Approval decisions are made by banks based on their policies and client eligibility.' : 'Approval decisions are made by UAE authorities and banks based on their policies and client eligibility.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #faf8f3; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 12px; color: #0b2a4a; font-size: 14px; font-weight: 600;">UAE Business Desk</p>
                      <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; line-height: 1.6;">Capo Fin FZE<br>Business Center, Sharjah Publishing City<br>Sharjah, United Arab Emirates</p>
                      <p style="margin: 16px 0 4px; color: #64748b; font-size: 13px;">
                        <a href="tel:+971504209110" style="color: #0b2a4a; text-decoration: none;">+971 50 420 9110</a> | 
                        <a href="mailto:support@uaebusinessdesk.com" style="color: #0b2a4a; text-decoration: none;">support@uaebusinessdesk.com</a>
                      </p>
                      <p style="margin: 12px 0 4px; color: #64748b; font-size: 13px; font-style: italic;">Office Hours: Sunday to Thursday, 9:00 AM – 6:00 PM (UAE Time)</p>
                      <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                        <strong>Important:</strong> We provide documentation preparation and application facilitation services only. ${setupType === 'bank' ? 'Approval decisions are made by banks based on their policies and client eligibility.' : 'Approval decisions are made by UAE authorities and banks based on their policies and client eligibility.'}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

        const customerEmailPromise = withTimeout(
          sendCustomerEmail({
            to: lead.email,
            subject: clientSubject,
            html: clientHtml,
          }, 'acknowledgement'),
          15000,
          'customer-email'
        );
        console.info('[public-leads-capture] email dispatch queued', { leadId: lead.id });
        void customerEmailPromise.catch((err) => {
          console.error('[public-leads-capture] email failed', err);
        });
      } catch (emailError) {
        console.error('[Public Lead Capture] Customer email failed:', emailError);
      }
    }

    logRequest(origin, referer, true);

    const response = NextResponse.json({
      ok: true,
      leadId: lead.id,
      leadRef,
    });
    console.info('[public-leads-capture] response', { ms: Date.now() - t0 });
    return addCorsHeaders(response, origin);
  } catch (error: any) {
    logRequest(request.headers.get('origin'), request.headers.get('referer'), false);
    return jsonError(request.headers.get('origin'), 500, 'SERVER_ERROR', 'Server error. Please try again later.');
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, request.headers.get('origin'));
}
