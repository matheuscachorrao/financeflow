'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Transaction } from '@/types/database'
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/utils'
import Modal from './Modal'
import TransactionForm from './TransactionForm'
import { Category } from '@/types/database'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  type: 'entrada' | 'saida'
}

export default function TransactionList({ transactions, categories, type }: TransactionListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    setDeletingId(id)
    await supabase.from('transactions').delete().eq('id', id)
    setDeletingId(null)
    router.refresh()
  }

  if (transactions.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm">Nenhuma {type === 'entrada' ? 'entrada' : 'saída'} encontrada</p>
        <p className="text-slate-400 text-xs mt-1">Comece adicionando sua primeira {type === 'entrada' ? 'entrada' : 'saída'}</p>
      </div>
    )
  }

  return (
    <>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">Descrição</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">Categoria</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">Pagamento</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">Data</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">Valor</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.description}</p>
                    {t.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{t.notes}</p>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {t.category ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: t.category.color + '20', color: t.category.color }}>
                      {t.category.icon} {t.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{PAYMENT_METHODS[t.payment_method]}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatDate(t.date)}</td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-sm font-semibold ${type === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                    {type === 'entrada' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditingTransaction(t)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTransaction && (
        <Modal title={`Editar ${type === 'entrada' ? 'entrada' : 'saída'}`} onClose={() => setEditingTransaction(null)}>
          <TransactionForm
            type={type}
            categories={categories}
            editData={editingTransaction}
            onSuccess={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </>
  )
}
