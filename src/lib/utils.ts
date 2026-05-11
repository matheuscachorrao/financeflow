import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateFull(date: string | Date): string {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function getDateRange(period: 'hoje' | 'semana' | 'mes' | 'ano' | 'custom', customStart?: Date, customEnd?: Date) {
  const now = new Date()
  switch (period) {
    case 'hoje':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'semana':
      return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) }
    case 'mes':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'ano':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'custom':
      return {
        start: customStart ? startOfDay(customStart) : startOfMonth(now),
        end: customEnd ? endOfDay(customEnd) : endOfMonth(now),
      }
  }
}

export const PAYMENT_METHODS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'Pix',
  transferencia: 'Transferência',
  boleto: 'Boleto',
  outro: 'Outro',
}

export const CATEGORY_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
]

export const DEFAULT_CATEGORIES = {
  entrada: [
    { name: 'Salário', icon: '💼', color: '#22c55e' },
    { name: 'Freelance', icon: '💻', color: '#3b82f6' },
    { name: 'Investimentos', icon: '📈', color: '#f59e0b' },
    { name: 'Outros', icon: '💰', color: '#8b5cf6' },
  ],
  saida: [
    { name: 'Alimentação', icon: '🍽️', color: '#ef4444' },
    { name: 'Moradia', icon: '🏠', color: '#f97316' },
    { name: 'Transporte', icon: '🚗', color: '#06b6d4' },
    { name: 'Saúde', icon: '❤️', color: '#ec4899' },
    { name: 'Lazer', icon: '🎮', color: '#8b5cf6' },
    { name: 'Educação', icon: '📚', color: '#14b8a6' },
    { name: 'Outros', icon: '💸', color: '#6366f1' },
  ],
}
