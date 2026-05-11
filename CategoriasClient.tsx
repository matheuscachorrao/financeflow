'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Category } from '@/types/database'
import { CATEGORY_COLORS } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

const ICONS = ['💼', '💻', '📈', '🏠', '🚗', '🍽️', '❤️', '🎮', '📚', '✈️', '🛍️', '💰', '💸', '📱', '🎵', '🏋️', '☕', '🎁', '🔧', '💡']

export default function CategoriasClient({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState<'entrada' | 'saida' | 'ambos'>('saida')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [icon, setIcon] = useState('💰')

  const openCreate = () => {
    setEditingCategory(null)
    setName(''); setType('saida'); setColor(CATEGORY_COLORS[0]); setIcon('💰')
    setShowModal(true)
  }

  const openEdit = (c: Category) => {
    setEditingCategory(c)
    setName(c.name); setType(c.type as any); setColor(c.color); setIcon(c.icon)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingCategory) {
  await supabase.from('categories').update({
    name,
    type: type as any,
    color,
    icon
  }).eq('id', editingCategory.id)
} else {
  await supabase.from('categories').insert({
    user_id: user.id,
    name,
    type: type as any,
    color,
    icon
  })
}
    setLoading(false)
    setShowModal(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria? As transações vinculadas perderão a categoria.')) return
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  const entradas = categories.filter(c => c.type === 'entrada' || c.type === 'ambos')
  const saidas = categories.filter(c => c.type === 'saida' || c.type === 'ambos')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
          <p className="text-slate-500 text-sm mt-0.5">Organize suas transações por categoria</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova categoria
        </button>
      </div>

      {categories.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-slate-400 text-sm">Nenhuma categoria criada ainda.</p>
          <p className="text-slate-400 text-xs mt-1">Crie categorias para organizar suas finanças.</p>
        </div>
      )}

      {[{ label: 'Entradas', items: entradas }, { label: 'Saídas', items: saidas }].map(group => (
        group.items.length > 0 && (
          <div key={group.label}>
            <h2 className="font-semibold text-slate-700 mb-3">{group.label}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {group.items.map(c => (
                <div key={c.id} className="card p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: c.color + '20' }}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.type === 'ambos' ? 'Entrada / Saída' : c.type === 'entrada' ? 'Entrada' : 'Saída'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {showModal && (
        <Modal title={editingCategory ? 'Editar categoria' : 'Nova categoria'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input type="text" className="input" placeholder="Nome da categoria" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div>
              <label className="label">Ícone</label>
              <div className="grid grid-cols-10 gap-2">
                {ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setIcon(ic)} className={`text-xl p-1.5 rounded-lg transition-colors ${icon === ic ? 'bg-brand-100 ring-2 ring-brand-400' : 'hover:bg-slate-100'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={loading || !name.trim()} className="btn-primary w-full justify-center">
              {loading ? 'Salvando...' : 'Salvar categoria'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
