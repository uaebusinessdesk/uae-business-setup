import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import type {
  SEOAnalysis,
  MetadataAnalysis,
  ContentAnalysis,
  LinkAnalysis,
  TechnicalAnalysis,
  AccessibilityAnalysis,
  SEORecommendation,
  LinkInfo,
  PageInfo,
} from '@/types/seo';

const SITE_DIR = path.join(process.cwd(), '..', 'site-html');
const BASE_URL = 'https://www.uaebusinessdesk.com';

// Page configuration
export const PAGES: PageInfo[] = [
  { path: '/', name: 'Homepage', filePath: 'index.html' },
  { path: '/mainland.html', name: 'Mainland Company Formation', filePath: 'mainland.html' },
  { path: '/freezone.html', name: 'Free Zone Company Formation', filePath: 'freezone.html' },
  { path: '/offshore.html', name: 'Offshore Company Formation', filePath: 'offshore.html' },
  { path: '/bank-account-setup.html', name: 'Bank Account Setup', filePath: 'bank-account-setup.html' },
  { path: '/contact.html', name: 'Contact', filePath: 'contact.html' },
  { path: '/disclaimer.html', name: 'Disclaimer', filePath: 'disclaimer.html' },
  { path: '/terms.html', name: 'Terms', filePath: 'terms.html' },
  { path: '/privacy.html', name: 'Privacy', filePath: 'privacy.html' },
];

/**
 * Read HTML file from site-html directory
 */
