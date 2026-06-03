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
import type { SectorStats } from "@/lib/data"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function SectorChart({ data, title }: { data: SectorStats[]; title: string }) {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#84cc16", "#06b6d4", "#a855f7"]

  const chartData = {
    labels: data.map((d) => d.sector),
    datasets: [
      {
        label: "Avg Rating",
        data: data.map((d) => d.avg_rating),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, font: { size: 16 } },
    },
    scales: {
      x: { min: 1, max: 5, ticks: { stepSize: 1 } },
    },
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Bar data={chartData} options={options} />
    </div>
  )
}
