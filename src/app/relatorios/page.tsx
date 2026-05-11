import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import RelatoriosClient from './RelatoriosClient'

export default async function RelatoriosPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', session!.user.id)
    .order('date', { ascending: false })

  return <RelatoriosClient transactions={transactions || []} />
}