export function readHTMLFile(filePath: string): string | null {
  try {
    const fullPath = path.join(SITE_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract and analyze metadata
 */
export function analyzeMetadata(html: string, pagePath: string): MetadataAnalysis {
  const $ = cheerio.load(html);
  const recommendations: SEORecommendation[] = [];
  let score = 100;

  // Title tag
  const title = $('title').text().trim();
  const hasTitle = title.length > 0;
  const titleLength = title.length;
  const titleOptimal = titleLength >= 30 && titleLength <= 60;

  if (!hasTitle) {
    score -= 20;
    recommendations.push({
      priority: 'critical',
      category: 'metadata',
      issue: 'Missing title tag',
      recommendation: 'Add a title tag to the page',
      currentValue: 'Not present',
      suggestedValue: 'UAE Business Desk - [Page Name]',
    });
  } else if (!titleOptimal) {
    score -= 10;
    recommendations.push({
      priority: titleLength < 30 ? 'high' : 'medium',
      category: 'metadata',
      issue: `Title length is ${titleLength} characters (optimal: 30-60)`,
      recommendation: titleLength < 30
        ? 'Increase title length to at least 30 characters'
        : 'Reduce title length to 60 characters or less',
      currentValue: `${titleLength} characters`,
      suggestedValue: '30-60 characters',
    });
  }

  // Meta description
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const hasMetaDescription = metaDescription.length > 0;
  const metaDescriptionLength = metaDescription.length;
  const metaDescriptionOptimal = metaDescriptionLength >= 120 && metaDescriptionLength <= 160;

  if (!hasMetaDescription) {
    score -= 15;
    recommendations.push({
      priority: 'critical',
      category: 'metadata',
      issue: 'Missing meta description',
      recommendation: 'Add a meta description tag',
      currentValue: 'Not present',
      suggestedValue: '120-160 character description',
    });
  } else if (!metaDescriptionOptimal) {
    score -= 8;
    recommendations.push({
      priority: metaDescriptionLength < 120 ? 'high' : 'medium',
      category: 'metadata',
      issue: `Meta description length is ${metaDescriptionLength} characters (optimal: 120-160)`,
      recommendation: metaDescriptionLength < 120
        ? 'Increase meta description length to at least 120 characters'
        : 'Reduce meta description length to 160 characters or less',
      currentValue: `${metaDescriptionLength} characters`,
      suggestedValue: '120-160 characters',
    });
  }

  // Canonical URL
  const canonical = $('link[rel="canonical"]').attr('href');
  const hasCanonical = !!canonical;

  if (!hasCanonical) {
    score -= 10;
    recommendations.push({
      priority: 'high',
      category: 'metadata',
      issue: 'Missing canonical URL',
      recommendation: 'Add a canonical link tag',
      currentValue: 'Not present',
      suggestedValue: `<link rel="canonical" href="${BASE_URL}${pagePath}">`,
    });
  }

  // Open Graph tags
  const hasOGTitle = !!$('meta[property="og:title"]').attr('content');
  const hasOGDescription = !!$('meta[property="og:description"]').attr('content');
  const hasOGImage = !!$('meta[property="og:image"]').attr('content');
  const hasOGUrl = !!$('meta[property="og:url"]').attr('content');
  const hasOGType = !!$('meta[property="og:type"]').attr('content');

  if (!hasOGTitle) {
    score -= 5;
    recommendations.push({
      priority: 'high',
      category: 'metadata',
      issue: 'Missing Open Graph title',
      recommendation: 'Add og:title meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta property="og:title" content="...">`,
    });
  }

  if (!hasOGDescription) {
    score -= 5;
    recommendations.push({
      priority: 'high',
      category: 'metadata',
      issue: 'Missing Open Graph description',
      recommendation: 'Add og:description meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta property="og:description" content="...">`,
    });
  }

  if (!hasOGImage) {
    score -= 5;
    recommendations.push({
      priority: 'high',
      category: 'metadata',
      issue: 'Missing Open Graph image',
      recommendation: 'Add og:image meta tag with page-specific image',
      currentValue: 'Not present',
      suggestedValue: `<meta property="og:image" content="${BASE_URL}/assets/[page-image].jpg">`,
    });
  }

  if (!hasOGUrl) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Open Graph URL',
      recommendation: 'Add og:url meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta property="og:url" content="${BASE_URL}${pagePath}">`,
    });
  }

  if (!hasOGType) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Open Graph type',
      recommendation: 'Add og:type meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta property="og:type" content="website">`,
    });
  }

  // Twitter Card tags
  const hasTwitterCard = !!$('meta[name="twitter:card"]').attr('content');
  const hasTwitterTitle = !!$('meta[name="twitter:title"]').attr('content');
  const hasTwitterDescription = !!$('meta[name="twitter:description"]').attr('content');
  const hasTwitterImage = !!$('meta[name="twitter:image"]').attr('content');

  if (!hasTwitterCard) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Twitter Card type',
      recommendation: 'Add twitter:card meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta name="twitter:card" content="summary_large_image">`,
    });
  }

  if (!hasTwitterTitle) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Twitter title',
      recommendation: 'Add twitter:title meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta name="twitter:title" content="...">`,
    });
  }

  if (!hasTwitterDescription) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Twitter description',
      recommendation: 'Add twitter:description meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta name="twitter:description" content="...">`,
    });
  }

  if (!hasTwitterImage) {
    score -= 3;
    recommendations.push({
      priority: 'medium',
      category: 'metadata',
      issue: 'Missing Twitter image',
      recommendation: 'Add twitter:image meta tag',
      currentValue: 'Not present',
      suggestedValue: `<meta name="twitter:image" content="${BASE_URL}/assets/[page-image].jpg">`,
    });
  }

  // Language attribute
  const hasLanguage = !!$('html').attr('lang');

  if (!hasLanguage) {
    score -= 5;
    recommendations.push({
      priority: 'high',
      category: 'metadata',
      issue: 'Missing language attribute on html tag',
      recommendation: 'Add lang attribute to html tag',
      currentValue: 'Not present',
      suggestedValue: `<html lang="en">`,
    });
  }

  // Viewport meta tag
  const hasViewport = !!$('meta[name="viewport"]').attr('content');

  if (!hasViewport) {
    score -= 10;
    recommendations.push({
      priority: 'critical',
      category: 'metadata',
      issue: 'Missing viewport meta tag',
      recommendation: 'Add viewport meta tag for mobile responsiveness',
      currentValue: 'Not present',
      suggestedValue: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    });
  }

  return {
    hasTitle,
    titleLength,
    titleOptimal,
    hasMetaDescription,
    metaDescriptionLength,
    metaDescriptionOptimal,
    hasCanonical,
    canonicalUrl: canonical,
    hasOGTitle,
    hasOGDescription,
    hasOGImage,
    hasOGUrl,
    hasOGType,
    hasTwitterCard,
    hasTwitterTitle,
    hasTwitterDescription,
    hasTwitterImage,
    hasLanguage,
    hasViewport,
    score: Math.max(0, score),
    recommendations,
  };
}

