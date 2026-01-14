import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import type { ContentQualityMetrics, KeywordPerformance } from '@/types/seoAnalytics';
import { readHTMLFile, PAGES } from './seoAnalyzer';

const SITE_DIR = path.join(process.cwd(), '..', 'site-html');

// Calculate Flesch Reading Ease score
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => {
    const wordLower = word.toLowerCase();
    const matches = wordLower.match(/[aeiouy]+/g);
    return count + (matches ? matches.length : 1);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Extract keywords from content
function extractKeywords(html: string, limit: number = 20): Record<string, number> {
  const $ = cheerio.load(html);
  const text = $('body').text().toLowerCase();
  
  // Remove HTML, get clean text
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3); // Filter short words

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'company', 'business', 'services', 'service', 'page', 'contact', 'more', 'click',
  ]);

  // Count word frequencies
  const wordCounts: Record<string, number> = {};
  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  // Get top keywords
  const sorted = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  const totalWords = words.length;
  const keywordDensity: Record<string, number> = {};
  sorted.forEach(([word, count]) => {
    keywordDensity[word] = Math.round((count / totalWords) * 10000) / 100; // Percentage with 2 decimals
  });

  return keywordDensity;
}

// Analyze content quality
export function analyzeContentQuality(pagePath: string): ContentQualityMetrics | null {
  const pageInfo = PAGES.find((p) => p.path === pagePath);
  if (!pageInfo) return null;

  const html = readHTMLFile(pageInfo.filePath);
  if (!html) return null;

  const $ = cheerio.load(html);
  const bodyText = $('body').text();
  const contentText = $('main, article, .content, .main-content').text() || bodyText;

  // Basic metrics
  const contentLength = contentText.length;
  const wordCount = contentText.split(/\s+/).filter((w) => w.length > 0).length;
  const readabilityScore = calculateReadability(contentText);

  // Heading analysis
  const hasH1 = $('h1').length > 0;
  const hasH2 = $('h2').length > 0;

  // Image analysis
  const images = $('img');
  const totalImages = images.length;
  const imagesWithAlt = images.filter((_, img) => {
    const alt = $(img).attr('alt');
    return alt !== undefined && alt.trim() !== '';
  }).length;
  const imageAltTextCoverage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100;

  // Link analysis
  const links = $('a[href]');
  const internalLinks = links.filter((_, link) => {
    const href = $(link).attr('href') || '';
    return href.startsWith('/') || href.startsWith('./') || !href.startsWith('http');
  }).length;
  const externalLinks = links.length - internalLinks;

  // Keyword analysis
  const keywordDensity = extractKeywords(html);
  const topKeywords = Object.keys(keywordDensity).slice(0, 10);

  // Calculate keyword optimization score (simplified)
  const keywordOptimizationScore = calculateKeywordOptimizationScore($, topKeywords);

  // Semantic keyword coverage (simplified - based on related terms)
  const semanticKeywordCoverage = calculateSemanticCoverage(contentText, topKeywords);

  return {
    page: pagePath,
    pageName: pageInfo.name,
    readabilityScore,
    contentLength,
    wordCount,
    keywordDensity,
    keywordOptimizationScore,
    semanticKeywordCoverage,
    hasH1,
    hasH2,
    imageAltTextCoverage,
    internalLinkCount: internalLinks,
    externalLinkCount: externalLinks,
    lastAnalyzed: new Date(),
  };
}

// Calculate keyword optimization score
function calculateKeywordOptimizationScore($: cheerio.CheerioAPI, topKeywords: string[]): number {
  let score = 0;
  const maxScore = 100;
  const pointsPerKeyword = maxScore / Math.max(topKeywords.length, 1);

  topKeywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase();
    const title = $('title').text().toLowerCase();
    const metaDescription = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
    const h1Text = $('h1').first().text().toLowerCase();
    const bodyText = $('body').text().toLowerCase();

    // Check if keyword appears in important places
    if (title.includes(keywordLower)) score += pointsPerKeyword * 0.3;
    if (metaDescription.includes(keywordLower)) score += pointsPerKeyword * 0.2;
    if (h1Text.includes(keywordLower)) score += pointsPerKeyword * 0.3;
    if (bodyText.includes(keywordLower)) score += pointsPerKeyword * 0.2;
  });

  return Math.min(100, Math.round(score));
}

// Calculate semantic keyword coverage (simplified)
function calculateSemanticCoverage(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let coverage = 0;

  keywords.forEach((keyword) => {
    if (contentLower.includes(keyword.toLowerCase())) {
      coverage += 100 / keywords.length;
    }
  });

  return Math.min(100, Math.round(coverage));
}

// Analyze all pages content quality
export function analyzeAllPagesContentQuality(): ContentQualityMetrics[] {
  return PAGES.map((page) => analyzeContentQuality(page.path)).filter((metrics): metrics is ContentQualityMetrics => metrics !== null);
}

// Calculate overall SEO score from various metrics
export function calculateOverallSeoScore(
  averagePosition: number | null,
  performanceScore: number,
  contentQuality: number,
  technicalScore: number
): number {
  let score = 0;
  let weight = 0;

  // Position score (inverse - lower position = higher score)
  if (averagePosition !== null) {
    const positionScore = averagePosition <= 10 ? 100 : averagePosition <= 20 ? 80 : averagePosition <= 50 ? 60 : 40;
    score += positionScore * 0.4; // 40% weight
    weight += 0.4;
  }

  // Performance score
  score += performanceScore * 0.2; // 20% weight
  weight += 0.2;

  // Content quality score
  score += contentQuality * 0.25; // 25% weight
  weight += 0.25;

  // Technical score
  score += technicalScore * 0.15; // 15% weight
  weight += 0.15;

  return weight > 0 ? Math.round(score / weight) : 0;
}
