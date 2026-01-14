'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SEOAnalysis, PageInfo } from '@/types/seo';

interface SEOInsightsClientProps {
  analysis: SEOAnalysis;
  allPagesAnalysis: SEOAnalysis[];
  pages: PageInfo[];
}

export default function SEOInsightsClient({
  analysis,
  allPagesAnalysis,
  pages,
}: SEOInsightsClientProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recommendations']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePageChange = (pagePath: string) => {
    router.push(`/admin/seo/insights?page=${encodeURIComponent(pagePath)}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'metadata':
        return '📋';
      case 'content':
        return '📝';
      case 'links':
        return '🔗';
      case 'technical':
        return '⚙️';
      case 'accessibility':
        return '♿';
      default:
        return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Page to Analyze
        </label>
        <select
          id="page-select"
          value={analysis.pagePath}
          onChange={(e) => handlePageChange(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {pages.map((page) => (
            <option key={page.path} value={page.path}>
              {page.name}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Score Card */}
      <div className={`bg-white rounded-xl shadow-sm p-8 border-2 ${getScoreBgColor(analysis.overallScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{analysis.pageName}</h2>
            <p className="text-sm text-gray-500">Overall SEO Score</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>
      </div>

      {/* Category Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Metadata</span>
            <span className="text-2xl">{getCategoryIcon('metadata')}</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.metadata.score)}`}>
            {analysis.metadata.score}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Content</span>
            <span className="text-2xl">{getCategoryIcon('content')}</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.content.score)}`}>
            {analysis.content.score}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Links</span>
            <span className="text-2xl">{getCategoryIcon('links')}</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.links.score)}`}>
            {analysis.links.score}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Technical</span>
            <span className="text-2xl">{getCategoryIcon('technical')}</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.technical.score)}`}>
            {analysis.technical.score}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Accessibility</span>
            <span className="text-2xl">{getCategoryIcon('accessibility')}</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.accessibility.score)}`}>
            {analysis.accessibility.score}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
              {analysis.allRecommendations.length}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.has('recommendations') ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has('recommendations') && (
          <div className="px-6 pb-6 space-y-4">
            {analysis.allRecommendations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recommendations. Great job! 🎉</p>
            ) : (
              analysis.allRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(rec.category)}</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityBadgeColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        {rec.category}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{rec.issue}</h4>
                  <p className="text-sm text-gray-600 mb-3">{rec.recommendation}</p>
                  {rec.currentValue && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500">Current:</span>
                      <div className="mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-gray-700 font-mono">
                        {rec.currentValue}
                      </div>
                    </div>
                  )}
                  {rec.suggestedValue && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Suggested:</span>
                      <div className="mt-1 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-gray-700 font-mono">
                        {rec.suggestedValue}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detailed Analysis Sections */}
      {[
        { key: 'metadata', title: 'Metadata Analysis', data: analysis.metadata },
        { key: 'content', title: 'Content Analysis', data: analysis.content },
        { key: 'links', title: 'Link Analysis', data: analysis.links },
        { key: 'technical', title: 'Technical SEO', data: analysis.technical },
        { key: 'accessibility', title: 'Accessibility', data: analysis.accessibility },
      ].map(({ key, title, data }) => (
        <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection(key)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(key)}</span>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                {data.score}/100
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.has(key) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has(key) && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4 mt-4">
              {key === 'metadata' && 'hasTitle' in data && (data as any).hasTitle !== undefined && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Title Tag:</span>
                      <span className={`ml-2 ${data.hasTitle ? 'text-green-600' : 'text-red-600'}`}>
                        {data.hasTitle ? '✓ Present' : '✗ Missing'}
                      </span>
                      {data.hasTitle && (
                        <div className="text-gray-600 mt-1">
                          Length: {data.titleLength} chars {data.titleOptimal ? '✓' : '⚠'}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Meta Description:</span>
                      <span
                        className={`ml-2 ${data.hasMetaDescription ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {data.hasMetaDescription ? '✓ Present' : '✗ Missing'}
                      </span>
                      {data.hasMetaDescription && (
                        <div className="text-gray-600 mt-1">
                          Length: {data.metaDescriptionLength} chars{' '}
                          {data.metaDescriptionOptimal ? '✓' : '⚠'}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Canonical URL:</span>
                      <span className={`ml-2 ${data.hasCanonical ? 'text-green-600' : 'text-red-600'}`}>
                        {data.hasCanonical ? '✓ Present' : '✗ Missing'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">OG Tags:</span>
                      <div className="mt-1 text-gray-600">
                        Title: {data.hasOGTitle ? '✓' : '✗'} | Description:{' '}
                        {data.hasOGDescription ? '✓' : '✗'} | Image: {data.hasOGImage ? '✓' : '✗'} |
                        URL: {data.hasOGUrl ? '✓' : '✗'} | Type: {data.hasOGType ? '✓' : '✗'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Twitter Cards:</span>
                      <div className="mt-1 text-gray-600">
                        Card: {data.hasTwitterCard ? '✓' : '✗'} | Title:{' '}
                        {data.hasTwitterTitle ? '✓' : '✗'} | Description:{' '}
                        {data.hasTwitterDescription ? '✓' : '✗'} | Image:{' '}
                        {data.hasTwitterImage ? '✓' : '✗'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Language/Viewport:</span>
                      <div className="mt-1 text-gray-600">
                        Lang: {data.hasLanguage ? '✓' : '✗'} | Viewport:{' '}
                        {data.hasViewport ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {key === 'content' && 'hasH1' in data && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">H1 Tag:</span>
                      <span className={`ml-2 ${data.hasH1 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.hasH1 ? `✓ Present (${data.h1Count})` : '✗ Missing'}
                      </span>
                      {data.h1Text && (
                        <div className="text-gray-600 mt-1 italic">"{data.h1Text}"</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Content Length:</span>
                      <span className="ml-2 text-gray-600">{data.contentLength} characters</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Heading Structure:</span>
                      <div className="mt-1 text-gray-600">
                        H1: {data.headingStructure.h1} | H2: {data.headingStructure.h2} | H3:{' '}
                        {data.headingStructure.h3}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Images:</span>
                      <div className="mt-1 text-gray-600">
                        Total: {data.imageCount} | With Alt: {data.imagesWithAlt} | Without Alt:{' '}
                        {data.imagesWithoutAlt}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {key === 'links' && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Total Links:</span>
                      <span className="ml-2 text-gray-600">{data.totalLinks}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Link Types:</span>
                      <div className="mt-1 text-gray-600">
                        Internal: {data.internalLinks} | External: {data.externalLinks}
                      </div>
                    </div>
                    {data.brokenLinks.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium text-red-700">Broken Links ({data.brokenLinks.length}):</span>
                        <div className="mt-2 space-y-1">
                          {data.brokenLinks.map((link, idx) => (
                            <div key={idx} className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs">
                              <span className="font-mono text-red-700">{link.href}</span>
                              {link.text && (
                                <span className="ml-2 text-gray-600">({link.text})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {key === 'technical' && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Structured Data:</span>
                      <span className={`ml-2 ${data.hasStructuredData ? 'text-green-600' : 'text-red-600'}`}>
                        {data.hasStructuredData ? `✓ Present (${data.structuredDataType || 'Unknown'})` : '✗ Missing'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sitemap:</span>
                      <span className={`ml-2 ${data.hasSitemap ? 'text-green-600' : 'text-yellow-600'}`}>
                        {data.hasSitemap ? '✓ Referenced' : '⚠ Not found'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Robots Meta:</span>
                      <span className={`ml-2 ${data.hasRobotsMeta ? 'text-green-600' : 'text-gray-600'}`}>
                        {data.hasRobotsMeta ? '✓ Present' : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mobile Responsive:</span>
                      <span className={`ml-2 ${data.mobileResponsive ? 'text-green-600' : 'text-red-600'}`}>
                        {data.mobileResponsive ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {key === 'accessibility' && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Image Alt Text:</span>
                      <div className="mt-1 text-gray-600">
                        With Alt: {data.imagesWithAlt} | Without Alt: {data.imagesWithoutAlt}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ARIA Labels:</span>
                      <span className={`ml-2 ${data.hasAriaLabels ? 'text-green-600' : 'text-gray-600'}`}>
                        {data.hasAriaLabels ? '✓ Present' : 'Not found'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Semantic HTML:</span>
                      <span className={`ml-2 ${data.semanticHTML ? 'text-green-600' : 'text-yellow-600'}`}>
                        {data.semanticHTML ? '✓ Used' : '⚠ Limited'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
