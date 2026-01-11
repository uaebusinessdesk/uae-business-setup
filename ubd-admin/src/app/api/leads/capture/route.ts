import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateLeadRef } from '@/lib/email';
import { logActivity } from '@/lib/activity';
import { sendText } from '@/lib/whatsapp';
import { ATHAR_WHATSAPP, ANOOP_WHATSAPP, SELF_WHATSAPP } from '@/config/contacts';
import { normalizePhone, isValidE164 } from '@/lib/phone';

// CORS headers - Allow both localhost and network IP
const ALLOWED_ORIGINS = [
  'http://localhost:3000', // Static website server
  'http://127.0.0.1:3000', // Static website server
  'http://10.50.9.210:3000', // Network IP for mobile access
  'http://localhost:3001', // Admin portal (if running separately)
  'http://localhost:8080', // Website static server (legacy)
  'http://127.0.0.1:8080', // Website static server (legacy)
  'https://www.uaebusinessdesk.com', // Production website
  'http://www.uaebusinessdesk.com', // Production website (HTTP fallback)
  'https://uaebusinessdesk.com', // Production website (without www)
  'http://uaebusinessdesk.com', // Production website (without www, HTTP fallback)
];

function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // In development, allow all origins; in production, check allowed list
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // Allow all origins in development
    const allowedOrigin = origin || '*';
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    // In production, only allow specific origins
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
      ? origin 
      : ALLOWED_ORIGINS[0];
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-UBD-LEAD-KEY');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// DEPRECATED: This function is no longer used. Service types are now preserved as-is (mainland/freezone/offshore)
// instead of being mapped to generic 'company'. Kept for reference only.
// function mapServiceToSetupType(serviceRequired: string): 'company' | 'bank' {
//   const mapping: Record<string, 'company' | 'bank'> = {
//     'mainland': 'company',
//     'freezone': 'company',
//     'offshore': 'company',
//   };
//   return mapping[serviceRequired] || 'company';
// }

// Validate required fields
function validateRequiredFields(body: any): { valid: boolean; error?: string; normalizedPhone?: string } {
  if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim() === '') {
    return { valid: false, error: 'fullName is required' };
  }
  if (!body.whatsapp || typeof body.whatsapp !== 'string' || body.whatsapp.trim() === '') {
    return { valid: false, error: 'whatsapp is required' };
  }
  
  // Normalize phone number
  const normalized = normalizePhone(body.whatsapp);
  
  // Validate E.164 format
  if (!isValidE164(normalized)) {
    return { valid: false, error: 'Invalid phone number. Please include country code, e.g. +97150xxxxxxx' };
  }
  
  if (!body.serviceRequired || typeof body.serviceRequired !== 'string' || body.serviceRequired.trim() === '') {
    return { valid: false, error: 'serviceRequired is required' };
  }
  
  return { valid: true, normalizedPhone: normalized };
}

