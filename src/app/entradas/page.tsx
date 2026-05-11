import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EntradasClient from './EntradasClient'

export default async function EntradasPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from('transactions').select('*, category:categories(*)').eq('user_id', session!.user.id).eq('type', 'entrada').order('date', { ascending: false }),
    supabase.from('categories').select('*').eq('user_id', session!.user.id).in('type', ['entrada', 'ambos']),
  ])

  return <EntradasClient transactions={transactions || []} categories={categories || []} />
}
