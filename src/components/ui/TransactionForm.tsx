'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Category, PaymentMethod, TransactionType } from '@/types/database'
import { PAYMENT_METHODS } from '@/lib/utils'

interface TransactionFormProps {
  type: TransactionType
  categories: Category[]
  editData?: {
    id: string
    amount: number
    description: string
    category_id: string | null
    payment_method: PaymentMethod
    date: string
    notes: string | null
  }
  onSuccess?: () => void
}

export default function TransactionForm({ type, categories, editData, onSuccess }: TransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const db = supabase as any
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [amount, setAmount] = useState(editData ? String(editData.amount) : '')
  const [description, setDescription] = useState(editData?.description || '')
  const [categoryId, setCategoryId] = useState(editData?.category_id || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editData?.payment_method || 'pix')
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState(editData?.notes || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      type,
      amount: parseFloat(amount.replace(',', '.')),
      description,
      category_id: categoryId || null,
      payment_method: paymentMethod,
      date,
      notes: notes || null,
    }

    let err
    if (editData) {
      const { error } = await db.from('transactions').update(payload).eq('id', editData.id)
      err = error
    } else {
      const { error } = await db.from('transactions').insert(payload)
      err = error
    }

    if (err) {
      setError('Erro ao salvar transação. Tente novamente.')
      setLoading(false)
    } else {
      if (onSuccess) onSuccess()
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Valor (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Data *</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="label">Descrição *</label>
        <input
          type="text"
          className="input"
          placeholder={type === 'entrada' ? 'Ex: Salário de março' : 'Ex: Conta de luz'}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Categoria</label>
          <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Forma de Pagamento</label>
          <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Observações</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Informações adicionais..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className={`btn-primary flex-1 justify-center ${type === 'entrada' ? '' : 'bg-red-600 hover:bg-red-700'}`}>
          {loading ? 'Salvando...' : editData ? 'Salvar alterações' : `Adicionar ${type === 'entrada' ? 'entrada' : 'saída'}`}
        </button>
      </div>
    </form>
  )
}
