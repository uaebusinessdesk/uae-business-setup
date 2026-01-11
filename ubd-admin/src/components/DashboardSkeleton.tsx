'use client';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-10 animate-pulse">
      {/* Time Filter Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Key Metrics Skeleton */}
      <div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-10 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-[300px]"
          >
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Revenue Metrics Skeleton */}
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

