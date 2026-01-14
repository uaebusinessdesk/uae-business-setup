/**
 * Message builders for WhatsApp routing
 */

// Lead type for messages
interface Lead {
  fullName: string;
  whatsapp: string;
  email?: string | null;
  setupType?: string | null;
  notes?: string | null;
  quotedAmountAed?: number | null;
  companyAssignedTo?: string;
  [key: string]: any;
}
import { toSetupTypeLabel } from '@/lib/setupType';

/**
 * Extract lead reference from notes
 */
function extractLeadRef(notes: string | null): string {
  if (!notes) return 'N/A';
  const match = notes.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Format timeline for display
 */
function formatTimeline(timeline: string | null): string {
  if (!timeline) return '';
  const timelineMap: Record<string, string> = {
    'immediately': 'Immediately',
    'within-1-month': 'Within 1 month',
    '1-3-months': '1–3 months',
    'exploring': 'Exploring',
  };
  return timelineMap[timeline.toLowerCase()] || timeline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format date for display
 */
function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Clean notes by removing lead reference and bank account details
 */
function cleanNotes(notes: string | null, leadRef: string): string {
  if (!notes) return '';
  let cleaned = notes
    .replace(new RegExp(`Lead Reference:\\s*${leadRef}`, 'gi'), '')
    .replace(/Bank Account Details:\s*\n((?:.*\n?)*?)(?=\n\n|\nLead Reference:|$)/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned;
}

/**
 * Build message for company setup agent (Athar/Anoop)
 * @param lead - Lead object with all customer information
 * @param agentName - Optional agent name for personalization
 */
export function buildCompanyAgentMessage(lead: Lead, agentName?: string): string {
  const leadRef = extractLeadRef(lead.notes);
  const setupTypeLabel = lead.setupType === 'mainland' ? 'Mainland' : 
                         lead.setupType === 'freezone' ? 'Free Zone' : 
                         lead.setupType === 'offshore' ? 'Offshore' : lead.setupType || 'Company Setup';
  
  // Parse serviceDetails if present
  let serviceDetails: any = null;
  if (lead.serviceDetails) {
    try {
      serviceDetails = JSON.parse(lead.serviceDetails);
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Personalized greeting
  const greeting = agentName ? `Hi ${agentName},` : 'Hi,';
  
  // Build message with structured sections
  let message = `${greeting}\n\n`;
  message += `🎯 *New Lead — ${setupTypeLabel} Company Setup*\n\n`;
  
  // Lead Reference & Date Section
  message += `📋 *Lead Information*\n`;
  message += `Reference: *${leadRef}*\n`;
  if (lead.createdAt) {
    message += `Submitted: ${formatDate(lead.createdAt)}\n`;
  }
  message += `\n`;
  
  // Client Information Section
  message += `👤 *Client Information*\n`;
  message += `Name: *${lead.fullName}*\n`;
  message += `WhatsApp: ${lead.whatsapp}\n`;
  if (lead.email) {
    message += `Email: ${lead.email}\n`;
  }
  if (lead.nationality) {
    message += `Nationality: ${lead.nationality}\n`;
  }
  if (lead.residenceCountry) {
    message += `Country of Residence: ${lead.residenceCountry}\n`;
  }
  if (lead.emirate) {
    message += `Preferred Emirate: ${lead.emirate}\n`;
  }
  message += `\n`;
  
  // Service Details Section
  message += `📊 *Service Details*\n`;
  message += `Setup Type: *${setupTypeLabel}*\n`;
  if (lead.activity) {
    message += `Business Activity: ${lead.activity}\n`;
  }
  if (lead.timeline) {
    message += `Preferred Timeline: ${formatTimeline(lead.timeline)}\n`;
  }
  if (lead.shareholdersCount) {
    message += `Number of Shareholders: ${lead.shareholdersCount}\n`;
  }
  if (lead.visasRequired !== null) {
    const visaText = lead.visasRequired 
      ? (lead.visasCount ? `Yes (${lead.visasCount} visa${lead.visasCount > 1 ? 's' : ''})` : 'Yes')
      : 'No';
    message += `Visas Required: ${visaText}\n`;
  }
  message += `\n`;
  
  // Service Details from JSON (if present)
  if (serviceDetails && serviceDetails.bankAccountPrescreen) {
    const prescreen = serviceDetails.bankAccountPrescreen;
    message += `💼 *Additional Business Information*\n`;
    if (prescreen.uaeSetupType) {
      const setupTypeMap: Record<string, string> = {
        'MAINLAND': 'Mainland',
        'FREE_ZONE': 'Free Zone',
        'OFFSHORE': 'Offshore'
      };
      message += `UAE Setup Type: ${setupTypeMap[prescreen.uaeSetupType] || prescreen.uaeSetupType}\n`;
    }
    if (prescreen.primaryActivityCategory) {
      const activityMap: Record<string, string> = {
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
      message += `Primary Activity: ${activityMap[prescreen.primaryActivityCategory] || prescreen.primaryActivityCategory}\n`;
    }
    if (prescreen.primaryActivityDetails) {
      message += `Activity Details: ${prescreen.primaryActivityDetails}\n`;
    }
    if (prescreen.expectedMonthlyTurnoverAed) {
      const turnoverMap: Record<string, string> = {
        'UNDER_100K': 'Under 100,000 AED',
        '100K_500K': '100,000 – 500,000 AED',
        '500K_2M': '500,000 – 2,000,000 AED',
        'OVER_2M': 'Over 2,000,000 AED'
      };
      message += `Expected Monthly Turnover: ${turnoverMap[prescreen.expectedMonthlyTurnoverAed] || prescreen.expectedMonthlyTurnoverAed}\n`;
    }
    message += `\n`;
  }
  
  // Additional Notes Section
  const cleanedNotes = cleanNotes(lead.notes, leadRef);
  if (cleanedNotes) {
    message += `📝 *Additional Notes*\n`;
    message += `${cleanedNotes}\n\n`;
  }
  
  // Action Required Section
  message += `✅ *Action Required*\n`;
  message += `Please review and confirm:\n`;
  message += `• Feasibility assessment (Y/N)\n`;
  message += `• Expected timeline for completion\n`;
  message += `• Any special requirements or risk flags\n`;
  message += `• Quote amount (if feasible)\n\n`;
  
  message += `Thank you! 🙏`;
  
  return message;
}

/**
 * Build message for bank setup (Self)
 */
export function buildBankSelfMessage(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes);
  const setupTypeLabel = lead.setupType === 'mainland' ? 'Mainland' : 
                         lead.setupType === 'freezone' ? 'Free Zone' : 
                         lead.setupType === 'offshore' ? 'Offshore' : lead.setupType;
  
  const companyCompletedDate = lead.companyCompletedAt 
    ? new Date(lead.companyCompletedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';
  
  let message = `Bank setup request: ${leadRef} | ${lead.fullName} | ${setupTypeLabel} | Company Completed: ${companyCompletedDate}. Please start bank onboarding.`;
  
  return message;
}

/**
 * Bank prescreen data interface
 */
export interface BankPrescreenData {
  // Company-specific fields
  companyName?: string | null;
  shareholderNationalities?: string | null;
  corporateStructure?: string | null;
  placeOfIncorporation?: string | null;
  dateOfIncorporation?: string | null;
  
  // Business Snapshot
  uaeSetupType?: string | null;
  primaryActivityCategory?: string | null;
  primaryActivityDetails?: string | null;
  ownerUaeResident?: string | null;
  uboNationality?: string | null;
  
  // Expected Account Use
  expectedMonthlyTurnoverAed?: string | null;
  paymentGeographies?: string[] | null;
  paymentGeographiesOther?: string | null;
  
  // Compliance Flags
  involvesCrypto?: string | null;
  cashIntensive?: string | null;
  sanctionedHighRiskCountries?: string | null;
  
  // Readiness
  kycDocsReady?: string | null;
}

/**
 * Format helper functions (matching the display section)
 */
function formatUaeSetupType(type: string): string {
  const map: Record<string, string> = {
    'MAINLAND': 'Mainland',
    'FREE_ZONE': 'Free Zone',
    'OFFSHORE': 'Offshore'
  };
  return map[type] || type;
}

function formatActivityCategory(category: string): string {
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
}

function formatTurnover(turnover: string): string {
  const map: Record<string, string> = {
    'UNDER_100K': 'Under 100,000 AED',
    '100K_500K': '100,000 – 500,000 AED',
    '500K_2M': '500,000 – 2,000,000 AED',
    'OVER_2M': 'Over 2,000,000 AED'
  };
  return map[turnover] || turnover;
}

function formatGeography(geo: string): string {
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
}

/**
 * Build message for bank account setup agent
 */
export function buildBankAgentMessage(lead: Lead, prescreenData?: BankPrescreenData | null): string {
  const leadRef = extractLeadRef(lead.notes);
  
  let message = `*New Lead — Bank Account Setup (UBD)*\n\n`;
  message += `*Lead Reference:* ${leadRef}\n\n`;
  message += `*Client Details:*\n`;
  message += `Name: ${lead.fullName}\n`;
  message += `WhatsApp: ${lead.whatsapp}\n`;
  if (lead.email) message += `Email: ${lead.email}\n`;
  if (lead.nationality) message += `Nationality: ${lead.nationality}\n`;
  if (lead.residenceCountry) message += `Residence: ${lead.residenceCountry}\n`;
  if (lead.emirate) message += `Preferred Emirate: ${lead.emirate}\n`;
  
  if (prescreenData) {
    // Company Details Section
    const hasCompanyDetails = prescreenData.companyName || prescreenData.shareholderNationalities || 
                             prescreenData.corporateStructure || prescreenData.placeOfIncorporation || 
                             prescreenData.dateOfIncorporation;
    if (hasCompanyDetails) {
      message += `\n*Company Details:*\n`;
      if (prescreenData.companyName) message += `Company Name: ${prescreenData.companyName}\n`;
      if (prescreenData.shareholderNationalities) message += `Shareholder Nationalities: ${prescreenData.shareholderNationalities}\n`;
      if (prescreenData.corporateStructure) message += `Corporate Structure: ${prescreenData.corporateStructure}\n`;
      if (prescreenData.placeOfIncorporation) message += `Place of Incorporation: ${prescreenData.placeOfIncorporation}\n`;
      if (prescreenData.dateOfIncorporation) message += `Date of Incorporation: ${prescreenData.dateOfIncorporation}\n`;
    }
    
    // Business Snapshot Section
    const hasBusinessSnapshot = prescreenData.uaeSetupType || 
                               prescreenData.primaryActivityCategory || prescreenData.primaryActivityDetails || 
                               prescreenData.ownerUaeResident || prescreenData.uboNationality;
    if (hasBusinessSnapshot) {
      message += `\n*Business Snapshot:*\n`;
      if (prescreenData.uaeSetupType) message += `UAE Setup Type: ${formatUaeSetupType(prescreenData.uaeSetupType)}\n`;
      if (prescreenData.primaryActivityCategory) message += `Primary Business Activity: ${formatActivityCategory(prescreenData.primaryActivityCategory)}\n`;
      if (prescreenData.primaryActivityDetails) message += `Activity Details: ${prescreenData.primaryActivityDetails}\n`;
      if (prescreenData.ownerUaeResident) message += `Owner UAE Resident: ${prescreenData.ownerUaeResident === 'yes' ? 'Yes' : 'No'}\n`;
      if (prescreenData.uboNationality) message += `UBO's Nationality: ${prescreenData.uboNationality}\n`;
    }
    
    // Expected Account Use Section
    const hasAccountUse = prescreenData.expectedMonthlyTurnoverAed || prescreenData.paymentGeographies || 
                         prescreenData.paymentGeographiesOther;
    if (hasAccountUse) {
      message += `\n*Expected Account Use:*\n`;
      if (prescreenData.expectedMonthlyTurnoverAed) message += `Expected Monthly Turnover: ${formatTurnover(prescreenData.expectedMonthlyTurnoverAed)}\n`;
      if (prescreenData.paymentGeographies && prescreenData.paymentGeographies.length > 0) {
        const geographies = prescreenData.paymentGeographies.map(formatGeography).join(', ');
        message += `Payment Geographies: ${geographies}\n`;
      }
      if (prescreenData.paymentGeographiesOther) message += `Other Geographies: ${prescreenData.paymentGeographiesOther}\n`;
    }
    
    // Compliance Flags Section
    const hasComplianceFlags = prescreenData.involvesCrypto !== undefined && prescreenData.involvesCrypto !== null ||
                               prescreenData.cashIntensive !== undefined && prescreenData.cashIntensive !== null ||
                               prescreenData.sanctionedHighRiskCountries !== undefined && prescreenData.sanctionedHighRiskCountries !== null;
    if (hasComplianceFlags) {
      message += `\n*Compliance Flags:*\n`;
      if (prescreenData.involvesCrypto !== undefined && prescreenData.involvesCrypto !== null) {
        message += `Crypto / Digital Assets: ${prescreenData.involvesCrypto === 'yes' ? 'Yes' : 'No'}\n`;
      }
      if (prescreenData.cashIntensive !== undefined && prescreenData.cashIntensive !== null) {
        message += `Cash-Intensive Business: ${prescreenData.cashIntensive === 'yes' ? 'Yes' : 'No'}\n`;
      }
      if (prescreenData.sanctionedHighRiskCountries !== undefined && prescreenData.sanctionedHighRiskCountries !== null) {
        message += `Sanctioned / High-Risk Countries: ${prescreenData.sanctionedHighRiskCountries === 'yes' ? 'Yes' : 'No'}\n`;
      }
    }
    
    // Readiness Section
    if (prescreenData.kycDocsReady) {
      message += `\n*Readiness:*\n`;
      message += `KYC Documents Ready: ${prescreenData.kycDocsReady === 'YES' || prescreenData.kycDocsReady === 'yes' ? 'Yes' : 'Not yet'}\n`;
    }
  }
  
  // Customer Notes Section
  const cleanedNotes = cleanNotes(lead.notes, leadRef);
  if (cleanedNotes) {
    message += `\n📝 *Additional Notes*\n`;
    message += `${cleanedNotes}\n`;
  }
  
  message += `\n*Please confirm:*\n`;
  message += `• Bank account feasibility (Y/N)\n`;
  message += `• Expected timeline\n`;
  message += `• Any special requirements or risk flags\n`;
  
  return message;
}

/**
 * Build structured WhatsApp quote reminder message for customers
 * @param lead - Lead object with quote information
 * @param approvalUrl - Optional approval URL to view quote
 * @param isRevisedQuote - Whether this is a revised quote
 */
export function buildQuoteReminderMessage(lead: Lead, approvalUrl?: string, isRevisedQuote?: boolean): string {
  const leadRef = extractLeadRef(lead.notes);
  const serviceLabel = toSetupTypeLabel(lead.setupType);
  
  // Extract first name for personalization (prefer full name, fallback to first name)
  const fullName = lead.fullName || '';
  const firstName = fullName.split(' ')[0] || fullName || 'there';
  const greeting = fullName ? `Hi ${fullName},` : `Hi ${firstName},`;
  
  // Format quote amount
  const formattedAmount = lead.quotedAmountAed 
    ? lead.quotedAmountAed.toLocaleString('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
      })
    : 'N/A';
  
  // Build structured message
  let message = `${greeting}\n\n`;
  
  // Main announcement
  if (isRevisedQuote) {
    message += `Your *revised quote* for ${serviceLabel} has been emailed to you.\n\n`;
  } else {
    message += `Your quote for ${serviceLabel} has been emailed to you.\n\n`;
  }
  
  // Quote details section
  message += `📋 *Quote Details*\n`;
  message += `Lead Reference: *${leadRef}*\n`;
  message += `Service: ${serviceLabel}\n`;
  message += `Amount: *${formattedAmount}*\n\n`;
  
  // Next steps section
  message += `📧 *Next Steps*\n`;
  message += `Check your email for the complete quote details.\n\n`;
  message += `No payment is required at this stage. Please review the quote and use the 'View Quote & Decide' link in the email to confirm whether you'd like to proceed.\n\n`;
  
  // Include approval URL if provided
  if (approvalUrl) {
    message += `🔗 *View Quote:*\n${approvalUrl}\n\n`;
  }
  
  // Professional closing
  message += `Thank you for choosing UAE Business Desk.`;
  
  return message;
}

