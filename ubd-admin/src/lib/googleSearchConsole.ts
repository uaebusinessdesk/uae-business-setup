import { google } from 'googleapis';
import type { KeywordPerformance, SearchPerformance, PagePerformance, DateRange } from '@/types/seoAnalytics';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_SEARCH_CONSOLE_PROPERTY = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || 'sc-domain:uaebusinessdesk.com';
// Redirect URI - should match the one configured in Google Cloud Console
// For production, update this to your production URL
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://www.uaebusinessdesk.com/api/admin/seo/auth/callback'
    : 'http://localhost:3001/api/admin/seo/auth/callback');

// OAuth2 client setup
export function getOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// Get authorization URL for OAuth flow
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

// Exchange authorization code for tokens
export async function getAccessToken(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Set access token for API calls
export function setAccessToken(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

// Get authenticated Search Console client
export async function getSearchConsoleClient(accessToken: string, refreshToken?: string) {
  const auth = setAccessToken(accessToken, refreshToken);
  return google.searchconsole({ version: 'v1', auth });
}

// Fetch search performance data
export async function fetchSearchPerformance(
  accessToken: string,
  refreshToken: string | undefined,
  dateRange: DateRange
): Promise<SearchPerformance[]> {
  try {
    const searchConsole = await getSearchConsoleClient(accessToken, refreshToken);
    
    const response = await searchConsole.searchanalytics.query({
      siteUrl: GOOGLE_SEARCH_CONSOLE_PROPERTY,
      requestBody: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: ['date'],
        rowLimit: 10000,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row) => ({
      date: row.keys?.[0] || '',
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      ctr: row.ctr || 0,
      averagePosition: row.position || 0,
    }));
  } catch (error) {
    console.error('Error fetching search performance:', error);
    throw error;
  }
}

// Fetch top queries/keywords
export async function fetchTopQueries(
  accessToken: string,
  refreshToken: string | undefined,
  dateRange: DateRange,
  limit: number = 100
): Promise<KeywordPerformance[]> {
  try {
    const searchConsole = await getSearchConsoleClient(accessToken, refreshToken);
    
    const response = await searchConsole.searchanalytics.query({
      siteUrl: GOOGLE_SEARCH_CONSOLE_PROPERTY,
      requestBody: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row) => ({
      keyword: row.keys?.[0] || '',
      currentPosition: row.position || null,
      previousPosition: null, // Would need historical data
      positionChange: null,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      ctr: row.ctr || 0,
      targetPage: '', // Would need to fetch per-query page data
      optimizationScore: 0, // Calculated separately
      lastUpdated: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching top queries:', error);
    throw error;
  }
}

// Fetch top pages
export async function fetchTopPages(
  accessToken: string,
  refreshToken: string | undefined,
  dateRange: DateRange,
  limit: number = 50
): Promise<PagePerformance[]> {
  try {
    const searchConsole = await getSearchConsoleClient(accessToken, refreshToken);
    
    const response = await searchConsole.searchanalytics.query({
      siteUrl: GOOGLE_SEARCH_CONSOLE_PROPERTY,
      requestBody: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: ['page'],
        rowLimit: limit,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    const pages: PagePerformance[] = [];

    for (const row of response.data.rows) {
      const pageUrl = row.keys?.[0];
      if (!pageUrl) continue;

      // Fetch top queries for this page
      const queriesResponse = await searchConsole.searchanalytics.query({
        siteUrl: GOOGLE_SEARCH_CONSOLE_PROPERTY,
        requestBody: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          dimensions: ['query'],
          dimensionFilterGroups: [
            {
              filters: [
                {
                  dimension: 'page',
                  expression: pageUrl,
                },
              ],
            },
          ],
          rowLimit: 10,
        },
      });

      const topQueries: KeywordPerformance[] = queriesResponse.data.rows?.map((q) => ({
        keyword: q.keys?.[0] || '',
        currentPosition: q.position || null,
        previousPosition: null,
        positionChange: null,
        impressions: q.impressions || 0,
        clicks: q.clicks || 0,
        ctr: q.ctr || 0,
        targetPage: pageUrl,
        optimizationScore: 0,
        lastUpdated: new Date(),
      })) || [];

      pages.push({
        page: pageUrl,
        pageName: extractPageName(pageUrl),
        impressions: row.impressions || 0,
        clicks: row.clicks || 0,
        ctr: row.ctr || 0,
        averagePosition: row.position || 0,
        topQueries,
      });
    }

    return pages;
  } catch (error) {
    console.error('Error fetching top pages:', error);
    throw error;
  }
}

// Helper to extract page name from URL
function extractPageName(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path === '/' || path === '') return 'Homepage';
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Homepage';
    return lastSegment.replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  } catch {
    return url;
  }
}

// Calculate date range for preset
export function getDateRange(preset: '7d' | '30d' | '90d' | 'custom', customStart?: string, customEnd?: string): DateRange {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  
  const startDate = new Date();
  
  switch (preset) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'custom':
      if (customStart && customEnd) {
        return {
          startDate: customStart,
          endDate: customEnd,
        };
      }
      // Fallback to 30d if custom dates not provided
      startDate.setDate(endDate.getDate() - 30);
      break;
  }
  
  startDate.setHours(0, 0, 0, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
