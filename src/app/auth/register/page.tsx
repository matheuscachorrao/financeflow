'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
    } else {
      if (data.session) {
        router.push('/dashboard')
      } else {
        setSuccess(true)
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Conta criada!</h2>
        <p className="text-slate-500 text-sm mb-6">Verifique seu e-mail para confirmar a conta.</p>
        <Link href="/auth/login" className="btn-primary justify-center">Ir para o login</Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Criar conta</h2>
      <p className="text-slate-500 text-sm mb-6">Comece a controlar suas finanças hoje</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input type="text" className="input" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input type="email" className="input" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Senha</label>
          <input type="password" className="input" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Já tem conta?{' '}
        <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">Entrar</Link>
      </p>
    </div>
  )
}
