'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsDashboard, KeywordPerformance, DateRangePreset } from '@/types/seoAnalytics';
import { format, subDays } from 'date-fns';

interface SEOAnalyticsClientProps {
  initialData?: AnalyticsDashboard;
}

export default function SEOAnalyticsClient({ initialData }: SEOAnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d');
  const [authStatus, setAuthStatus] = useState<'none' | 'connected' | 'error'>('none');

  useEffect(() => {
    if (searchParams.get('auth') === 'success') {
      setAuthStatus('connected');
      // Refresh data after auth
      fetchDashboard();
    } else if (searchParams.get('error')) {
      setAuthStatus('error');
    }
  }, [searchParams]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/seo/analytics?preset=${datePreset}`);
      if (response.ok) {
        const result = await response.json();
        setDashboard(result.data);
        setAuthStatus('connected');
      } else {
        const error = await response.json();
        if (error.error?.includes('Not authenticated') || error.error?.includes('Token expired')) {
          setAuthStatus('none');
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGSC = async () => {
    try {
      const response = await fetch('/api/admin/seo/auth');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    fetchDashboard();
  };

  if (loading && !dashboard) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <p className="text-gray-600 mb-4">Unable to load analytics data.</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, searchPerformance, topKeywords, pageSpeedMetrics, contentQuality } = dashboard;

  return (
    <div className="space-y-6">
      {/* Google Search Console Connection */}
      {authStatus === 'none' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">Connect Google Search Console</h3>
              <p className="text-sm text-yellow-700">
                Connect your Google Search Console to view search performance, keyword rankings, and impressions data.
              </p>
            </div>
            <button
              onClick={handleConnectGSC}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {authStatus === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">✓ Google Search Console connected</p>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Date Range:</label>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as DateRangePreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleDatePresetChange(preset)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  datePreset === preset
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset === '7d' ? '7 Days' : preset === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          {overview.dateRange && (
            <span className="text-sm text-gray-500 ml-auto">
              {format(new Date(overview.dateRange.startDate), 'MMM d')} -{' '}
              {format(new Date(overview.dateRange.endDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Average Position</div>
          <div className="text-3xl font-bold text-indigo-600">
            {overview.averagePosition ? overview.averagePosition.toFixed(1) : 'N/A'}
          </div>
          {overview.averagePosition && (
            <div className="text-xs text-gray-500 mt-1">
              {overview.averagePosition <= 10 ? '✓ On Page 1' : overview.averagePosition <= 20 ? 'Page 2' : 'Page 3+'}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Impressions</div>
          <div className="text-3xl font-bold text-gray-900">
            {overview.totalImpressions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Last {datePreset}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Clicks</div>
          <div className="text-3xl font-bold text-green-600">
            {overview.totalClicks.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Last {datePreset}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Average CTR</div>
          <div className="text-3xl font-bold text-blue-600">
            {overview.averageCtr.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Click-through rate</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Pages on Page 1</div>
          <div className="text-3xl font-bold text-purple-600">{overview.pagesOnPage1}</div>
          <div className="text-xs text-gray-500 mt-1">Ranking positions 1-10</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Overall SEO Score</div>
          <div className={`text-3xl font-bold ${
            overview.overallSeoScore >= 80 ? 'text-green-600' :
            overview.overallSeoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {overview.overallSeoScore}/100
          </div>
          <div className="text-xs text-gray-500 mt-1">Combined metrics</div>
        </div>
      </div>

      {/* Search Performance Chart */}
      {searchPerformance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={searchPerformance}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="impressions"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorImpressions)"
                name="Impressions"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorClicks)"
                name="Clicks"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="averagePosition"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Avg Position"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Keywords Table */}
      {topKeywords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Keywords</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topKeywords.slice(0, 20).map((keyword, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {keyword.currentPosition !== null ? (
                        <span className={`font-semibold ${
                          keyword.currentPosition <= 10 ? 'text-green-600' :
                          keyword.currentPosition <= 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          #{keyword.currentPosition}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {keyword.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {keyword.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {(keyword.ctr * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Page Speed Metrics */}
      {pageSpeedMetrics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Speed Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {pageSpeedMetrics.map((metric) => (
              <div key={metric.page} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">{metric.pageName}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Performance</span>
                  <span className={`text-2xl font-bold ${
                    metric.performanceScore >= 90 ? 'text-green-600' :
                    metric.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.performanceScore}
                  </span>
                </div>
                {metric.coreWebVitals.lcp !== null && (
                  <div className="mt-2 text-xs text-gray-500">
                    LCP: {metric.coreWebVitals.lcp.toFixed(0)}ms{' '}
                    <span className={
                      metric.coreWebVitals.lcpScore === 'good' ? 'text-green-600' :
                      metric.coreWebVitals.lcpScore === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }>
                      ({metric.coreWebVitals.lcpScore})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Quality Overview */}
      {contentQuality.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Quality Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Readability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Word Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alt Text
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contentQuality.map((content) => (
                  <tr key={content.page} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {content.pageName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className={
                        content.readabilityScore >= 60 ? 'text-green-600' :
                        content.readabilityScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {content.readabilityScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {content.wordCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className={
                        content.keywordOptimizationScore >= 80 ? 'text-green-600' :
                        content.keywordOptimizationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {content.keywordOptimizationScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {content.imageAltTextCoverage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {format(new Date(dashboard.lastUpdated), 'MMM d, yyyy HH:mm')}
      </div>
    </div>
  );
}
