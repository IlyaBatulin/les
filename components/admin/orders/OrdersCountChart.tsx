"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import type { FC } from "react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface OrdersCountChartProps {
  data: Array<{ month: string; count: number }>
}

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Количество заказов по месяцам" },
  },
}

const OrdersCountChart: FC<OrdersCountChartProps> = ({ data }) => {
  const labels = data.map((d) => d.month)
  const counts = data.map((d) => d.count)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Заказы",
        data: counts,
        backgroundColor: "rgba(59,130,246,0.6)",
      },
    ],
  }

  return <Bar options={options} data={chartData} />
}

export default OrdersCountChart 