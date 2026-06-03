export default function KpiCards({
  avgRating,
  totalReviews,
  recommendationRate,
}: {
  avgRating: number
  totalReviews: number
  recommendationRate: number
}) {
  const cards = [
    {
      label: "Note moyenne",
      value: avgRating.toFixed(1),
      suffix: "/ 5",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Total avis",
      value: totalReviews.toString(),
      suffix: "",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Taux de recommandation",
      value: `${recommendationRate}%`,
      suffix: "",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} p-6 rounded-xl shadow-sm`}>
          <p className="text-sm text-gray-500 mb-1">{card.label}</p>
          <p className={`text-3xl font-bold ${card.color}`}>
            {card.value}
            <span className="text-lg text-gray-400 ml-1">{card.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
