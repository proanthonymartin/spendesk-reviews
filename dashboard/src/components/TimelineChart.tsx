"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import type { MonthlyStats } from "@/lib/data"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function TimelineChart({ data }: { data: MonthlyStats[] }) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Avg Rating",
        data: data.map((d) => d.avg_rating),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Rating Evolution Over Time", font: { size: 16 } },
    },
    scales: {
      y: { min: 1, max: 5, ticks: { stepSize: 1 } },
    },
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Line data={chartData} options={options} />
    </div>
  )
}
