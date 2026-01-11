import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SEOInsightsPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  // Mock data for page optimization insights
  // In production, this would fetch from an analytics API or database
  const pageInsights = [
    {
      page: '/',
      title: 'Homepage',
      loadTime: 1.2,
      score: 92,
      issues: ['Large image files', 'Unused CSS'],
      recommendations: ['Optimize hero images', 'Remove unused CSS rules'],
    },
    {
      page: '/mainland',
      title: 'Mainland Company Formation',
      loadTime: 1.5,
      score: 88,
      issues: ['Multiple large images', 'External font loading'],
      recommendations: ['Compress images', 'Use font-display: swap'],
    },
    {
      page: '/freezone',
      title: 'Free Zone Company Formation',
      loadTime: 1.3,
      score: 90,
      issues: ['Large background image'],
      recommendations: ['Use WebP format for background'],
    },
    {
      page: '/offshore',
      title: 'Offshore Company Formation',
      loadTime: 1.4,
      score: 89,
      issues: ['Multiple external scripts'],
      recommendations: ['Defer non-critical scripts'],
    },
    {
      page: '/bank-account-setup',
      title: 'Bank Account Setup',
      loadTime: 1.6,
      score: 85,
      issues: ['Large form assets', 'Multiple API calls'],
      recommendations: ['Lazy load form components', 'Batch API requests'],
    },
  ];

  return (
    <div className="bg-[#faf8f3] min-h-screen">
      <AdminNav />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-12 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Insights</h1>
                <p className="text-sm text-gray-500">Page optimization insights and recommendations</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {pageInsights.map((insight) => (
              <div key={insight.page} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{insight.page}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{insight.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Load Time</div>
                    <div className="text-lg font-semibold text-gray-900">{insight.loadTime}s</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Performance Score</div>
                    <div className="text-lg font-semibold text-gray-900">{insight.score}/100</div>
                  </div>
                </div>

                {insight.issues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Issues Found</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {insight.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-green-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These insights are based on performance metrics. For real-time data, 
              integrate with Google PageSpeed Insights API or similar services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
