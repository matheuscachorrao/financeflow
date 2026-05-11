'use client'

import { useState } from 'react'
import { Transaction, Category } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import TransactionList from '@/components/ui/TransactionList'
import TransactionForm from '@/components/ui/TransactionForm'
import Modal from '@/components/ui/Modal'

export default function SaidasClient({ transactions, categories }: { transactions: Transaction[], categories: Category[] }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saídas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gerencie seus gastos e despesas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova saída
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total de saídas</p>
          <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Quantidade</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{transactions.length} transações</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Média por transação</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{transactions.length ? formatCurrency(total / transactions.length) : 'R$ 0,00'}</p>
        </div>
      </div>

      <div className="relative">
        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" className="input pl-10" placeholder="Buscar por descrição ou categoria..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <TransactionList transactions={filtered} categories={categories} type="saida" />

      {showModal && (
        <Modal title="Nova saída" onClose={() => setShowModal(false)}>
          <TransactionForm type="saida" categories={categories} onSuccess={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  )
}
