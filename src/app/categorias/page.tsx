import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CategoriasClient from './CategoriasClient'

export default async function CategoriasPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('name')

  return <CategoriasClient categories={categories || []} />
}
