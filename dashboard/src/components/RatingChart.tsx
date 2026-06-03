"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import type { RatingDistribution } from "@/lib/data"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RatingChart({ data }: { data: RatingDistribution[] }) {
  const chartData = {
    labels: data.map((d) => `${d.rating} Star${d.rating > 1 ? "s" : ""}`),
    datasets: [
      {
        label: "Reviews",
        data: data.map((d) => d.count),
        backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"],
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Rating Distribution", font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Bar data={chartData} options={options} />
    </div>
  )
}
