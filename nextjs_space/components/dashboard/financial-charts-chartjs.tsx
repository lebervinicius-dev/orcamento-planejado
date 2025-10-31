

'use client'

import { useRef, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

interface PieData {
  name: string
  value: number
  color: string
}

interface LineData {
  month: string
  income: number
  expenses: number
  balance: number
}

interface FinancialChartsChartJSProps {
  type: 'pie' | 'line'
  data: PieData[] | LineData[]
  title: string
  isEmpty?: boolean
}

export default function FinancialChartsChartJS({ type, data, title, isEmpty }: FinancialChartsChartJSProps) {
  if (type === 'pie') {
    const pieData = data as PieData[]
    
    if (isEmpty || pieData.length === 0 || pieData.every(item => item.value === 0)) {
      return (
        <div className="flex items-center justify-center h-64 text-[#737373] bg-[#1a1a1a] rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white">Nenhuma transação para exibir</p>
            <p className="text-sm">Adicione {title.toLowerCase()} para ver o gráfico</p>
          </div>
        </div>
      )
    }

    const chartData = {
      labels: pieData.map(item => item.name),
      datasets: [
        {
          data: pieData.map(item => item.value),
          backgroundColor: pieData.map(item => item.color),
          borderColor: '#1a1a1a',
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: '#ffffff',
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#2a2a2a',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const label = context.label || ''
              const value = context.parsed || 0
              return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          }
        },
      },
    }

    return (
      <div className="h-[300px] transition-all duration-300">
        <Pie data={chartData} options={options} />
      </div>
    )
  }

  if (type === 'line') {
    const lineData = data as LineData[]

    const chartData = {
      labels: lineData.map(item => item.month),
      datasets: [
        {
          label: 'Receitas',
          data: lineData.map(item => item.income),
          borderColor: '#00bf63',
          backgroundColor: 'rgba(0, 191, 99, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00bf63',
          pointBorderColor: '#1a1a1a',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Despesas',
          data: lineData.map(item => item.expenses),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#dc3545',
          pointBorderColor: '#1a1a1a',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Saldo',
          data: lineData.map(item => item.balance),
          borderColor: '#6f42c1',
          backgroundColor: 'rgba(111, 66, 193, 0.1)',
          borderWidth: 3,
          borderDash: [5, 5],
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#6f42c1',
          pointBorderColor: '#1a1a1a',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#ffffff',
            padding: 15,
            font: {
              size: 11,
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#2a2a2a',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || 0
              return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            color: '#2a2a2a',
            drawBorder: false,
          },
          ticks: {
            color: '#ffffff',
            font: {
              size: 10,
            },
          },
        },
        y: {
          grid: {
            color: '#2a2a2a',
            drawBorder: false,
          },
          ticks: {
            color: '#ffffff',
            font: {
              size: 10,
            },
            callback: function(value: any) {
              return `R$ ${(value / 1000).toFixed(0)}k`
            }
          },
        },
      },
    }

    return (
      <div className="h-[400px] transition-all duration-300">
        <Line data={chartData} options={options} />
      </div>
    )
  }

  return null
}
