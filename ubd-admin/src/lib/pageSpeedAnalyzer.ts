import type { PageSpeedMetrics, CoreWebVitals } from '@/types/seoAnalytics';
import { PAGES } from './seoAnalyzer';

const BASE_URL = 'https://www.uaebusinessdesk.com';
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY; // Optional - free tier available

interface PageSpeedAPIResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null };
    };
    audits?: {
      'largest-contentful-paint'?: { numericValue: number | null };
      'first-input-delay'?: { numericValue: number | null };
      'cumulative-layout-shift'?: { numericValue: number | null };
      'server-response-time'?: { numericValue: number | null };
      'total-byte-weight'?: { numericValue: number | null };
      'network-requests'?: { numericValue: number | null };
      'uses-optimized-images'?: { score: number | null };
    };
  };
  loadingExperience?: {
    metrics?: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number };
      FIRST_INPUT_DELAY_MS?: { percentile: number };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile: number };
    };
  };
}

// Analyze Core Web Vitals
function analyzeCoreWebVitals(data: PageSpeedAPIResponse): CoreWebVitals {
  const audits = data.lighthouseResult?.audits || {};
  const metrics = data.loadingExperience?.metrics || {};

  // LCP (Largest Contentful Paint)
  const lcp = audits['largest-contentful-paint']?.numericValue || metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile || null;
  const lcpScore = lcp !== null ? (lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor') : null;

  // FID (First Input Delay) - Note: FID is deprecated, using INP in newer versions
  const fid = audits['first-input-delay']?.numericValue || metrics.FIRST_INPUT_DELAY_MS?.percentile || null;
  const fidScore = fid !== null ? (fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor') : null;

  // CLS (Cumulative Layout Shift)
  const cls = audits['cumulative-layout-shift']?.numericValue || metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || null;
  const clsScore = cls !== null ? (cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor') : null;

  return {
    lcp,
    fid,
    cls,
    lcpScore,
    fidScore,
    clsScore,
  };
}

// Generate performance recommendations
function generateRecommendations(data: PageSpeedAPIResponse): string[] {
  const recommendations: string[] = [];
  const audits = data.lighthouseResult?.audits || {};

  if (audits['uses-optimized-images']?.score !== null && audits['uses-optimized-images']!.score! < 0.9) {
    recommendations.push('Optimize images: Compress and use modern formats (WebP, AVIF)');
  }

  if (audits['server-response-time']?.numericValue && audits['server-response-time']!.numericValue! > 600) {
    recommendations.push('Improve server response time: Consider using a CDN or optimizing server configuration');
  }

  if (audits['total-byte-weight']?.numericValue && audits['total-byte-weight']!.numericValue! > 1600000) {
    recommendations.push('Reduce page size: Minify CSS/JS, remove unused code, enable compression');
  }

  const cwv = analyzeCoreWebVitals(data);
  if (cwv.lcpScore === 'poor' || cwv.lcpScore === 'needs-improvement') {
    recommendations.push('Improve LCP: Optimize images, reduce render-blocking resources, use efficient caching');
  }
  if (cwv.clsScore === 'poor' || cwv.clsScore === 'needs-improvement') {
    recommendations.push('Improve CLS: Set size attributes on images, avoid inserting content above existing content');
  }

  return recommendations;
}

// Analyze page speed using PageSpeed Insights API
export async function analyzePageSpeed(
  pagePath: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedMetrics | null> {
  try {
    const pageUrl = pagePath === '/' ? BASE_URL : `${BASE_URL}${pagePath}`;
    const apiUrl = PAGESPEED_API_KEY
      ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}`
      : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&strategy=${strategy}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`PageSpeed API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: PageSpeedAPIResponse = await response.json();
    const audits = data.lighthouseResult?.audits || {};
    const performanceScore = data.lighthouseResult?.categories?.performance?.score
      ? Math.round(data.lighthouseResult.categories.performance.score * 100)
      : 0;

    const coreWebVitals = analyzeCoreWebVitals(data);
    const recommendations = generateRecommendations(data);

    const pageInfo = PAGES.find((p) => p.path === pagePath);

    return {
      page: pagePath,
      pageName: pageInfo?.name || extractPageName(pagePath),
      performanceScore,
      mobileScore: strategy === 'mobile' ? performanceScore : null,
      desktopScore: strategy === 'desktop' ? performanceScore : null,
      coreWebVitals,
      loadTime: audits['largest-contentful-paint']?.numericValue || null,
      ttfb: audits['server-response-time']?.numericValue || null,
      totalPageSize: audits['total-byte-weight']?.numericValue || null,
      numberOfRequests: audits['network-requests']?.numericValue ? Math.round(audits['network-requests']!.numericValue!) : null,
      imageOptimizationScore: audits['uses-optimized-images']?.score
        ? Math.round(audits['uses-optimized-images']!.score! * 100)
        : null,
      lastAnalyzed: new Date(),
      recommendations,
    };
  } catch (error) {
    console.error(`Error analyzing page speed for ${pagePath}:`, error);
    return null;
  }
}

// Analyze all pages
export async function analyzeAllPagesSpeed(strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedMetrics[]> {
  const results: PageSpeedMetrics[] = [];

  for (const page of PAGES) {
    const metrics = await analyzePageSpeed(page.path, strategy);
    if (metrics) {
      results.push(metrics);
    }
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

// Helper to extract page name
function extractPageName(path: string): string {
  if (path === '/') return 'Homepage';
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'Homepage';
  return lastSegment.replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
