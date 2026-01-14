import { NextRequest, NextResponse } from 'next/server';
import { analyzeAllPagesContentQuality, calculateOverallSeoScore } from '@/lib/seoAnalytics';
import { analyzeAllPages } from '@/lib/seoAnalyzer';
import { analyzeAllPagesSpeed } from '@/lib/pageSpeedAnalyzer';
import { fetchSearchPerformance, fetchTopQueries, getDateRange } from '@/lib/googleSearchConsole';
import { db } from '@/lib/db';
import type { AnalyticsDashboard } from '@/types/seoAnalytics';

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
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const preset = (searchParams.get('preset') || '30d') as '7d' | '30d' | '90d' | 'custom';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const dateRange = getDateRange(preset, startDate, endDate);

  try {
    // Get content quality analysis
    const contentQuality = analyzeAllPagesContentQuality();

    // Get technical SEO scores
    const technicalAnalysis = analyzeAllPages();
    const avgTechnicalScore = technicalAnalysis.reduce((sum, a) => sum + a.technical.score, 0) / technicalAnalysis.length;

    // Get PageSpeed metrics (mobile)
    const pageSpeedMetrics = await analyzeAllPagesSpeed('mobile');

    // Try to get Google Search Console data
    const tokens = await getStoredTokens();
    let searchPerformance: any[] = [];
    let topKeywords: any[] = [];
    let avgPosition: number | null = null;
    let totalImpressions = 0;
    let totalClicks = 0;
    let pagesOnPage1 = 0;

    if (tokens && tokens.expiresAt && new Date() < tokens.expiresAt) {
      try {
        searchPerformance = await fetchSearchPerformance(
          tokens.accessToken,
          tokens.refreshToken || undefined,
          dateRange
        );

        topKeywords = await fetchTopQueries(
          tokens.accessToken,
          tokens.refreshToken || undefined,
          dateRange,
          100
        );

        // Calculate metrics
        if (searchPerformance.length > 0) {
          totalImpressions = searchPerformance.reduce((sum, p) => sum + p.impressions, 0);
          totalClicks = searchPerformance.reduce((sum, p) => sum + p.clicks, 0);
          const totalPosition = searchPerformance.reduce((sum, p) => sum + p.averagePosition * p.impressions, 0);
          avgPosition = totalImpressions > 0 ? totalPosition / totalImpressions : null;
        }

        // Count pages on page 1 (positions 1-10)
        pagesOnPage1 = topKeywords.filter((k) => k.currentPosition !== null && k.currentPosition <= 10).length;
      } catch (error) {
        console.error('Error fetching GSC data:', error);
        // Continue without GSC data
      }
    }

    // Calculate average CTR
    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Calculate overall SEO score
    const avgContentScore = contentQuality.reduce((sum, c) => sum + c.keywordOptimizationScore, 0) / contentQuality.length;
    const avgPerformanceScore = pageSpeedMetrics.length > 0
      ? pageSpeedMetrics.reduce((sum, p) => sum + p.performanceScore, 0) / pageSpeedMetrics.length
      : 0;

    const overallSeoScore = calculateOverallSeoScore(
      avgPosition,
      avgPerformanceScore,
      avgContentScore,
      avgTechnicalScore
    );

    const overview = {
      averagePosition: avgPosition,
      totalImpressions,
      totalClicks,
      averageCtr,
      pagesOnPage1,
      overallSeoScore,
      dateRange,
    };

    const dashboard: AnalyticsDashboard = {
      overview,
      searchPerformance,
      topKeywords,
      topPages: [], // Would need to fetch separately
      pageSpeedMetrics,
      contentQuality,
      competitorInsights: [], // Would need separate implementation
      lastUpdated: new Date(),
    };

    return NextResponse.json({ data: dashboard });
  } catch (error: any) {
    console.error('Error building analytics dashboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to build analytics dashboard' },
      { status: 500 }
    );
  }
}
