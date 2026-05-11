'use client'

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Transaction } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'

type Period = 'hoje' | 'semana' | 'mes' | 'ano' | 'custom'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function DashboardClient({ transactions, userName }: { transactions: Transaction[], userName: string }) {
  const [period, setPeriod] = useState<Period>('mes')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    let start: Date, end: Date

    switch (period) {
      case 'hoje': start = startOfDay(now); end = endOfDay(now); break
      case 'semana': start = startOfWeek(now, { locale: ptBR }); end = endOfWeek(now, { locale: ptBR }); break
      case 'mes': start = startOfMonth(now); end = endOfMonth(now); break
      case 'ano': start = startOfYear(now); end = endOfYear(now); break
      case 'custom':
        if (!customStart || !customEnd) return transactions
        start = startOfDay(new Date(customStart))
        end = endOfDay(new Date(customEnd))
        break
      default: return transactions
    }

    return transactions.filter(t => {
      const d = parseISO(t.date)
      return isWithinInterval(d, { start, end })
    })
  }, [transactions, period, customStart, customEnd])

  const totalEntradas = filtered.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0)
  const totalSaidas = filtered.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0)
  const saldo = totalEntradas - totalSaidas

  // Chart data - group by date
  const chartData = useMemo(() => {
    const map = new Map<string, { date: string, entradas: number, saidas: number }>()
    filtered.forEach(t => {
      const key = format(parseISO(t.date), 'dd/MM')
      if (!map.has(key)) map.set(key, { date: key, entradas: 0, saidas: 0 })
      const entry = map.get(key)!
      if (t.type === 'entrada') entry.entradas += t.amount
      else entry.saidas += t.amount
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filtered])

  // Pie data for categories
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    filtered.filter(t => t.type === 'saida').forEach(t => {
      const name = t.category?.name || 'Sem categoria'
      map.set(name, (map.get(name) || 0) + t.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [filtered])

  const recent = filtered.slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {userName}! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Aqui está o resumo das suas finanças</p>
        </div>
        {/* Period Filter */}
        <div className="flex items-center gap-2">
          {(['hoje', 'semana', 'mes', 'ano'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
            </button>
          ))}
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === 'custom' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Período
          </button>
        </div>
      </div>

      {/* Custom date filter */}
      {period === 'custom' && (
        <div className="card p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">De:</label>
            <input type="date" className="input w-auto" value={customStart} onChange={e => setCustomStart(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Até:</label>
            <input type="date" className="input w-auto" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Total de Entradas</span>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalEntradas)}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">↑ {filtered.filter(t => t.type === 'entrada').length} transações</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Total de Saídas</span>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSaidas)}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">↓ {filtered.filter(t => t.type === 'saida').length} transações</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Saldo Final</span>
            <div className={`w-8 h-8 ${saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
              <svg className={`w-4 h-4 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{formatCurrency(saldo)}</p>
          <p className={`text-xs mt-1 font-medium ${saldo >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {saldo >= 0 ? '✓ Saldo positivo' : '⚠ Saldo negativo'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="card p-5 col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Evolução Financeira</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `R$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" strokeWidth={2} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Nenhuma transação no período</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Saídas por Categoria</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 truncate max-w-[80px]">{c.name}</span>
                    </div>
                    <span className="font-medium text-slate-700">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Transações Recentes</h3>
          <span className="text-xs text-slate-400">{filtered.length} transações no período</span>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Nenhuma transação encontrada neste período</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <svg className={`w-4 h-4 ${t.type === 'entrada' ? 'text-green-600' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {t.type === 'entrada'
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                  <p className="text-xs text-slate-400">{t.category?.name || 'Sem categoria'} · {formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ${t.type === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'entrada' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