/**
 * Analyze content structure
 */
export function analyzeContent(html: string): ContentAnalysis {
  const $ = cheerio.load(html);
  const recommendations: SEORecommendation[] = [];
  let score = 100;

  // H1 tag
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const hasH1 = h1Count > 0;
  const h1Text = hasH1 ? h1Elements.first().text().trim() : undefined;

  if (!hasH1) {
    score -= 20;
    recommendations.push({
      priority: 'critical',
      category: 'content',
      issue: 'Missing H1 tag',
      recommendation: 'Add an H1 tag with the primary keyword',
      currentValue: 'No H1 found',
      suggestedValue: '<h1>Page Title with Primary Keyword</h1>',
    });
  } else if (h1Count > 1) {
    score -= 10;
    recommendations.push({
      priority: 'high',
      category: 'content',
      issue: `Multiple H1 tags found (${h1Count})`,
      recommendation: 'Use only one H1 tag per page',
      currentValue: `${h1Count} H1 tags`,
      suggestedValue: '1 H1 tag',
    });
  }

  // Heading structure
  const headingStructure = {
    h1: $('h1').length,
    h2: $('h2').length,
    h3: $('h3').length,
    h4: $('h4').length,
    h5: $('h5').length,
    h6: $('h6').length,
  };

  // Content length (approximate - count text in body)
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const contentLength = bodyText.length;

  if (contentLength < 300) {
    score -= 10;
    recommendations.push({
      priority: 'medium',
      category: 'content',
      issue: `Content is too short (${contentLength} characters)`,
      recommendation: 'Add more content to improve SEO (minimum 300 characters recommended)',
      currentValue: `${contentLength} characters`,
      suggestedValue: '300+ characters',
    });
  }

  // Images
  const images = $('img');
  const imageCount = images.length;
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;

  images.each((_, img) => {
    const alt = $(img).attr('alt');
    if (alt !== undefined && alt.trim() !== '') {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
    }
  });

  if (imagesWithoutAlt > 0) {
    score -= Math.min(15, imagesWithoutAlt * 2);
    recommendations.push({
      priority: imagesWithoutAlt > 3 ? 'high' : 'medium',
      category: 'content',
      issue: `${imagesWithoutAlt} image(s) missing alt text`,
      recommendation: 'Add descriptive alt text to all images',
      currentValue: `${imagesWithoutAlt} images without alt`,
      suggestedValue: 'All images should have alt text',
    });
  }

  return {
    hasH1,
    h1Count,
    h1Text,
    headingStructure,
    contentLength,
    imageCount,
    imagesWithAlt,
    imagesWithoutAlt,
    score: Math.max(0, score),
    recommendations,
  };
}

/**
 * Analyze links
 */
