"use client";

import {
  CategoryScale,
  Chart,
  ChartData,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export function PortfolioChart({
  chartData,
}: {
  chartData: ChartData<"line", number[], string> | null;
}) {
  const chartRef = useRef<Chart<"line"> | undefined>(undefined);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart || !chartData) return;

    const gradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");

    chartData.datasets[0].backgroundColor = gradient;
    chart.update();
  }, [chartData]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
      },
    },
  };

  return chartData ? (
    <Line ref={chartRef} options={options} data={chartData} />
  ) : (
    <div>Loading...</div>
  );
}
