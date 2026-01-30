import { google } from 'googleapis';

export type LeadRecord = {
  createdAt: string;
  leadRef: string;
  fullName: string;
  email?: string | null;
  whatsapp: string;
  serviceRequired: string;
  notes?: string | null;
  pageUrl?: string | null;
  source?: string | null;
};

const HEADER_ROW = [
  'Created At',
  'Lead Ref',
  'Full Name',
  'Email',
  'WhatsApp',
  'Service Required',
  'Notes',
  'Page URL',
  'Source',
];

const SHEETS_SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];

function getSheetName(): string {
  return process.env.GOOGLE_SHEETS_SHEET_NAME || 'Leads';
}

function getSpreadsheetId(): string {
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!sheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }
  return sheetId;
}

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SHEETS_CLIENT_EMAIL/GOOGLE_SHEETS_PRIVATE_KEY');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: SHEETS_SCOPE,
  });

  return google.sheets({ version: 'v4', auth });
}

async function ensureHeaderRow() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1`,
  });

  const firstRow = existing.data.values?.[0] || [];
  if (firstRow.length > 0) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [HEADER_ROW],
    },
  });
}

export async function appendLeadRow(record: LeadRecord) {
  await ensureHeaderRow();

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  const row = [
    record.createdAt,
    record.leadRef,
    record.fullName,
    record.email || '',
    record.whatsapp,
    record.serviceRequired,
    record.notes || '',
    record.pageUrl || '',
    record.source || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });
}

export async function listLeads(limit = 50): Promise<LeadRecord[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z`,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  const dataRows = rows.slice(1).map((row) => ({
    createdAt: String(row[0] || ''),
    leadRef: String(row[1] || ''),
    fullName: String(row[2] || ''),
    email: String(row[3] || ''),
    whatsapp: String(row[4] || ''),
    serviceRequired: String(row[5] || ''),
    notes: String(row[6] || ''),
    pageUrl: String(row[7] || ''),
    source: String(row[8] || ''),
  }));

  const trimmed = dataRows.filter((row) => row.fullName || row.whatsapp);
  return trimmed.slice(-limit).reverse();
}
