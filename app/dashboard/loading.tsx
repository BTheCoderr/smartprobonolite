export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[500px]" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[500px]" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-64" />
      </div>
    </div>
  );
}
