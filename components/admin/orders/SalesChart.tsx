"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import type { FC } from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface SalesChartProps {
  data: Array<{ month: string; total: number }>
}

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Продажи по месяцам (сумма)" },
  },
}

const SalesChart: FC<SalesChartProps> = ({ data }) => {
  const labels = data.map((d) => d.month)
  const totals = data.map((d) => d.total)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Сумма продаж (₽)",
        data: totals,
        borderColor: "rgba(34,197,94,0.8)",
        backgroundColor: "rgba(34,197,94,0.3)",
        fill: false,
      },
    ],
  }

  return <Line options={options} data={chartData} />
}

export default SalesChart 