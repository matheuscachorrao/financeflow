import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SaidasClient from './SaidasClient'

export default async function SaidasPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from('transactions').select('*, category:categories(*)').eq('user_id', session!.user.id).eq('type', 'saida').order('date', { ascending: false }),
    supabase.from('categories').select('*').eq('user_id', session!.user.id).in('type', ['saida', 'ambos']),
  ])

  return <SaidasClient transactions={transactions || []} categories={categories || []} />
}
