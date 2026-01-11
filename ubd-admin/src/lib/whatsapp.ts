/**
 * WhatsApp utility functions
 */

import { isValidE164 } from './phone';

/**
 * Validate E.164 phone format (re-exported from phone utility for backward compatibility)
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 * @deprecated Use isValidE164 from './phone' directly
 */
export function isValidE164Phone(phone: string): boolean {
  return isValidE164(phone);
}

/**
 * Normalize WhatsApp number to digits only (no +)
 * @param number - Phone number with or without + prefix
 * @returns Normalized number (digits only)
 */
export function normalizeWaNumber(number: string): string {
  return number.replace(/[^\d]/g, '');
}

/**
 * Generate WhatsApp wa.me link
 * @param number - Phone number (will be normalized)
 * @param message - Message text (will be URL encoded)
 * @returns WhatsApp wa.me URL
 */
export function waLink(number: string, message: string): string {
  const normalized = normalizeWaNumber(number);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
}

/**
 * WhatsApp Cloud API configuration
 */
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v22.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Make a request to WhatsApp Cloud API
 * @param payload - Request payload
 * @throws Error if request fails
 */
async function sendWhatsAppRequest(payload: any): Promise<any> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('WhatsApp API credentials not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN.');
  }

  const url = `${WHATSAPP_API_BASE}/${PHONE_NUMBER_ID}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      const errorMessage = responseData.error?.message || responseData.error?.error_user_msg || responseText || 'Unknown error';
      const errorCode = responseData.error?.code || response.status;
      const errorType = responseData.error?.type || 'API_ERROR';
      
      console.error(`[WhatsApp API Error] Status: ${response.status}, Code: ${errorCode}, Type: ${errorType}, Message: ${errorMessage}`);
      
      throw new Error(`WhatsApp API error (${response.status}): ${errorMessage}`);
    }

    return responseData;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(`[WhatsApp API Request Failed] ${error.message}`);
      throw error;
    }
    console.error(`[WhatsApp API Request Failed] ${String(error)}`);
    throw new Error(`WhatsApp API request failed: ${String(error)}`);
  }
}

/**
 * Send a WhatsApp text message (standardized helper)
 * @param toPhoneE164 - Recipient phone number in E.164 format (e.g., +971501234567)
 * @param messageBody - Message text content
 * @returns Promise resolving to { ok: boolean, messageId?: string, error?: string }
 * 
 * @example
 * const result = await sendWhatsAppMessage('+971501234567', 'Hello!');
 * if (result.ok) {
 *   console.log('Message sent:', result.messageId);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 */
export async function sendWhatsAppMessage(
  toPhoneE164: string,
  messageBody: string
): Promise<{ ok: boolean; messageId?: string; error?: string; code?: string; userMessage?: string }> {
  // Validate inputs
  if (!toPhoneE164 || !messageBody) {
    const error = 'Missing required parameters: toPhoneE164 and messageBody are required';
    console.error('[WhatsApp Message]', error);
    return { ok: false, error };
  }

  // Check configuration (truly fatal - should throw)
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    const error = 'WhatsApp API credentials not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN.';
    console.error('[WhatsApp Message]', error);
    return { ok: false, error };
  }

  // Validate E.164 format before sending
  if (!isValidE164(toPhoneE164)) {
    const error = `Invalid phone number format: ${toPhoneE164}. Must be in E.164 format (e.g., +97150xxxxxxx)`;
    console.error('[WhatsApp Message]', error);
    return { ok: false, error };
  }

  // Normalize phone number (remove non-digits for API)
  const normalizedTo = normalizeWaNumber(toPhoneE164);
  
  if (!normalizedTo) {
    const error = 'Invalid phone number format';
    console.error('[WhatsApp Message]', error, { toPhoneE164 });
    return { ok: false, error };
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'text',
    text: {
      body: messageBody,
    },
  };

  const url = `${WHATSAPP_API_BASE}/${PHONE_NUMBER_ID}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      const errorMessage = responseData.error?.message || responseData.error?.error_user_msg || responseText || 'Unknown error';
      const errorCode = responseData.error?.code || response.status;
      const errorType = responseData.error?.type || 'API_ERROR';
      
      // Log failure with full response payload
      console.error('[WhatsApp Message] Failed to send', {
        status: response.status,
        code: errorCode,
        type: errorType,
        message: errorMessage,
        response: responseData,
        to: normalizedTo,
      });
      
      return {
        ok: false,
        error: `WhatsApp API error (${response.status}): ${errorMessage}`,
      };
    }

    // Extract message ID from response
    const messageId = responseData.messages?.[0]?.id || undefined;

    return {
      ok: true,
      messageId,
    };
  } catch (error: any) {
    // Log failure with error details
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[WhatsApp Message] Request failed', {
      error: errorMessage,
      to: normalizedTo,
      payload: error instanceof Error ? undefined : error,
    });
    
    return {
      ok: false,
      error: `Request failed: ${errorMessage}`,
    };
  }
}