export function analyzeLinks(html: string, pagePath: string): LinkAnalysis {
  const $ = cheerio.load(html);
  const recommendations: SEORecommendation[] = [];
  let score = 100;

  const links: LinkInfo[] = [];
  const brokenLinks: LinkInfo[] = [];
  let internalLinks = 0;
  let externalLinks = 0;

  // Find all links
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const text = $(element).text().trim() || $(element).attr('title') || '';
    
    // Exclude mailto:, tel:, and other protocol links from internal link checking
    const isProtocolLink = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('sms:') || href.startsWith('fax:');
    const isInternal = !isProtocolLink && (href.startsWith('/') || href.startsWith('./') || !href.startsWith('http'));

    if (isInternal) {
      internalLinks++;
    } else if (!isProtocolLink) {
      externalLinks++;
    }

    // Check if internal link is broken (skip protocol links)
    let isBroken = false;
    if (isInternal && !isProtocolLink) {
      const linkPath = href.replace(/^\.\//, '/').replace(/^\/+/, '/');
      const targetFile = linkPath === '/' ? 'index.html' : linkPath.replace(/^\/+/, '');
      const fullPath = path.join(SITE_DIR, targetFile);
      isBroken = !fs.existsSync(fullPath) && !targetFile.includes('#');
    }

    const linkInfo: LinkInfo = {
      href,
      text: text || href,
      isInternal,
      isBroken,
    };

    links.push(linkInfo);
    if (isBroken) {
      brokenLinks.push(linkInfo);
    }
  });

  if (brokenLinks.length > 0) {
    score -= Math.min(30, brokenLinks.length * 10);
    recommendations.push({
      priority: 'critical',
      category: 'links',
      issue: `${brokenLinks.length} broken internal link(s) found`,
      recommendation: 'Fix or remove broken links',
      currentValue: brokenLinks.map((l) => l.href).join(', '),
      suggestedValue: 'Update links to correct paths or remove',
    });
  }

  // Check for internal linking opportunities
  const servicePages = ['mainland.html', 'freezone.html', 'offshore.html', 'bank-account-setup.html'];
  const currentPage = pagePath.replace(/^\/+/, '').replace(/\.html$/, '');
  const linksToServicePages = links.filter(
    (l) => l.isInternal && servicePages.some((sp) => l.href.includes(sp))
  ).length;

  if (linksToServicePages < 2 && servicePages.some((sp) => sp.includes(currentPage))) {
    score -= 5;
    recommendations.push({
      priority: 'medium',
      category: 'links',
      issue: 'Limited internal linking to related service pages',
      recommendation: 'Add 2-3 contextual links to related service pages (mainland, freezone, offshore)',
      currentValue: `${linksToServicePages} cross-links found`,
      suggestedValue: '2-3 contextual internal links',
    });
  }

  return {
    totalLinks: links.length,
    internalLinks,
    externalLinks,
    brokenLinks,
    internalLinkOpportunities: [],
    score: Math.max(0, score),
    recommendations,
  };
}

/**
 * Analyze technical SEO
 */
export function analyzeTechnical(html: string): TechnicalAnalysis {
  const $ = cheerio.load(html);
  const recommendations: SEORecommendation[] = [];
  let score = 100;

  // Structured data (JSON-LD)
  const structuredDataScripts = $('script[type="application/ld+json"]');
  const hasStructuredData = structuredDataScripts.length > 0;
  let structuredDataType: string | undefined;

  if (hasStructuredData) {
    try {
      const firstScript = structuredDataScripts.first().html();
      if (firstScript) {
        const data = JSON.parse(firstScript);
        structuredDataType = data['@type'] || 'Unknown';
      }
    } catch (e) {
      // Invalid JSON-LD
    }
  } else {
    score -= 10;
    recommendations.push({
      priority: 'high',
      category: 'technical',
      issue: 'Missing structured data (JSON-LD)',
      recommendation: 'Add structured data for better search engine understanding',
      currentValue: 'Not present',
      suggestedValue: 'Add JSON-LD schema markup',
    });
  }

  // Sitemap reference (check in robots.txt or head)
  const hasSitemap = $('link[rel="sitemap"]').length > 0 || html.includes('sitemap');

  if (!hasSitemap) {
    score -= 5;
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      issue: 'No sitemap reference found',
      recommendation: 'Reference sitemap.xml in robots.txt or add sitemap link',
      currentValue: 'Not present',
      suggestedValue: 'Add sitemap reference',
    });
  }

  // Robots meta tag
  const hasRobotsMeta = !!$('meta[name="robots"]').attr('content');

  // Mobile responsiveness (check viewport)
  const viewport = $('meta[name="viewport"]').attr('content');
  const mobileResponsive = !!viewport && viewport.includes('width=device-width');

  if (!mobileResponsive) {
    score -= 15;
    recommendations.push({
      priority: 'critical',
      category: 'technical',
      issue: 'Missing or incorrect viewport meta tag for mobile',
      recommendation: 'Add proper viewport meta tag',
      currentValue: viewport || 'Not present',
      suggestedValue: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    });
  }

  return {
    hasStructuredData,
    structuredDataType,
    hasSitemap,
    hasRobotsMeta,
    mobileResponsive,
    score: Math.max(0, score),
    recommendations,
  };
}