// Handle GET requests (for testing/debugging)
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.json({
    message: 'Lead Capture API Endpoint',
    method: 'POST',
    requiredHeaders: {
      'Content-Type': 'application/json',
      'X-UBD-LEAD-KEY': 'API key required',
    },
    requiredFields: ['fullName', 'whatsapp', 'serviceRequired'],
    cors: {
      origins: ALLOWED_ORIGINS,
      methods: ['POST', 'OPTIONS'],
    },
  });
  return addCorsHeaders(response, origin);
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isDev = process.env.NODE_ENV !== 'production';
  
  try {
    // Check API key
    const apiKey = request.headers.get('X-UBD-LEAD-KEY');
    const expectedKey = process.env.LEAD_API_KEY;
    
    if (!expectedKey) {
      console.error('LEAD_API_KEY not configured');
      const response = NextResponse.json(
        { ok: false, error: 'Server configuration error' },
        { status: 500 }
      );
      return addCorsHeaders(response, origin);
    }
    
    if (!apiKey || apiKey !== expectedKey) {
      const response = NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return addCorsHeaders(response, origin);
    }

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      const response = NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    // Validate required fields
    const validation = validateRequiredFields(body);
    if (!validation.valid) {
      const fieldErrors: Record<string, string> = {};
      if (validation.error?.includes('fullName')) {
        fieldErrors.fullName = 'Full name is required';
      } else if (validation.error?.includes('whatsapp')) {
        fieldErrors.whatsapp = validation.error;
      } else if (validation.error?.includes('serviceRequired')) {
        fieldErrors.serviceRequired = 'Service selection is required';
      }
      
      const response = NextResponse.json(
        { 
          ok: false, 
          error: validation.error || 'Validation failed',
          ...(Object.keys(fieldErrors).length > 0 && { fieldErrors })
        },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }
    
    // Get normalized phone from validation result
    const normalizedPhone = validation.normalizedPhone!;

    // Generate lead reference
    const leadRef = generateLeadRef();

    // Prepare notes with lead reference and bank-related fields
    const notesParts = [];
    if (body.notes) {
      notesParts.push(body.notes);
    }
    
    // Add bank-related fields to notes if provided
    const bankFields = [];
    if (body.companyJurisdiction) {
      bankFields.push(`Company Jurisdiction: ${body.companyJurisdiction}`);
    }
    if (body.companyStatus) {
      bankFields.push(`Company Status: ${body.companyStatus}`);
    }
    if (body.monthlyTurnover) {
      bankFields.push(`Monthly Turnover: ${body.monthlyTurnover}`);
    }
    if (body.existingUaeBankAccount !== undefined && body.existingUaeBankAccount !== null) {
      bankFields.push(`Existing UAE Bank Account: ${body.existingUaeBankAccount === 'yes' || body.existingUaeBankAccount === true ? 'Yes' : 'No'}`);
    }
    
    if (bankFields.length > 0) {
      notesParts.push('Bank Account Details:\n' + bankFields.join('\n'));
    }
    
    // All submissions are now leads (company setup services)
    notesParts.push(`Lead Reference: ${leadRef}`);
    const notesWithRef = notesParts.join('\n\n');

    // Map serviceRequired to base setupType (mainland/freezone/offshore)
    // If needsBankAccount is true, we'll combine it later
    const baseSetupType = body.serviceRequired; // Keep original: mainland/freezone/offshore

    // Determine needsBankAccount
    // Combined services are no longer supported - only standalone bank services
    // Only set needsBankAccount = true if serviceRequired is "bank" or "existing-company"
    // Ignore needsBankAccount field from company setup forms
    let needsBankAccount = false;
    if (baseSetupType === 'existing-company' || baseSetupType === 'bank') {
      needsBankAccount = true;
    }
    // For company setup forms (mainland/freezone/offshore), always set to false
    // even if the form sends needsBankAccount = true

    // Handle serviceDetails for bank account prescreen
    let serviceDetailsString: string | null = null;
    if (body.serviceDetails) {
      try {
        serviceDetailsString = JSON.stringify(body.serviceDetails);
      } catch (e) {
        console.error('Error stringifying serviceDetails:', e);
      }
    }

    // Determine final setupType
    // Combined services are no longer supported - preserve original service type only
    let setupType: string;
    if (baseSetupType === 'existing-company' || baseSetupType === 'bank' || body.serviceDetails?.bankAccountPrescreen) {
      setupType = 'bank';
    } else if (baseSetupType === 'mainland' || baseSetupType === 'freezone' || baseSetupType === 'offshore') {
      // Preserve the original service type (no bank account combination)
      setupType = baseSetupType;
    } else if (baseSetupType === 'not-sure' || baseSetupType === 'not_sure') {
      setupType = 'not_sure';
    } else {
      // Fallback: preserve the original value if it's something else
      setupType = baseSetupType;
    }

    // Determine bankStage based on needsBankAccount
    // If needsBankAccount=true -> "queued"
    // Else -> "not_applicable"
    const bankStage = needsBankAccount ? 'queued' : 'not_applicable';

    // No auto-assignment - agents must be manually assigned
    let assignedAgent = 'unassigned';

    // Legacy field for backward compatibility
    let companyAssignedTo = 'unassigned';

    // Create lead in database
    const lead = await db.lead.create({
      data: {
        fullName: body.fullName.trim(),
        whatsapp: normalizedPhone,
        email: body.email ? body.email.trim() : null,
        nationality: body.nationality ? body.nationality.trim() : null,
        residenceCountry: body.residenceCountry ? body.residenceCountry.trim() : null,
        emirate: body.emirate ? body.emirate.trim() : null,
        setupType: setupType,
        activity: body.activity ? body.activity.trim() : null,
        shareholdersCount: body.shareholdersCount ? parseInt(body.shareholdersCount) : null,
        visasRequired: body.visasRequired === 'yes' || body.visasRequired === true ? true : body.visasRequired === 'no' || body.visasRequired === false ? false : null,
        visasCount: body.visasCount ? parseInt(body.visasCount) : null,
        timeline: body.timeline ? body.timeline.trim() : null,
        notes: notesWithRef,
        serviceDetails: serviceDetailsString,
        stage: 'new',
        assignedTo: 'unassigned',
        invoiceStatus: 'not_sent',
        // Deal Workflow - Company
        assignedAgent: assignedAgent,
        // Company Setup Tracking - defaults (legacy)
        companyStage: 'new',
        companyFeasible: false,
        companyAssignedTo: companyAssignedTo,
        companyInvoiceStatus: 'not_sent',
        // Bank Setup Tracking - defaults
        needsBankAccount: needsBankAccount,
        bankStage: bankStage,
        bankInvoiceStatus: 'not_sent',
      },
    });

    // Determine if this is an enquiry (contact form) or a lead (consultation form)
    const isEnquiry = false; // All leads are now either company or bank
    
    // Check if this is a callback request (from callback modal)
    const isCallbackRequest = body.notes && body.notes.includes('Callback Request');
    
    // Log lead/enquiry creation
    if (isEnquiry) {
      await logActivity(lead.id, 'lead_created', `New enquiry received: ${leadRef}`);
    } else {
      await logActivity(lead.id, 'lead_created', `New lead created: ${leadRef}`);
    }
    
    // No auto-assignment notifications - agents must be manually assigned first

    // No auto-assignment notifications - agents must be manually assigned first
    // Agents will be notified when manually assigned through the admin portal

    // Send notification email to admin
    // ⚠️ ADMIN NEW LEAD NOTIFICATION EMAIL - FINALIZED & APPROVED ⚠️
    // This admin notification email template has been reviewed and approved.
    // All form details are included:
    // - Client details (name, WhatsApp, email, nationality, residence country, preferred emirate)
    // - Service details (service requested, assigned agent, business activity, shareholders, visas, timeline, bank account support, bank details)
    // - Additional Notes (only user-entered notes from form, excluding bank details and lead reference)
    // Please do not modify without careful review and approval.
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'support@uaebusinessdesk.com';
    
    // Determine subject line based on request type
    let adminSubject: string;
    if (isCallbackRequest) {
      adminSubject = `📞 Callback Request – ${leadRef}`;
    } else {
      adminSubject = isEnquiry ? `New Enquiry Received – ${leadRef}` : `New Lead Received – ${leadRef}`;
    }
    
    // Format service name for display
    let serviceName: string;
    if (isCallbackRequest) {
      serviceName = 'Callback Request';
    } else {
      serviceName = body.serviceRequired === 'mainland' ? 'Mainland Company Setup' :
                     body.serviceRequired === 'freezone' ? 'Free Zone Company Setup' :
                     body.serviceRequired === 'offshore' ? 'Offshore Company Setup' :
                     body.serviceRequired === 'existing-company' ? 'Bank Account Setup' :
                     body.serviceRequired === 'not-sure' ? 'General Enquiry' :
                     body.serviceRequired;
    }
    
    // Format assigned agent name
    const agentName = lead.assignedAgent === 'athar' ? 'Athar' :
                     lead.assignedAgent === 'anoop' ? 'Anoop' :
                     lead.assignedAgent === 'self' ? 'Self' :
                     'Unassigned';
    
    // Logo URL - using footer logo for emails
    const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.uaebusinessdesk.com/assets/footer-logo.png';
    console.log('Email Logo URL:', logoUrl); // Debug log
    
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
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Timeline</p>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                          <p style="margin: 0; color: #333333; font-size: 15px;">${lead.timeline.toLowerCase() === 'immediately' ? 'Immediately' : lead.timeline}</p>
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
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #faf8f3; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                      This is an automated notification from the UBD Lead Capture API.<br>
                      <a href="http://localhost:3001/admin/leads/${lead.id}" style="color: #0b2a4a; text-decoration: none; font-weight: 600;">View Lead in Admin Portal →</a>
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

    try {
      await sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send acknowledgement email to client if email exists
    // ⚠️ WELCOME EMAIL - FINALIZED & APPROVED ⚠️
    // This welcome email template has been reviewed and approved. 
    // All fields are correctly displayed:
    // - Client details (name, WhatsApp, email, nationality, residence country, preferred emirate)
    // - Service details (service, agent, activity, shareholders, visas, timeline, bank account support, bank details)
    // - Additional notes (only user-entered notes, excluding bank details and lead reference)
    // Please do not modify without careful review and approval.
    if (lead.email) {
      const clientSubject = isEnquiry ? `We received your enquiry – ${leadRef}` : `We received your request – ${leadRef}`;
      
      // Format service name for display using toSetupTypeLabel for consistent formatting
      const { toSetupTypeLabel } = await import('@/lib/setupType');
      const serviceName = toSetupTypeLabel(setupType);
      
      // Logo URL - using header logo for footer logo structure
      const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.uaebusinessdesk.com/assets/header-logo.png';
      const tagline = 'Clarity before commitment';
      const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
      console.log('Email Logo URL (client):', logoUrl); // Debug log
      
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
                      <h2 style="margin: 0 0 20px; color: #0b2a4a; font-size: 24px; font-weight: 600;">Thank you for your enquiry</h2>
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px;">Dear ${lead.fullName},</p>
                      <p style="margin: 0 0 24px; color: #333333; font-size: 16px;">${isEnquiry ? 'We have received your enquiry and will review it shortly.' : 'We have received your consultation request and will review your requirements shortly.'}</p>
                      
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
                            <p style="margin: 0; color: #333333; font-size: 15px;">${lead.timeline.toLowerCase() === 'immediately' ? 'Immediately' : lead.timeline}</p>
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
                      
                      <p style="margin: 24px 0 0; color: #333333; font-size: 16px;">Our team will contact you${lead.whatsapp ? ` via WhatsApp at <strong style="color: #0b2a4a;">${lead.whatsapp}</strong>` : lead.email ? ` at <strong style="color: #0b2a4a;">${lead.email}</strong>` : ''} within one business day to discuss your requirements and next steps.</p>
                      
                      <p style="margin: 24px 0 0; color: #64748b; font-size: 14px;">We review feasibility first and proceed only after your approval — no surprises, no unnecessary commitments.</p>
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
                      <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                        <strong>Important:</strong> We provide documentation preparation and application facilitation services only. Approval decisions are made by UAE authorities and banks based on their policies and client eligibility.
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

      try {
        const { sendCustomerEmail } = await import('@/lib/sendCustomerEmail');
        await sendCustomerEmail({
          to: lead.email,
          subject: clientSubject,
          html: clientHtml,
        }, 'acknowledgement');
      } catch (emailError) {
        console.error('Failed to send client acknowledgement email:', emailError);
        // Don't fail the request if email fails
      }
    }

    const response = NextResponse.json(
      {
        ok: true,
        success: true,
        leadId: lead.id,
        leadRef: leadRef,
        message: 'Lead captured successfully',
      },
      { status: 201 }
    );
    return addCorsHeaders(response, origin);
  } catch (err: any) {
    // Log full error in DEV
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.error("Lead capture failed:", err);
    }
    
    const errorMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
    
    // Check if it's a Prisma schema sync issue
    if (errorMessage.includes('Unknown argument') || errorMessage.includes('Prisma')) {
      if (isDev) {
        console.error('⚠️  Prisma schema may be out of sync. Run: npx prisma generate && npx prisma db push');
      }
    }
    
    const responseData: any = {
      ok: false,
      error: 'Internal server error',
    };
    
    if (isDev) {
      responseData.debugMessage = errorMessage;
    }
    
    const response = NextResponse.json(responseData, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}