/**
 * Send a text message via WhatsApp Cloud API
 * @param to - Recipient phone number (with country code, e.g., +971501234567)
 * @param text - Message text content
 * @returns Promise resolving to API response
 * @throws Error if request fails
 */
export async function sendText(to: string, text: string): Promise<any> {
  const normalizedTo = normalizeWaNumber(to);
  
  const payload = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'text',
    text: {
      body: text,
    },
  };

  return sendWhatsAppRequest(payload);
}

/**
 * Send an interactive list message via WhatsApp Cloud API
 * @param to - Recipient phone number (with country code, e.g., +971501234567)
 * @param header - List header text
 * @param body - List body text
 * @param buttonText - Button text (e.g., "Select an option")
 * @param sections - Array of list sections, each containing rows
 * @returns Promise resolving to API response
 * @throws Error if request fails
 * 
 * @example
 * sendList(
 *   '+971501234567',
 *   'Choose a service',
 *   'Please select from the options below:',
 *   'View Options',
 *   [{
 *     title: 'Company Formation',
 *     rows: [
 *       { id: 'mainland', title: 'Mainland', description: 'For local market' },
 *       { id: 'freezone', title: 'Free Zone', description: 'For international' }
 *     ]
 *   }]
 * )
 */
export async function sendList(
  to: string,
  header: string,
  body: string,
  buttonText: string,
  sections: any[]
): Promise<any> {
  const normalizedTo = normalizeWaNumber(to);
  
  const payload = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: {
        type: 'text',
        text: header,
      },
      body: {
        text: body,
      },
      footer: {
        text: '',
      },
      action: {
        button: buttonText,
        sections: sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description || '',
          })),
        })),
      },
    },
  };

  return sendWhatsAppRequest(payload);
}

/**
 * Send an interactive button message via WhatsApp Cloud API
 * @param to - Recipient phone number (with country code, e.g., +971501234567)
 * @param bodyText - Message body text
 * @param buttons - Array of button objects with id and title
 * @returns Promise resolving to API response
 * @throws Error if request fails
 * 
 * @example
 * sendButtons(
 *   '+971501234567',
 *   'Would you like to proceed?',
 *   [
 *     { id: 'yes', title: 'Yes' },
 *     { id: 'no', title: 'No' }
 *   ]
 * )
 */
export async function sendButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<any> {
  const normalizedTo = normalizeWaNumber(to);
  
  // WhatsApp allows max 3 buttons
  if (buttons.length > 3) {
    throw new Error('WhatsApp buttons limit: maximum 3 buttons allowed');
  }

  if (buttons.length === 0) {
    throw new Error('At least one button is required');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: bodyText,
      },
      action: {
        buttons: buttons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      },
    },
  };

  return sendWhatsAppRequest(payload);
}

/**
 * Send a WhatsApp Flow message via WhatsApp Cloud API
 * @param to - Recipient phone number (with country code, e.g., +971501234567)
 * @returns Promise resolving to API response
 * @throws Error if request fails
 */
export async function sendWhatsAppFlow(to: string): Promise<any> {
  const normalizedTo = normalizeWaNumber(to);
  const flowId = process.env.WHATSAPP_FLOW_ID;
  
  if (!flowId) {
    throw new Error('WHATSAPP_FLOW_ID not configured in environment variables');
  }

  // Generate a random flow token
  let flowToken: string;
  try {
    // Use crypto.randomUUID() if available (Node.js 14.17.0+)
    // In Node.js, crypto is available as a global or via require
    if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && globalThis.crypto && 'randomUUID' in globalThis.crypto) {
      flowToken = (globalThis.crypto as any).randomUUID();
    } else {
      // Fallback: generate random string
      flowToken = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) +
                  Date.now().toString(36);
    }
  } catch {
    // Fallback if crypto is not available
    flowToken = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15) +
                Date.now().toString(36);
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'interactive',
    interactive: {
      type: 'flow',
      body: {
        text: 'Please answer a few quick questions and submit your enquiry.',
      },
      action: {
        name: 'flow',
        parameters: {
          flow_message_version: '3',
          flow_id: flowId,
          flow_token: flowToken,
          flow_cta: 'Start',
        },
      },
    },
  };

  return sendWhatsAppRequest(payload);
}

