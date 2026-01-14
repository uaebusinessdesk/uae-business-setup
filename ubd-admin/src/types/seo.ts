export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type Category = 'metadata' | 'content' | 'links' | 'technical' | 'accessibility';

export interface SEORecommendation {
  priority: Priority;
  category: Category;
  issue: string;
  recommendation: string;
  currentValue?: string;
  suggestedValue?: string;
}

export interface MetadataAnalysis {
  hasTitle: boolean;
  titleLength: number;
  titleOptimal: boolean;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  metaDescriptionOptimal: boolean;
  hasCanonical: boolean;
  canonicalUrl?: string;
  hasOGTitle: boolean;
  hasOGDescription: boolean;
  hasOGImage: boolean;
  hasOGUrl: boolean;
  hasOGType: boolean;
  hasTwitterCard: boolean;
  hasTwitterTitle: boolean;
  hasTwitterDescription: boolean;
  hasTwitterImage: boolean;
  hasLanguage: boolean;
  hasViewport: boolean;
  score: number;
  recommendations: SEORecommendation[];
}

export interface ContentAnalysis {
  hasH1: boolean;
  h1Count: number;
  h1Text?: string;
  headingStructure: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  contentLength: number;
  imageCount: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  score: number;
  recommendations: SEORecommendation[];
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isBroken: boolean;
  target?: string;
}

export interface LinkAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: LinkInfo[];
  internalLinkOpportunities: string[];
  score: number;
  recommendations: SEORecommendation[];
}

export interface TechnicalAnalysis {
  hasStructuredData: boolean;
  structuredDataType?: string;
  hasSitemap: boolean;
  hasRobotsMeta: boolean;
  mobileResponsive: boolean;
  score: number;
  recommendations: SEORecommendation[];
}

export interface AccessibilityAnalysis {
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  hasAriaLabels: boolean;
  semanticHTML: boolean;
  score: number;
  recommendations: SEORecommendation[];
}

export interface SEOAnalysis {
  pagePath: string;
  pageName: string;
  overallScore: number;
  metadata: MetadataAnalysis;
  content: ContentAnalysis;
  links: LinkAnalysis;
  technical: TechnicalAnalysis;
  accessibility: AccessibilityAnalysis;
  allRecommendations: SEORecommendation[];
  analyzedAt: Date;
}

export interface PageInfo {
  path: string;
  name: string;
  filePath: string;
}
