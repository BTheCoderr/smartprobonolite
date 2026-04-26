export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
