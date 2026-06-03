export default function PainPointsChart({
  painPoints,
}: {
  painPoints: { issue: string; count: number; pct: number }[]
}) {
  const maxCount = Math.max(...painPoints.map((p) => p.count), 1)

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Top Pain Points</h3>
      <p className="text-xs text-gray-400 mb-3">
        Keywords from "cons" fields &mdash; 80%+ of reviews are in French, negative feedback is often brief
      </p>
      <div className="space-y-2">
        {painPoints.map((p) => (
          <div key={p.issue}>
            <div className="flex justify-between text-sm mb-0.5">
              <span className="text-gray-700 capitalize">{p.issue}</span>
              <span className="text-gray-400 text-xs">{p.count} ({p.pct}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${(p.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
