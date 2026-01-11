import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SEOAnalyticsPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  // Mock data for site visits by location/country
  // In production, this would fetch from Google Analytics API or similar
  const visitsByCountry = [
    { country: 'United Arab Emirates', visits: 1245, percentage: 45.2, flag: '🇦🇪' },
    { country: 'India', visits: 523, percentage: 19.0, flag: '🇮🇳' },
    { country: 'United Kingdom', visits: 312, percentage: 11.3, flag: '🇬🇧' },
    { country: 'United States', visits: 198, percentage: 7.2, flag: '🇺🇸' },
    { country: 'Saudi Arabia', visits: 156, percentage: 5.7, flag: '🇸🇦' },
    { country: 'Pakistan', visits: 134, percentage: 4.9, flag: '🇵🇰' },
    { country: 'Bangladesh', visits: 89, percentage: 3.2, flag: '🇧🇩' },
    { country: 'Philippines', visits: 67, percentage: 2.4, flag: '🇵🇭' },
    { country: 'Egypt', visits: 45, percentage: 1.6, flag: '🇪🇬' },
    { country: 'Other', visits: 87, percentage: 3.1, flag: '🌍' },
  ];

  const totalVisits = visitsByCountry.reduce((sum, item) => sum + item.visits, 0);

  return (
    <div className="bg-[#faf8f3] min-h-screen">
      <AdminNav />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-12 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Analytics</h1>
                <p className="text-sm text-gray-500">Site visits by location and country</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{totalVisits.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Total Visits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{visitsByCountry.length}</div>
                <div className="text-sm text-gray-500 mt-1">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {visitsByCountry[0].country}
                </div>
                <div className="text-sm text-gray-500 mt-1">Top Country</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Visits by Country</h2>
            <div className="space-y-4">
              {visitsByCountry.map((item, index) => (
                <div key={item.country} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{item.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.country}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {item.visits.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is sample data. For real-time analytics, integrate with 
              Google Analytics API, Vercel Analytics, or similar services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
