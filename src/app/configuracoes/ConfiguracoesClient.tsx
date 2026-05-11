'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Profile } from '@/types/database'

export default function ConfiguracoesClient({ session, profile }: { session: Session, profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(profile?.full_name || session.user.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passError, setPassError] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    const db = supabase as any
    await db.from('profiles').upsert({ id: session.user.id, email: session.user.email!, full_name: name })
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const handleChangePassword = async () => {
    setPassError('')
    if (newPass.length < 6) { setPassError('A nova senha deve ter ao menos 6 caracteres.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) setPassError('Erro ao atualizar senha.')
    else { setPassSaved(true); setNewPass(''); setCurrentPass(''); setTimeout(() => setPassSaved(false), 3000) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input bg-slate-50" value={session.user.email || ''} disabled />
            <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Alterar Senha</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Nova senha</label>
            <input type="password" className="input" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          {passError && <p className="text-sm text-red-600">{passError}</p>}
          {passSaved && <p className="text-sm text-green-600 font-medium">✓ Senha alterada com sucesso!</p>}
          <button onClick={handleChangePassword} className="btn-primary">Alterar senha</button>
        </div>
      </div>

      <div className="card p-6 border-red-200">
        <h2 className="font-semibold text-red-700 mb-1">Zona de Perigo</h2>
        <p className="text-sm text-slate-500 mb-4">Ações irreversíveis para sua conta.</p>
        <button onClick={handleLogout} className="btn-danger">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
