// loading.tsx — Suspense boundary para el dashboard
// Se muestra automáticamente mientras los Server Components cargan datos
export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded-xl w-64" />

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-200 rounded-[2rem]" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-80 bg-gray-200 rounded-[2rem]" />
        <div className="h-80 bg-gray-200 rounded-[2rem]" />
      </div>
    </div>
  );
}
