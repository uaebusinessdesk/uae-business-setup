import { analyzePage, analyzeAllPages, PAGES } from '@/lib/seoAnalyzer';
import SEOInsightsClient from '@/components/SEOInsightsClient';
import type { SEOAnalysis } from '@/types/seo';

export default async function SEOInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const selectedPage = params?.page || '/';

  // Analyze the selected page
  const analysis = analyzePage(selectedPage);

  // Get all pages analysis for overview
  const allPagesAnalysis = analyzeAllPages();

  // Calculate overall statistics
  const overallStats = {
    averageScore: Math.round(
      allPagesAnalysis.reduce((sum, a) => sum + a.overallScore, 0) / allPagesAnalysis.length
    ),
    totalRecommendations: allPagesAnalysis.reduce(
      (sum, a) => sum + a.allRecommendations.length,
      0
    ),
    criticalIssues: allPagesAnalysis.reduce(
      (sum, a) => sum + a.allRecommendations.filter((r) => r.priority === 'critical').length,
      0
    ),
    highPriorityIssues: allPagesAnalysis.reduce(
      (sum, a) => sum + a.allRecommendations.filter((r) => r.priority === 'high').length,
      0
    ),
  };

  return (
    <div className="bg-[#faf8f3] min-h-screen">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-12 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Insights</h1>
                <p className="text-sm text-gray-500">
                  Comprehensive SEO analysis and optimization recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-indigo-600">{overallStats.averageScore}/100</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Recommendations</div>
              <div className="text-3xl font-bold text-gray-900">{overallStats.totalRecommendations}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200 bg-red-50">
              <div className="text-sm font-medium text-red-600 mb-1">Critical Issues</div>
              <div className="text-3xl font-bold text-red-600">{overallStats.criticalIssues}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200 bg-orange-50">
              <div className="text-sm font-medium text-orange-600 mb-1">High Priority</div>
              <div className="text-3xl font-bold text-orange-600">{overallStats.highPriorityIssues}</div>
            </div>
          </div>

          {/* Main Content */}
          {analysis ? (
            <SEOInsightsClient
              analysis={analysis}
              allPagesAnalysis={allPagesAnalysis}
              pages={PAGES}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
              <p className="text-gray-600">Page not found or could not be analyzed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
