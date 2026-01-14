import { NextRequest, NextResponse } from 'next/server';
import { fetchSearchPerformance, fetchTopQueries, fetchTopPages, getDateRange } from '@/lib/googleSearchConsole';
import { db } from '@/lib/db';

// Helper to get stored tokens from database
async function getStoredTokens() {
  try {
    const token = await db.googleAuthToken.findFirst();
    
    if (!token) {
      return null;
    }

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.expiresAt,
    };
  } catch (error) {
    console.error('Error fetching stored tokens:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'performance' | 'queries' | 'pages'
  const preset = (searchParams.get('preset') || '30d') as '7d' | '30d' | '90d' | 'custom';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const tokens = await getStoredTokens();

  if (!tokens) {
    return NextResponse.json(
      { error: 'Not authenticated. Please connect Google Search Console.' },
      { status: 401 }
    );
  }

  // Check if token is expired
  if (tokens.expiresAt && new Date() >= tokens.expiresAt) {
    return NextResponse.json(
      { error: 'Token expired. Please re-authenticate.' },
      { status: 401 }
    );
  }

  const dateRange = getDateRange(preset, startDate, endDate);

  try {
    switch (type) {
      case 'performance':
        const performance = await fetchSearchPerformance(
          tokens.accessToken,
          tokens.refreshToken || undefined,
          dateRange
        );
        return NextResponse.json({ data: performance, dateRange });

      case 'queries':
        const limit = parseInt(searchParams.get('limit') || '100');
        const queries = await fetchTopQueries(
          tokens.accessToken,
          tokens.refreshToken || undefined,
          dateRange,
          limit
        );
        return NextResponse.json({ data: queries, dateRange });

      case 'pages':
        const pageLimit = parseInt(searchParams.get('limit') || '50');
        const pages = await fetchTopPages(
          tokens.accessToken,
          tokens.refreshToken || undefined,
          dateRange,
          pageLimit
        );
        return NextResponse.json({ data: pages, dateRange });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching Search Console data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Search Console data' },
      { status: 500 }
    );
  }
}
