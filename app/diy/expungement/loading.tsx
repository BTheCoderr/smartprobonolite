export default function ExpungementLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
