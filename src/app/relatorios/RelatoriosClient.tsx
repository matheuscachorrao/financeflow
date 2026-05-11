'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

export default function RelatoriosClient({ transactions }: { transactions: Transaction[] }) {
  const [year, setYear] = useState(new Date().getFullYear())

  const years = useMemo(() => {
    const ys = new Set(transactions.map(t => new Date(t.date).getFullYear()))
    return Array.from(ys).sort((a, b) => b - a)
  }, [transactions])

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(year, i, 1)
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      const inMonth = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }))
      const entradas = inMonth.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0)
      const saidas = inMonth.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0)
      return {
        mes: format(month, 'MMM', { locale: ptBR }),
        entradas,
        saidas,
        saldo: entradas - saidas,
      }
    })
  }, [transactions, year])

  const yearTotal = useMemo(() => {
    const filtered = transactions.filter(t => new Date(t.date).getFullYear() === year)
    const entradas = filtered.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0)
    const saidas = filtered.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [transactions, year])

  const categoryBreakdown = useMemo(() => {
    const filtered = transactions.filter(t => new Date(t.date).getFullYear() === year && t.type === 'saida')
    const map = new Map<string, { name: string, total: number, color: string }>()
    filtered.forEach(t => {
      const key = t.category_id || 'sem-cat'
      const name = t.category?.name || 'Sem categoria'
      const color = t.category?.color || '#94a3b8'
      if (!map.has(key)) map.set(key, { name, total: 0, color })
      map.get(key)!.total += t.amount
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [transactions, year])

  const totalSaidas = yearTotal.saidas

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análise detalhada das suas finanças</p>
        </div>
        <select className="input w-32" value={year} onChange={e => setYear(Number(e.target.value))}>
          {(years.length ? years : [new Date().getFullYear()]).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Year Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total de Entradas em {year}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(yearTotal.entradas)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total de Saídas em {year}</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(yearTotal.saidas)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Saldo do Ano</p>
          <p className={`text-2xl font-bold mt-1 ${yearTotal.saldo >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{formatCurrency(yearTotal.saldo)}</p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Entradas vs Saídas por Mês</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Resumo Mensal</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Mês</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Entradas</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Saídas</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {monthlyData.map(m => (
              <tr key={m.mes} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-medium text-slate-900 capitalize">{m.mes}</td>
                <td className="px-5 py-3 text-sm text-right text-green-600 font-medium">{m.entradas ? formatCurrency(m.entradas) : '—'}</td>
                <td className="px-5 py-3 text-sm text-right text-red-500 font-medium">{m.saidas ? formatCurrency(m.saidas) : '—'}</td>
                <td className={`px-5 py-3 text-sm text-right font-semibold ${m.saldo >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {(m.entradas || m.saidas) ? formatCurrency(m.saldo) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Gastos por Categoria em {year}</h2>
          <div className="space-y-3">
            {categoryBreakdown.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{c.name}</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(c.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((c.total / totalSaidas) * 100, 100)}%`, backgroundColor: c.color }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{((c.total / totalSaidas) * 100).toFixed(1)}% do total</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