/**
 * Analyze accessibility
 */
export function analyzeAccessibility(html: string): AccessibilityAnalysis {
  const $ = cheerio.load(html);
  const recommendations: SEORecommendation[] = [];
  let score = 100;

  // Images with/without alt
  const images = $('img');
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;

  images.each((_, img) => {
    const alt = $(img).attr('alt');
    if (alt !== undefined && alt.trim() !== '') {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
    }
  });

  if (imagesWithoutAlt > 0) {
    score -= Math.min(20, imagesWithoutAlt * 3);
    recommendations.push({
      priority: imagesWithoutAlt > 3 ? 'high' : 'medium',
      category: 'accessibility',
      issue: `${imagesWithoutAlt} image(s) missing alt text`,
      recommendation: 'Add descriptive alt text to all images for accessibility',
      currentValue: `${imagesWithoutAlt} images without alt`,
      suggestedValue: 'All images should have descriptive alt text',
    });
  }

  // ARIA labels
  const hasAriaLabels = $('[aria-label], [aria-labelledby]').length > 0;

  // Semantic HTML (check for semantic elements)
  const semanticElements = $('header, nav, main, article, section, aside, footer').length;
  const semanticHTML = semanticElements > 0;

  if (!semanticHTML) {
    score -= 10;
    recommendations.push({
      priority: 'medium',
      category: 'accessibility',
      issue: 'Limited use of semantic HTML elements',
      recommendation: 'Use semantic HTML elements (header, nav, main, article, section, footer)',
      currentValue: `${semanticElements} semantic elements found`,
      suggestedValue: 'Use semantic HTML elements for better accessibility',
    });
  }

  return {
    imagesWithAlt,
    imagesWithoutAlt,
    hasAriaLabels,
    semanticHTML,
    score: Math.max(0, score),
    recommendations,
  };
}

/**
 * Calculate overall SEO score
 */
export function calculateSEOScore(analysis: {
  metadata: MetadataAnalysis;
  content: ContentAnalysis;
  links: LinkAnalysis;
  technical: TechnicalAnalysis;
  accessibility: AccessibilityAnalysis;
}): number {
  const weights = {
    metadata: 0.30,
    content: 0.25,
    links: 0.20,
    technical: 0.15,
    accessibility: 0.10,
  };

  return Math.round(
    analysis.metadata.score * weights.metadata +
    analysis.content.score * weights.content +
    analysis.links.score * weights.links +
    analysis.technical.score * weights.technical +
    analysis.accessibility.score * weights.accessibility
  );
}

/**
 * Main analysis function
 */
export function analyzePage(pagePath: string): SEOAnalysis | null {
  const pageInfo = PAGES.find((p) => p.path === pagePath || p.filePath === pagePath);
  if (!pageInfo) {
    return null;
  }

  const html = readHTMLFile(pageInfo.filePath);
  if (!html) {
    return null;
  }

  const metadata = analyzeMetadata(html, pageInfo.path);
  const content = analyzeContent(html);
  const links = analyzeLinks(html, pageInfo.path);
  const technical = analyzeTechnical(html);
  const accessibility = analyzeAccessibility(html);

  const overallScore = calculateSEOScore({ metadata, content, links, technical, accessibility });

  // Combine all recommendations
  const allRecommendations = [
    ...metadata.recommendations,
    ...content.recommendations,
    ...links.recommendations,
    ...technical.recommendations,
    ...accessibility.recommendations,
  ].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    pagePath: pageInfo.path,
    pageName: pageInfo.name,
    overallScore,
    metadata,
    content,
    links,
    technical,
    accessibility,
    allRecommendations,
    analyzedAt: new Date(),
  };
}

/**
 * Analyze all pages
 */
export function analyzeAllPages(): SEOAnalysis[] {
  return PAGES.map((page) => analyzePage(page.path)).filter(
    (analysis): analysis is SEOAnalysis => analysis !== null
  );
}
