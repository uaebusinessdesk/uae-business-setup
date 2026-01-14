// Advanced SEO Analytics Types

export interface KeywordPerformance {
  keyword: string;
  currentPosition: number | null;
  previousPosition: number | null;
  positionChange: number | null; // positive = moved up, negative = moved down
  impressions: number;
  clicks: number;
  ctr: number; // click-through rate
  targetPage: string;
  searchVolume?: number;
  optimizationScore: number; // 0-100
  lastUpdated: Date;
}

export interface SearchPerformance {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
}

export interface PagePerformance {
  page: string;
  pageName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  topQueries: KeywordPerformance[];
}

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint (ms)
  fid: number | null; // First Input Delay (ms)
  cls: number | null; // Cumulative Layout Shift
  lcpScore: 'good' | 'needs-improvement' | 'poor' | null;
  fidScore: 'good' | 'needs-improvement' | 'poor' | null;
  clsScore: 'good' | 'needs-improvement' | 'poor' | null;
}

export interface PageSpeedMetrics {
  page: string;
  pageName: string;
  performanceScore: number; // 0-100
  mobileScore: number | null;
  desktopScore: number | null;
  coreWebVitals: CoreWebVitals;
  loadTime: number | null; // ms
  ttfb: number | null; // Time to First Byte (ms)
  totalPageSize: number | null; // bytes
  numberOfRequests: number | null;
  imageOptimizationScore: number | null; // 0-100
  lastAnalyzed: Date;
  recommendations: string[];
}

export interface ContentQualityMetrics {
  page: string;
  pageName: string;
  readabilityScore: number; // Flesch Reading Ease (0-100)
  contentLength: number; // characters
  wordCount: number;
  keywordDensity: Record<string, number>; // keyword -> percentage
  keywordOptimizationScore: number; // 0-100
  semanticKeywordCoverage: number; // 0-100
  hasH1: boolean;
  hasH2: boolean;
  imageAltTextCoverage: number; // percentage
  internalLinkCount: number;
  externalLinkCount: number;
  lastAnalyzed: Date;
}

export interface CompetitorInsight {
  competitor: string;
  competitorUrl: string;
  sharedKeywords: number;
  keywordGaps: string[]; // keywords they rank for but we don't
  ourAdvantages: string[]; // keywords we rank for but they don't
  averagePositionDifference: number; // their position - our position
  domainAuthority?: number;
}

export interface AnalyticsOverview {
  averagePosition: number | null;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  pagesOnPage1: number; // pages ranking in positions 1-10
  overallSeoScore: number; // 0-100
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsDashboard {
  overview: AnalyticsOverview;
  searchPerformance: SearchPerformance[]; // time series data
  topKeywords: KeywordPerformance[];
  topPages: PagePerformance[];
  pageSpeedMetrics: PageSpeedMetrics[];
  contentQuality: ContentQualityMetrics[];
  competitorInsights: CompetitorInsight[];
  lastUpdated: Date;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'custom';
