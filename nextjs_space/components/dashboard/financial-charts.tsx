
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

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

interface FinancialChartsProps {
  type: 'pie' | 'line'
  data: PieData[] | LineData[]
  title: string
  isEmpty?: boolean
}

function FinancialCharts({ type, data, title, isEmpty }: FinancialChartsProps) {
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

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              stroke="#1a1a1a"
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                title
              ]}
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ffffff'
              }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '11px', color: '#ffffff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'line') {
    const lineData = data as LineData[]

    return (
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="month" 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#ffffff' }}
              interval="preserveStartEnd"
              stroke="#2a2a2a"
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#ffffff' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              stroke="#2a2a2a"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const labels: { [key: string]: string } = {
                  income: 'Receitas',
                  expenses: 'Despesas', 
                  balance: 'Saldo'
                }
                return [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  labels[name] || name
                ]
              }}
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#ffffff'
              }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '11px', color: '#ffffff' }}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#00bf63" 
              strokeWidth={3}
              dot={{ fill: '#00bf63', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#00bf63', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#dc3545" 
              strokeWidth={3}
              dot={{ fill: '#dc3545', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#dc3545', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#6f42c1" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#6f42c1', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#6f42c1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

// Export default para que o dynamic import funcione corretamente
export default FinancialCharts
