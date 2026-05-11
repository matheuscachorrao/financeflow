import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', session!.user.id)
    .order('date', { ascending: false })

  const userName = session?.user.user_metadata?.full_name?.split(' ')?.[0] || 'usuário'

  return <DashboardClient transactions={transactions || []} userName={userName} />
}
