/**
 * Message builders for WhatsApp routing
 */

import type { Lead } from '@/app/admin/leads/[id]/page';

/**
 * Extract lead reference from notes
 */
function extractLeadRef(notes: string | null): string {
  if (!notes) return 'N/A';
  const match = notes.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Build message for company setup agent (Athar/Anoop)
 */
export function buildCompanyAgentMessage(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes);
  const setupTypeLabel = lead.setupType === 'mainland' ? 'Mainland' : 
                         lead.setupType === 'freezone' ? 'Free Zone' : 
                         lead.setupType === 'offshore' ? 'Offshore' : lead.setupType;
  
  let message = `*New Lead — ${setupTypeLabel} Company Setup (UBD)*\n\n`;
  message += `*Lead Reference:* ${leadRef}\n\n`;
  message += `*Client Details:*\n`;
  message += `Name: ${lead.fullName}\n`;
  message += `WhatsApp: ${lead.whatsapp}\n`;
  if (lead.email) message += `Email: ${lead.email}\n`;
  if (lead.nationality) message += `Nationality: ${lead.nationality}\n`;
  if (lead.residenceCountry) message += `Residence: ${lead.residenceCountry}\n`;
  if (lead.emirate) message += `Preferred Emirate: ${lead.emirate}\n`;
  
  message += `\n*Request Details:*\n`;
  message += `Setup Type: ${setupTypeLabel}\n`;
  if (lead.activity) message += `Business Activity: ${lead.activity}\n`;
  if (lead.timeline) {
    const timelineLabel = lead.timeline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    message += `Preferred Timeline: ${timelineLabel}\n`;
  }
  if (lead.shareholdersCount) message += `Shareholders: ${lead.shareholdersCount}\n`;
  if (lead.visasRequired !== null) {
    message += `Visas Required: ${lead.visasRequired ? 'Yes' : 'No'}\n`;
    if (lead.visasRequired && lead.visasCount) {
      message += `Number of Visas: ${lead.visasCount}\n`;
    }
  }
  
  if (lead.notes) {
    // Remove lead reference line from notes if present
    const notesWithoutRef = lead.notes.replace(/Lead Reference:\s*[A-Z0-9-]+/i, '').trim();
    if (notesWithoutRef) {
      message += `\n*Additional Notes:*\n${notesWithoutRef}\n`;
    }
  }
  
  message += `\n*Please confirm:*\n`;
  message += `• Feasibility (Y/N)\n`;
  message += `• Expected timeline\n`;
  message += `• Any special requirements or risk flags\n`;
  
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
  const setupTypeLabel = lead.setupType === 'mainland' ? 'Mainland' : 
                         lead.setupType === 'freezone' ? 'Free Zone' : 
                         lead.setupType === 'offshore' ? 'Offshore' : lead.setupType || 'Company';
  
  const companyCompletedDate = lead.companyCompletedAt 
    ? new Date(lead.companyCompletedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';
  
  let message = `*New Lead — Bank Account Setup (UBD)*\n\n`;
  message += `*Lead Reference:* ${leadRef}\n\n`;
  message += `*Client Details:*\n`;
  message += `Name: ${lead.fullName}\n`;
  message += `WhatsApp: ${lead.whatsapp}\n`;
  if (lead.email) message += `Email: ${lead.email}\n`;
  if (lead.nationality) message += `Nationality: ${lead.nationality}\n`;
  if (lead.residenceCountry) message += `Residence: ${lead.residenceCountry}\n`;
  
  message += `\n*Company Setup:*\n`;
  message += `Completed: ${companyCompletedDate}\n`;
  if (setupTypeLabel !== 'Company') {
    message += `Setup Type: ${setupTypeLabel}\n`;
  }
  
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
  
  message += `\n*Please confirm:*\n`;
  message += `• Bank account feasibility (Y/N)\n`;
  message += `• Expected timeline\n`;
  message += `• Any special requirements or risk flags\n`;
  
  return message;
}

